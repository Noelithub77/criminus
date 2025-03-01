import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  

from flask import Flask, render_template, Response, request, jsonify, send_from_directory
from tensorflow.keras.preprocessing.image import img_to_array
from tensorflow.keras.models import load_model
import numpy as np
import cv2
import cvlib as cv
import os
from werkzeug.utils import secure_filename
from collections import deque
import time

# Import the safety detection function
# Make sure the path is correct based on your project structure
try:
    from detect_gender_webcam import process_safety_frame
except ImportError:
    # Try with relative import if the above fails
    from OpenCV.detect_gender_webcam import process_safety_frame

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  
app.config['DEMO_FOLDER'] = os.path.dirname(os.path.abspath(__file__))

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

model = load_model('gender_detection.keras')
classes = ['man', 'woman']

# Store alert history for each session
alert_histories = {}

def process_frame(frame, session_id=None, safety_check=True):
    """
    Process a frame with gender detection and optional safety check
    
    Args:
        frame: The video frame to process
        session_id: Unique identifier for the session (for tracking alerts)
        safety_check: Whether to check for safety alerts
    
    Returns:
        processed frame with annotations
    """
    if safety_check and session_id is not None:
        # Initialize alert history for this session if it doesn't exist
        if session_id not in alert_histories:
            alert_histories[session_id] = deque(maxlen=5)
            
        # Process frame with safety detection
        processed_frame, alert_triggered, alert_histories[session_id] = process_safety_frame(
            frame, model, classes, alert_history=alert_histories[session_id]
        )
        return processed_frame
    else:
        # Original gender detection without safety alerts
        faces, confidence = cv.detect_face(frame, threshold=0.2)
        
        for idx, f in enumerate(faces):
            (startX, startY) = f[0], f[1]
            (endX, endY) = f[2], f[3]
            
            cv2.rectangle(frame, (startX, startY), (endX, endY), (0, 255, 0), 2)
            
            face_crop = np.copy(frame[startY:endY, startX:endX])
            
            if (face_crop.shape[0]) < 10 or (face_crop.shape[1]) < 10:
                continue
                
            face_crop = cv2.resize(face_crop, (96, 96))
            face_crop = face_crop.astype("float") / 255.0
            face_crop = img_to_array(face_crop)
            face_crop = np.expand_dims(face_crop, axis=0)
            
            conf = model.predict(face_crop)[0]
            idx = np.argmax(conf)
            label = f"{classes[idx]}: {conf[idx] * 100:.2f}%"
            
            Y = startY - 10 if startY - 10 > 10 else startY + 10
            cv2.putText(frame, label, (startX, Y), cv2.FONT_HERSHEY_SIMPLEX,
                        0.7, (0, 255, 0), 2)
        
        return frame

