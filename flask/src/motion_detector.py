# motion_detector.py

import numpy as np
from PIL import Image
import tensorflow as tf
import tensorflow_hub as hub
from tqdm import tqdm
from numpy.linalg import norm
from dtaidistance import dtw_ndim
import cv2
import imageio

# Load the MoveNet model
def load_model(model_name="movenet_lightning"):
    """
    Loads the MoveNet model from TensorFlow Hub.

    Args:
        model_name (str): The model variant to load.

    Returns:
        model: The loaded MoveNet model signature.
        input_size (int): The expected input size for the model.
    """
    if model_name == "movenet_lightning":
        module = hub.load("https://tfhub.dev/google/movenet/singlepose/lightning/4")
    elif model_name == "movenet_thunder":
        module = hub.load("https://tfhub.dev/google/movenet/singlepose/thunder/4")
    else:
        raise ValueError("Unsupported model name. Choose 'movenet_lightning' or 'movenet_thunder'.")

    input_size = 192 if model_name == "movenet_lightning" else 256
    model = module.signatures['serving_default']
    return model, input_size

# Dictionary mapping joint names to keypoint indices
KEYPOINT_DICT = {
    'nose': 0,
    'left_eye': 1,
    'right_eye': 2,
    'left_ear': 3,
    'right_ear': 4,
    'left_shoulder': 5,
    'right_shoulder': 6,
    'left_elbow': 7,
    'right_elbow': 8,
    'left_wrist': 9,
    'right_wrist': 10,
    'left_hip': 11,
    'right_hip': 12,
    'left_knee': 13,
    'right_knee': 14,
    'left_ankle': 15,
    'right_ankle': 16
}

# Edges connecting the keypoints for visualization
EDGES = {
    (0, 1), (0, 2), (1, 3), (2, 4),
    (0, 5), (0, 6), (5, 7), (7, 9),
    (6, 8), (8, 10), (5, 6), (5, 11),
    (6, 12), (11, 12), (11, 13), (13, 15),
    (12, 14), (14, 16)
}

# Confidence score to determine whether a keypoint prediction is reliable.
MIN_CROP_KEYPOINT_SCORE = 0.2

def movenet_inference(model, input_image):
    """
    Runs detection on an input image.

    Args:
        model: The MoveNet model signature.
        input_image (tf.Tensor): The input image tensor.

    Returns:
        np.ndarray: Keypoints with scores.
    """
    input_image = tf.cast(input_image, dtype=tf.int32)
    outputs = model(input_image)
    keypoints_with_scores = outputs['output_0'].numpy()
    return keypoints_with_scores

def init_crop_region(image_height, image_width):
    """Defines the default crop region."""
    if image_width > image_height:
        box_height = image_width / image_height
        box_width = 1.0
        y_min = (image_height / 2 - image_width / 2) / image_height
        x_min = 0.0
    else:
        box_height = 1.0
        box_width = image_height / image_width
        y_min = 0.0
        x_min = (image_width / 2 - image_height / 2) / image_width

    return {
        'y_min': y_min,
        'x_min': x_min,
        'y_max': y_min + box_height,
        'x_max': x_min + box_width,
        'height': box_height,
        'width': box_width
    }

def torso_visible(keypoints):
    """Checks whether there are enough torso keypoints."""
    return ((keypoints[0, 0, KEYPOINT_DICT['left_hip'], 2] > MIN_CROP_KEYPOINT_SCORE or
             keypoints[0, 0, KEYPOINT_DICT['right_hip'], 2] > MIN_CROP_KEYPOINT_SCORE) and
            (keypoints[0, 0, KEYPOINT_DICT['left_shoulder'], 2] > MIN_CROP_KEYPOINT_SCORE or
             keypoints[0, 0, KEYPOINT_DICT['right_shoulder'], 2] > MIN_CROP_KEYPOINT_SCORE))

