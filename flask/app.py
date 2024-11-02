from flask import Flask, request, jsonify, send_from_directory, url_for
from flask_cors import CORS
import os
import uuid
from werkzeug.utils import secure_filename
from src.motion_detector import load_model, process_video
from src.database import db, User
import os

app = Flask(__name__)
CORS(app)

# Configure upload and processed folders
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
REFERENCE_VIDEO_PATH = './src/assets/pushup.mp4'  # Update this path as needed

# SQL Stuff
DATABASE_URL = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()


# Ensure folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

# Allowed video extensions
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROCESSED_FOLDER'] = PROCESSED_FOLDER

def allowed_file(filename):
    """Check if the file has an allowed extension."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Load the MoveNet model once when the server starts
movenet_model, input_size = load_model(model_name="movenet_lightning")

@app.route('/')
def index():
    return '''
    <h1>Motion Tracker Upload</h1>
    <form method="post" action="/upload" enctype="multipart/form-data">
      <input type="file" name="video">
      <input type="submit" value="Upload and Process">
    </form>
    '''

@app.route('/upload', methods=['POST'])
def upload_video():
    if 'video' not in request.files:
        return jsonify({'error': 'No video part in the request'}), 400

    file = request.files['video']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_id = uuid.uuid4().hex
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{unique_id}_{filename}")
        output_filename = f"processed_{unique_id}_{os.path.splitext(filename)[0]}.mp4"
        output_path = os.path.join(app.config['PROCESSED_FOLDER'], output_filename)
        file.save(input_path)

        # Check if reference video exists
        if not os.path.exists(REFERENCE_VIDEO_PATH):
            return jsonify({'error': f"Reference video not found at {REFERENCE_VIDEO_PATH}"}), 500

        # Process the video to detect and overlay keypoints, and compute similarity
        try:
            similarity_score = process_video(
                input_path, REFERENCE_VIDEO_PATH, output_path, movenet_model, input_size)
        except Exception as e:
            return jsonify({"error": f"Video processing failed: {str(e)}"}), 500

        # Generate the absolute URL to access the processed video
        processed_video_url = url_for('get_processed_video', filename=output_filename, _external=True)

        response = {
            'processed_video_url': processed_video_url,
            'similarity_score': similarity_score
        }

        return jsonify(response), 200
    else:
        return jsonify({'error': 'File type not allowed'}), 400

@app.route('/processed/<filename>', methods=['GET'])
def get_processed_video(filename):
    return send_from_directory(PROCESSED_FOLDER, filename)

@app.route('/update_score', methods=['POST'])
def update_score():
    data = request.get_json()
    new_score = data.get('score')

    if new_score is None:
        return jsonify({'error': 'Score not provided'}), 400

    user = User.query.first()  # Since there's only one user, retrieve the first record

    if user is None:
        user = User(score=new_score)
        db.session.add(user)
    else:
        user.score = new_score

    db.session.commit()
    return jsonify({'message': 'Score updated successfully', 'score': user.score}), 200

# Endpoint to retrieve the user's score
@app.route('/get_score', methods=['GET'])
def get_score():
    user = User.query.first()

    if user is None:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'score': user.score}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
