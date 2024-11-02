# test_upload.py

import requests
import os
import uuid
import argparse

def upload_video(file_path, server_url='http://localhost:8000/upload'):
    """
    Uploads a video to the Flask server and retrieves the processed video URL and similarity score.

    Args:
        file_path (str): Path to the video file to upload.
        server_url (str): URL of the Flask server's upload endpoint.

    Returns:
        dict: JSON response from the server containing the processed video URL and similarity score.
    """
    if not os.path.isfile(file_path):
        print(f"File not found: {file_path}")
        return None

    filename = os.path.basename(file_path)
    files = {'video': (filename, open(file_path, 'rb'), 'video/mp4')}

    print(f"Uploading {filename} to {server_url}...")
    try:
        response = requests.post(server_url, files=files)
    except requests.exceptions.RequestException as e:
        print(f"Error uploading video: {e}")
        return None

    if response.status_code == 200:
        print("Upload successful!")
        return response.json()
    else:
        print(f"Upload failed with status code {response.status_code}: {response.text}")
        return None

def download_video(url, save_dir='downloaded_videos'):
    """
    Downloads a video from a given URL.

    Args:
        url (str): URL of the video to download.
        save_dir (str): Directory to save the downloaded video.

    Returns:
        str: Path to the downloaded video file.
    """
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    filename = os.path.basename(url)
    save_path = os.path.join(save_dir, filename)

    print(f"Downloading processed video from {url}...")
    try:
        with requests.get(url, stream=True) as r:
            r.raise_for_status()
            total_length = r.headers.get('content-length')

            with open(save_path, 'wb') as f:
                if total_length is None:
                    f.write(r.content)
                else:
                    dl = 0
                    total_length = int(total_length)
                    for chunk in r.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
                            dl += len(chunk)
                            done = int(50 * dl / total_length)
                            print(f"\r[{'=' * done}{' ' * (50-done)}] {dl/total_length*100:.2f}%", end='')
        print("\nVideo downloaded and saved to", save_path)
        return save_path
    except requests.exceptions.RequestException as e:
        print(f"Error downloading video: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Test Flask Motion Tracker Upload")
    parser.add_argument('--video', type=str, required=True, help='Path to the video file to upload')
    parser.add_argument('--server', type=str, default='http://localhost:8000/upload', help='Flask server upload URL')
    parser.add_argument('--download_dir', type=str, default='downloaded_videos', help='Directory to save the downloaded video')

    args = parser.parse_args()

    video_path = args.video
    server_url = args.server
    download_dir = args.download_dir

    # Upload the video
    response = upload_video(video_path, server_url)

    if response:
        processed_video_url = response.get('processed_video_url')
        similarity_score = response.get('similarity_score')

        if processed_video_url:
            # Download the processed video
            downloaded_video_path = download_video(processed_video_url, save_dir=download_dir)
        else:
            print("Processed video URL not found in the response.")

        if similarity_score is not None:
            print(f"Similarity Score: {similarity_score:.4f}")
        else:
            print("Similarity score not found in the response.")

if __name__ == '__main__':
    main()