def determine_torso_and_body_range(keypoints, target_keypoints, center_y, center_x):
    """Calculates the maximum distance from keypoints to the center."""
    torso_joints = ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip']
    max_torso_yrange = 0.0
    max_torso_xrange = 0.0
    for joint in torso_joints:
        dist_y = abs(center_y - target_keypoints[joint][0])
        dist_x = abs(center_x - target_keypoints[joint][1])
        max_torso_yrange = max(dist_y, max_torso_yrange)
        max_torso_xrange = max(dist_x, max_torso_xrange)

    max_body_yrange = 0.0
    max_body_xrange = 0.0
    for joint in KEYPOINT_DICT.keys():
        if keypoints[0, 0, KEYPOINT_DICT[joint], 2] < MIN_CROP_KEYPOINT_SCORE:
            continue
        dist_y = abs(center_y - target_keypoints[joint][0])
        dist_x = abs(center_x - target_keypoints[joint][1])
        max_body_yrange = max(dist_y, max_body_yrange)
        max_body_xrange = max(dist_x, max_body_xrange)

    return [max_torso_yrange, max_torso_xrange, max_body_yrange, max_body_xrange]

def determine_crop_region(keypoints, image_height, image_width):
    """Determines the region to crop the image for inference."""
    target_keypoints = {}
    for joint in KEYPOINT_DICT.keys():
        target_keypoints[joint] = [
            keypoints[0, 0, KEYPOINT_DICT[joint], 0] * image_height,
            keypoints[0, 0, KEYPOINT_DICT[joint], 1] * image_width
        ]

    if torso_visible(keypoints):
        center_y = (target_keypoints['left_hip'][0] +
                    target_keypoints['right_hip'][0]) / 2
        center_x = (target_keypoints['left_hip'][1] +
                    target_keypoints['right_hip'][1]) / 2

        (max_torso_yrange, max_torso_xrange,
         max_body_yrange, max_body_xrange) = determine_torso_and_body_range(
            keypoints, target_keypoints, center_y, center_x)

        crop_length_half = np.amax(
            [max_torso_xrange * 1.9, max_torso_yrange * 1.9,
             max_body_yrange * 1.2, max_body_xrange * 1.2])

        tmp = np.array(
            [center_x, image_width - center_x, center_y, image_height - center_y])
        crop_length_half = np.amin(
            [crop_length_half, np.amax(tmp)])

        crop_corner = [center_y - crop_length_half, center_x - crop_length_half]

        if crop_length_half > max(image_width, image_height) / 2:
            return init_crop_region(image_height, image_width)
        else:
            crop_length = crop_length_half * 2
            return {
                'y_min': crop_corner[0] / image_height,
                'x_min': crop_corner[1] / image_width,
                'y_max': (crop_corner[0] + crop_length) / image_height,
                'x_max': (crop_corner[1] + crop_length) / image_width,
                'height': crop_length / image_height,
                'width': crop_length / image_width
            }
    else:
        return init_crop_region(image_height, image_width)

def crop_and_resize(image, crop_region, crop_size):
    """Crops and resizes the image for model input."""
    boxes = [[crop_region['y_min'], crop_region['x_min'],
              crop_region['y_max'], crop_region['x_max']]]
    output_image = tf.image.crop_and_resize(
        image, box_indices=[0], boxes=boxes, crop_size=crop_size)
    return output_image

def run_inference(movenet_model, image, crop_region, crop_size):
    """Runs model inference on the cropped region."""
    image_height, image_width, _ = image.shape
    input_image = crop_and_resize(
        tf.expand_dims(image, axis=0), crop_region, crop_size=crop_size)
    keypoints_with_scores = movenet_inference(movenet_model, input_image)
    # Update the coordinates.
    for idx in range(17):
        keypoints_with_scores[0, 0, idx, 0] = (
            crop_region['y_min'] * image_height +
            crop_region['height'] * image_height * 
            keypoints_with_scores[0, 0, idx, 0]) / image_height
        keypoints_with_scores[0, 0, idx, 1] = (
            crop_region['x_min'] * image_width +
            crop_region['width'] * image_width * 
            keypoints_with_scores[0, 0, idx, 1]) / image_width

    return keypoints_with_scores

def extract_frames(video_path):
    """Extracts frames from a video file."""
    reader = imageio.get_reader(video_path)
    frames = []
    for frame in reader:
        frames.append(frame)
    reader.close()
    return frames

def extract_keypoints_and_crop(movenet_model, frames, input_size):
    """Extracts keypoints and adjusts crop regions for each frame."""
    num_frames = len(frames)
    image_height, image_width = frames[0].shape[:2]
    crop_region = init_crop_region(image_height, image_width)
    detected_keypoints = []

    for frame_idx in tqdm(range(num_frames), desc="Detecting keypoints"):
        image = np.array(Image.fromarray(frames[frame_idx]).convert("RGB"))
        keypoints_with_scores = run_inference(
            movenet_model, image, crop_region, crop_size=[input_size, input_size]
        )
        detected_keypoints.append(keypoints_with_scores)
        crop_region = determine_crop_region(
            keypoints_with_scores, image_height, image_width
        )

    return detected_keypoints

