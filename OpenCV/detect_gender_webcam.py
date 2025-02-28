from tensorflow.keras.preprocessing.image import img_to_array
from tensorflow.keras.models import load_model
import numpy as np
import cv2
import os
import cvlib as cv

# load model
model = load_model('gender_detection.keras')

# open webcam
webcam = cv2.VideoCapture("video2.mp4")

classes = ['1man', '2woman']

# function to calculate distance between two faces
def calculate_distance(face1, face2):
    center1 = ((face1[0] + face1[2]) // 2, (face1[1] + face1[3]) // 2)
    center2 = ((face2[0] + face2[2]) // 2, (face2[1] + face2[3]) // 2)
    distance = np.sqrt((center1[0] - center2[0]) ** 2 + (center1[1] - center2[1]) ** 2)
    return distance

# loop through frames
while webcam.isOpened():

    # read frame from webcam 
    status, frame = webcam.read()

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
    n = 1  # replace with the desired number of males
    distance_threshold = 1000  # adjust distance threshold as needed
    for gender, face in genders:
        if gender == '2woman':
            male_count = 0
            for other_gender, other_face in genders:
                if other_gender == '1man' and calculate_distance(face, other_face) < distance_threshold:
                    male_count += 1
            if male_count >= n:
                cv2.putText(frame, "Alert: Female surrounded by males", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

    # display output
    cv2.imshow("gender detection", cv2.resize(frame, (1280, 720)))

    # press "Q" to stop
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# release resources
webcam.release()
cv2.destroyAllWindows()