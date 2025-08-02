#FINAL NA FINAL WITH ERROR HANDLING (IF A PERSON STANDING INSIDE A PARKING SPACE)
import cv2
from ultralytics import YOLO
import numpy as np

parking_model = YOLO('runs/detect/train5/weights/best.pt')
object_model = YOLO('yolov8m.pt')

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not access the camera.")
    exit()

screen_width = 1920  
screen_height = 1080  

cap.set(cv2.CAP_PROP_FRAME_WIDTH, screen_width)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, screen_height)

cv2.namedWindow("Parking Space Detection", cv2.WND_PROP_FULLSCREEN)
cv2.setWindowProperty("Parking Space Detection", cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)

while True:
    ret, frame = cap.read()

    if not ret:
        print("Error: Failed to capture an image.")
        break

    resized_frame = cv2.resize(frame, (screen_width, screen_height))

    parking_results = parking_model(resized_frame)
    parking_detections = parking_results[0].boxes

    parked_cars = 0
    available_spaces = 0

    for detection in parking_detections:
        class_id = int(detection.cls[0].item())
        label = parking_model.names[class_id]

        if label.lower() == 'occupied':
            parked_cars += 1

        elif label.lower() == 'empty':
            available_spaces += 1

    object_results = object_model(resized_frame)
    object_detections = object_results[0].boxes

    for obj_detection in object_detections:
        obj_class_id = int(obj_detection.cls[0].item())
        obj_label = object_model.names[obj_class_id]
        
        if obj_label.lower() == 'person':
            bbox = obj_detection.xywh[0].tolist()
            x_min, y_min, x_max, y_max = int(bbox[0] - bbox[2] / 2), int(bbox[1] - bbox[3] / 2), int(bbox[0] + bbox[2] / 2), int(bbox[1] + bbox[3] / 2)
            cv2.rectangle(resized_frame, (x_min, y_min), (x_max, y_max), (0, 0, 255), 2)
            cv2.putText(resized_frame, f"{obj_label}", (x_min, y_min - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)

    text_bg_color = (0, 0, 139)
    text_color = (255, 255, 255)
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.8
    font_thickness = 2

    (w1, h1), _ = cv2.getTextSize(f"Parked Cars: {parked_cars}", font, font_scale, font_thickness)
    (w2, h2), _ = cv2.getTextSize(f"Available Spaces: {available_spaces}", font, font_scale, font_thickness)

    cv2.rectangle(resized_frame, (30, 30), (30 + w1 + 20, 30 + h1 + 20), text_bg_color, -1)
    cv2.rectangle(resized_frame, (30, 100), (30 + w2 + 20, 100 + h2 + 20), text_bg_color, -1)

    cv2.putText(resized_frame, f"Parked Cars: {parked_cars}", (40, 60), font, font_scale, text_color, font_thickness)
    cv2.putText(resized_frame, f"Available Spaces: {available_spaces}", (40, 130), font, font_scale, text_color, font_thickness)

    processed_frame = parking_results[0].plot()
    cv2.imshow("Parking Space Detection", processed_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()