def align_sequences(seq1, seq2, path):
    """Aligns two sequences based on DTW path."""
    aligned_seq1 = []
    aligned_seq2 = []
    for i, j in path:
        aligned_seq1.append(seq1[i])
        aligned_seq2.append(seq2[j])
    return np.array(aligned_seq1), np.array(aligned_seq2)

def center_and_normalize_keypoints(keypoints):
    """Centers and normalizes keypoints for scale and position invariance."""
    centered_keypoints = []
    for frame in keypoints:
        keypoint_coords = frame[:, :2]
        keypoint_scores = frame[:, 2]
        # Use the midpoint between hips as the center
        left_hip = keypoint_coords[KEYPOINT_DICT['left_hip']]
        right_hip = keypoint_coords[KEYPOINT_DICT['right_hip']]
        center = (left_hip + right_hip) / 2
        # Center the keypoints
        centered_coords = keypoint_coords - center
        # Compute scale (distance between shoulders)
        left_shoulder = keypoint_coords[KEYPOINT_DICT['left_shoulder']]
        right_shoulder = keypoint_coords[KEYPOINT_DICT['right_shoulder']]
        scale = np.linalg.norm(left_shoulder - right_shoulder)
        if scale == 0:
            scale = 1  # Avoid division by zero
        # Normalize keypoints
        normalized_coords = centered_coords / scale
        # Combine normalized coordinates with scores
        normalized_frame = np.hstack((normalized_coords, keypoint_scores[:, None]))
        centered_keypoints.append(normalized_frame)
    return np.array(centered_keypoints)

def compute_cosine_similarity(reference_kpts, target_kpts):
    """Computes the overall cosine similarity between two keypoint sequences."""
    reference_kpts_flat = reference_kpts[:, :, :2].reshape(len(reference_kpts), -1)
    target_kpts_flat = target_kpts[:, :, :2].reshape(len(target_kpts), -1)
    # Compute cosine similarity for each frame
    cos_sim_frame = np.sum(reference_kpts_flat * target_kpts_flat, axis=1) / (
        norm(reference_kpts_flat, axis=1) * norm(target_kpts_flat, axis=1) + 1e-6)
    # Handle NaNs resulting from division by zero
    cos_sim_frame = np.nan_to_num(cos_sim_frame)
    # Compute overall cosine similarity
    overall_cos_sim = np.mean(cos_sim_frame)
    return overall_cos_sim

def compute_per_frame_keypoint_similarity(ref_kpts, target_kpts):
    """Computes per-frame, per-keypoint cosine similarities."""
    num_frames = ref_kpts.shape[0]
    per_frame_similarities = []
    for frame_idx in range(num_frames):
        ref_frame = ref_kpts[frame_idx, :, :2]
        target_frame = target_kpts[frame_idx, :, :2]
        similarities = np.sum(ref_frame * target_frame, axis=1) / (
            norm(ref_frame, axis=1) * norm(target_frame, axis=1) + 1e-6)
        per_frame_similarities.append(similarities)
    return np.array(per_frame_similarities)

