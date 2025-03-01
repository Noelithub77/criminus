from collections import deque
from tensorflow.keras.preprocessing.image import img_to_array
from tensorflow.keras.models import load_model
import numpy as np
import cv2
import cvlib as cv

# function to calculate distance between two faces
def calculate_distance(face1, face2):
    center1 = ((face1[0] + face1[2]) // 2, (face1[1] + face1[3]) // 2)
    center2 = ((face2[0] + face2[2]) // 2, (face2[1] + face2[3]) // 2)
    distance = np.sqrt((center1[0] - center2[0]) ** 2 + (center1[1] - center2[1]) ** 2)
    return distance

def process_safety_frame(frame, model, classes=['man', 'woman'], n=1, distance_threshold=100, alert_history=None):
    """
    Process a frame to detect if women are surrounded by men (potentially unsafe situation)
    
    Args:
        frame: The video frame to process
        model: The gender detection model
        classes: List of gender classes ['man', 'woman']
        n: Minimum number of males to trigger alert
        distance_threshold: Distance threshold for proximity detection
        alert_history: Deque object to track alerts across frames (if None, creates a new one)
        
    Returns:
        tuple: (processed_frame, is_alert_triggered, alert_history)
    """
    if alert_history is None:
        alert_history = deque(maxlen=5)  # Track alerts for 5 frames
    
    # apply face detection
    faces, confidence = cv.detect_face(frame, threshold=0.2)
    
    genders = []
    
    # loop through detected faces
    for idx, f in enumerate(faces):
        # get corner points of face rectangle        
        (startX, startY) = f[0], f[1]
        (endX, endY) = f[2], f[3]
        
        # draw rectangle over face
        cv2.rectangle(frame, (startX, startY), (endX, endY), (0, 255, 0), 2)
        
        # crop the detected face region
        face_crop = np.copy(frame[startY:endY, startX:endX])
        
        if (face_crop.shape[0]) < 10 or (face_crop.shape[1]) < 10:
            continue
            
        # preprocessing for gender detection model
        face_crop = cv2.resize(face_crop, (96, 96))
        face_crop = face_crop.astype("float") / 255.0
        face_crop = img_to_array(face_crop)
        face_crop = np.expand_dims(face_crop, axis=0)
        
        # apply gender detection on face
        conf = model.predict(face_crop)[0]
        
        # get label with max accuracy
        idx = np.argmax(conf)
        label = classes[idx]
        
        genders.append((label, f))
        
        label = "{}: {:.2f}%".format(label, conf[idx] * 100)
        
        Y = startY - 10 if startY - 10 > 10 else startY + 10
        
        # write label and confidence above face rectangle
        cv2.putText(frame, label, (startX, Y), cv2.FONT_HERSHEY_SIMPLEX,
                    0.7, (0, 255, 0), 2)
    
    # check for females surrounded by males
    alert = False
    for gender, face in genders:
        if gender == 'woman':
            male_count = 0
            for other_gender, other_face in genders:
                if other_gender == 'man' and calculate_distance(face, other_face) < distance_threshold:
                    male_count += 1
            if male_count >= n:
                alert = True
                break
    
    alert_history.append(alert)
    
    # Check if alert condition holds for all frames in the queue
    alert_triggered = len(alert_history) == alert_history.maxlen and all(alert_history)
    
    # Add alert text if triggered
    if alert_triggered:
        cv2.putText(frame, "ALERT: Woman potentially unsafe", (50, 50), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    
    return frame, alert_triggered, alert_history

def run_safety_detection(video_source="video2.mp4", model_path='gender_detection.keras'):
    """
    Run the safety detection on a video source
    
    Args:
        video_source: Path to video file or camera index
        model_path: Path to the gender detection model
        
    Returns:
        None
    """
    # load model
    model = load_model(model_path)
    classes = ['man', 'woman']
    
    # open video source
    cap = cv2.VideoCapture(video_source)
    
    alert_history = deque(maxlen=5)
    
    # loop through frames
    while cap.isOpened():
        # read frame
        status, frame = cap.read()
        
        if not status:
            break
            
        # process frame
        frame, alert_triggered, alert_history = process_safety_frame(
            frame, model, classes, alert_history=alert_history
        )
        
        # display output
        cv2.imshow("Safety Detection", cv2.resize(frame, (1280, 720)))
        
        # press "Q" to stop
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    # release resources
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    run_safety_detection()