def generate_frames(source=0, session_id=None, safety_check=True):
    """
    Generate video frames with processing
    
    Args:
        source: Video source (0 for webcam, or file path)
        session_id: Unique identifier for the session
        safety_check: Whether to check for safety alerts
    """
    print(f"Opening video source: {source}")
    
    try:
        if isinstance(source, str):
            # For video files, use absolute path
            abs_path = os.path.abspath(source)
            print(f"Attempting to open video file: {abs_path}")
            cap = cv2.VideoCapture(abs_path)
        else:
            # For webcam
            print("Opening webcam")
            cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print(f"Error: Could not open video source {source}")
            return
        
        # Set video properties for better performance
        if not isinstance(source, str):  # Only set these for webcam
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            cap.set(cv2.CAP_PROP_FPS, 30)
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        
        frame_count = 0
        while True:
            success, frame = cap.read()
            if not success:
                if isinstance(source, str):  # If it's a video file
                    print(f"Resetting video to start (frame count: {frame_count})")
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)  # Reset to beginning
                    success, frame = cap.read()  # Try reading again
                    frame_count = 0
                    if not success:
                        print("Error: Could not loop video")
                        break
                else:
                    print("Error: Could not read frame from webcam")
                    break
            
            frame_count += 1
            
            # Resize for consistent processing
            frame = cv2.resize(frame, (640, 480))
            
            # Process the frame
            output_frame = process_frame(frame, session_id, safety_check)
            
            # Encode for streaming
            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 85]
            ret, buffer = cv2.imencode('.jpg', output_frame, encode_param)
            if not ret:
                print("Error: Could not encode frame")
                continue
                
            frame = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            
            # Add a small delay for video files to control playback speed
            if isinstance(source, str):
                time.sleep(1/60)  # Limit to roughly 30 FPS
            
    except Exception as e:
        print(f"Error in generate_frames: {str(e)}")
        import traceback
        traceback.print_exc()
        
    finally:
        print("Closing video capture")
        cap.release()
        
        # Clean up alert history when stream ends
        if session_id in alert_histories:
            del alert_histories[session_id]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    """Stream from webcam or demo video with safety detection"""
    session_id = request.args.get('session_id', 'webcam')
    demo_video = request.args.get('demo')
    
    if demo_video:
        if demo_video not in ['video.mp4', 'video2.mp4']:
            return jsonify({'error': 'Invalid demo video'}), 400
            
        video_path = os.path.join(app.config['DEMO_FOLDER'], demo_video)
        print(f"Loading demo video from: {video_path}")
        if not os.path.exists(video_path):
            print(f"Demo video not found at: {video_path}")
            return jsonify({'error': 'Demo video not found'}), 404
            
        return Response(generate_frames(video_path, session_id=session_id, safety_check=True),
                      mimetype='multipart/x-mixed-replace; boundary=frame')
    
    return Response(generate_frames(0, session_id=session_id, safety_check=True),
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/video_feed_basic')
def video_feed_basic():
    """Stream from webcam or demo video without safety detection"""
    demo_video = request.args.get('demo')
    
    if demo_video:
        if demo_video not in ['video.mp4', 'video2.mp4']:
            return jsonify({'error': 'Invalid demo video'}), 400
            
        video_path = os.path.join(app.config['DEMO_FOLDER'], demo_video)
        print(f"Loading demo video from: {video_path}")
        if not os.path.exists(video_path):
            print(f"Demo video not found at: {video_path}")
            return jsonify({'error': 'Demo video not found'}), 404
            
        return Response(generate_frames(video_path, safety_check=False),
                      mimetype='multipart/x-mixed-replace; boundary=frame')
    
    return Response(generate_frames(0, safety_check=False),
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/process_video', methods=['POST'])
def process_video():
    """Process uploaded video or demo video with safety detection"""
    # Check if this is a demo video request
    demo_video = request.args.get('demo')
    if demo_video:
        if demo_video not in ['video.mp4', 'video2.mp4']:
            return jsonify({'error': 'Invalid demo video'}), 400
        
        filepath = os.path.join(app.config['DEMO_FOLDER'], demo_video)
        if not os.path.exists(filepath):
            return jsonify({'error': 'Demo video not found'}), 404
            
        session_id = request.args.get('session_id', f"demo_{int(time.time())}")
        return Response(generate_frames(filepath, session_id=session_id),
                       mimetype='multipart/x-mixed-replace; boundary=frame')
    
    # Handle uploaded video
    if 'video' not in request.files:
        return jsonify({'error': 'No video file uploaded'}), 400
    
    video = request.files['video']
    if video.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if video:
        filename = secure_filename(video.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        video.save(filepath)
        
        session_id = request.args.get('session_id', f"video_{filename}_{int(time.time())}")
        
        return Response(generate_frames(filepath, session_id=session_id),
                       mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/check_alert_status')
def check_alert_status():
    """API endpoint to check if an alert is active for a session"""
    session_id = request.args.get('session_id')
    
    if not session_id or session_id not in alert_histories:
        return jsonify({'alert': False})
    
    # Check if alert is triggered (all elements in the queue are True)
    alert_triggered = len(alert_histories[session_id]) == alert_histories[session_id].maxlen and all(alert_histories[session_id])
    
    return jsonify({
        'alert': alert_triggered,
        'message': 'Woman potentially unsafe' if alert_triggered else ''
    })

if __name__ == '__main__':
    app.run(debug=True) 