def draw_prediction_on_image(image, keypoints_with_scores, keypoints_to_mark=None):
    """
    Draws the keypoint predictions on the image using OpenCV.

    Args:
        image (np.ndarray): The image array (BGR format).
        keypoints_with_scores (np.ndarray): Keypoints with scores.
        keypoints_to_mark (list, optional): List of keypoint indices to mark as incorrect.

    Returns:
        np.ndarray: The image with keypoints and edges drawn.
    """
    height, width, _ = image.shape

    keypoints = keypoints_with_scores[0, 0, :, :2] * [height, width]
    keypoints = keypoints.astype(int)
    scores = keypoints_with_scores[0, 0, :, 2]

    # Define colors
    COLOR_CORRECT = (0, 255, 0)    # Green
    COLOR_INCORRECT = (0, 0, 255)  # Red
    COLOR_PARTIAL = (0, 255, 255)  # Yellow
    COLOR_EDGE = (255, 0, 0)       # Blue

    # Draw keypoints
    for idx, (y, x) in enumerate(keypoints):
        if scores[idx] < MIN_CROP_KEYPOINT_SCORE:
            continue
        if keypoints_to_mark and idx in keypoints_to_mark:
            color = COLOR_INCORRECT  # Red for incorrect
            radius = 4
        else:
            color = COLOR_CORRECT    # Green for correct
            radius = 2
        cv2.circle(image, (x, y), radius, color, -1)

    # Draw edges
    for edge_pair in EDGES:
        idx1, idx2 = edge_pair
        if scores[idx1] < MIN_CROP_KEYPOINT_SCORE or scores[idx2] < MIN_CROP_KEYPOINT_SCORE:
            continue
        x1, y1 = keypoints[idx1]
        x2, y2 = keypoints[idx2]

        if keypoints_to_mark:
            start_incorrect = idx1 in keypoints_to_mark
            end_incorrect = idx2 in keypoints_to_mark

            if start_incorrect and end_incorrect:
                color = COLOR_INCORRECT  # Both keypoints incorrect
                thickness = 2
            elif start_incorrect or end_incorrect:
                color = COLOR_PARTIAL    # One keypoint incorrect
                thickness = 2
            else:
                color = COLOR_CORRECT    # Both keypoints correct
                thickness = 1
        else:
            color = COLOR_EDGE
            thickness = 1

        cv2.line(image, (x1, y1), (x2, y2), color, thickness)

    return image

def process_video(input_video_path, reference_video_path, output_video_path, movenet_model, input_size):
    """
    Processes the input video by comparing it with the reference video.

    Args:
        input_video_path (str): Path to the input video.
        reference_video_path (str): Path to the reference video.
        output_video_path (str): Path to save the processed video.
        movenet_model: The loaded MoveNet model signature.
        input_size (int): The input size for the model.

    Returns:
        float: The overall similarity score between the input and reference videos.
    """
    # Extract frames from both videos
    frames_input = extract_frames(input_video_path)
    frames_ref = extract_frames(reference_video_path)

    # Extract keypoints
    detected_keypoints_input = extract_keypoints_and_crop(movenet_model, frames_input, input_size)
    detected_keypoints_ref = extract_keypoints_and_crop(movenet_model, frames_ref, input_size)

    # Prepare keypoint arrays
    reference_kpts = np.array(detected_keypoints_ref).squeeze()
    target_kpts = np.array(detected_keypoints_input).squeeze()

    # Center and normalize keypoints
    reference_kpts_norm = center_and_normalize_keypoints(reference_kpts)
    target_kpts_norm = center_and_normalize_keypoints(target_kpts)

    # Compute the DTW warping path
    s_ref = reference_kpts_norm[:, :, :2].reshape(len(reference_kpts_norm), -1)
    s_target = target_kpts_norm[:, :, :2].reshape(len(target_kpts_norm), -1)
    warped_path = dtw_ndim.warping_path(s_ref, s_target)

    # Align keypoints using the warping paths
    aligned_ref_kpts, aligned_target_kpts = align_sequences(
        reference_kpts_norm, target_kpts_norm, warped_path)

    # Compute similarity scores
    overall_similarity = compute_cosine_similarity(aligned_ref_kpts, aligned_target_kpts)
    per_frame_keypoint_similarities = compute_per_frame_keypoint_similarity(aligned_ref_kpts, aligned_target_kpts)

    # Initialize VideoWriter
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    fps = 30  # You can set this to the desired FPS
    frame_height, frame_width = frames_input[0].shape[:2]
    out = cv2.VideoWriter(output_video_path, fourcc, fps, (frame_width, frame_height))

    # Overlay keypoints on frames
    for idx, (frame_idx_ref, frame_idx_target) in enumerate(tqdm(warped_path, desc="Processing video")):
        frame = frames_input[frame_idx_target].copy()
        keypoints = detected_keypoints_input[frame_idx_target]
        similarities = per_frame_keypoint_similarities[idx]
        keypoints_to_mark = [kpt_idx for kpt_idx, sim in enumerate(similarities) if sim < 0.9]

        # Convert frame to BGR if it's not already
        if frame.shape[2] == 4:
            frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGBA2BGR)
        elif frame.shape[2] == 3:
            frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        else:
            frame_bgr = frame.copy()

        frame_with_kpts = draw_prediction_on_image(frame_bgr, keypoints, keypoints_to_mark=keypoints_to_mark)

        out.write(frame_with_kpts)

    out.release()

    return float(overall_similarity)
