import cv2
from ultralytics import YOLO
import numpy as np
from flask import Flask, Response, jsonify
import threading
from queue import Queue

app = Flask(__name__)

# Load YOLO models on CPU (change to 'cuda' if GPU is available)
parking_model = YOLO('D:/Downloads/best.pt').to('cpu')
object_model = YOLO('D:/Downloads/yolov8m.pt').to('cpu')

# Use webcam
cap = cv2.VideoCapture(0)

# Alternatively, for RTSP stream:
# rtsp_url = "rtsp://admin:team59cpe@192.168.1.13:554/Streaming/Channels/2?transport=tcp"
# cap = cv2.VideoCapture(rtsp_url)

if not cap.isOpened():
    print("Error: Could not access the camera.")
    exit()

# Set resolution
processing_width = 640
processing_height = 360
cap.set(cv2.CAP_PROP_FRAME_WIDTH, processing_width)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, processing_height)

# Parking status data
parking_status = {
    'parked_cars': 0,
    'available_spaces': 0
}

# Frame queues
capture_queue = Queue(maxsize=10)  # Raw frame buffer
frame_queue = Queue(maxsize=1)     # JPEG-encoded processed frames

# Frame skip logic
frame_count = 0
frame_skip = 3  # Process every 3rd frame

# Capture thread: fills buffer with raw frames
def frame_capture_loop():
    while True:
        ret, frame = cap.read()
        if not ret:
            continue
        if not capture_queue.full():
            capture_queue.put(frame)

# Update parking and detection logic
def update_parking_status():
    global parking_status, frame_count

    if capture_queue.empty():
        return None

    frame = capture_queue.get()
    frame_count += 1

    # Resize for consistent input
    resized_frame = cv2.resize(frame, (processing_width, processing_height))

    # Skip frames for performance
    if frame_count % frame_skip != 0:
        return None

    # Run parking model
    parking_results = parking_model(resized_frame)
    parking_detections = parking_results[0].boxes

    parked_cars = 0
    available_spaces = 0

    shift_x = 100
    shift_y = 100

    for detection in parking_detections:
        class_id = int(detection.cls[0].item())
        label = parking_model.names[class_id]
        x_min, y_min, w, h = map(int, detection.xywh[0].tolist())
        x_max, y_max = x_min + w, y_min + h

        x_min -= shift_x
        y_min -= shift_y
        x_max -= shift_x
        y_max -= shift_y

        if label.lower() == 'occupied':
            parked_cars += 1
            color = (0, 0, 255)
        elif label.lower() == 'empty':
            available_spaces += 1
            color = (0, 255, 0)
        else:
            continue

        cv2.rectangle(resized_frame, (x_min, y_min), (x_max, y_max), color, 2)
        cv2.putText(resized_frame, label, (x_min, y_min - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

    # Run object detection model
    object_results = object_model(resized_frame)
    object_detections = object_results[0].boxes

    for obj_detection in object_detections:
        obj_class_id = int(obj_detection.cls[0].item())
        obj_label = object_model.names[obj_class_id]

        if obj_label.lower() == 'person':
            bbox = obj_detection.xywh[0].tolist()
            x_min = int(bbox[0] - bbox[2] / 2) - shift_x
            y_min = int(bbox[1] - bbox[3] / 2) - shift_y
            x_max = int(bbox[0] + bbox[2] / 2) - shift_x
            y_max = int(bbox[1] + bbox[3] / 2) - shift_y

            cv2.rectangle(resized_frame, (x_min, y_min), (x_max, y_max), (255, 0, 0), 2)
            cv2.putText(resized_frame, obj_label, (x_min, y_min - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

    # Update status
    parking_status['parked_cars'] = parked_cars
    parking_status['available_spaces'] = available_spaces

    # Encode the frame
    ret, jpeg = cv2.imencode('.jpg', resized_frame)
    if not ret:
        return None

    return jpeg.tobytes()

# Detection loop: processes frames from buffer and updates output
def detection_loop():
    while True:
        frame = update_parking_status()
        if frame:
            if not frame_queue.full():
                frame_queue.put(frame)

# MJPEG stream generator
def generate_frame():
    while True:
        if not frame_queue.empty():
            frame = frame_queue.get()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

# Video stream endpoint
@app.route('/video_feed')
def video_feed():
    return Response(generate_frame(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

# Parking status API endpoint
@app.route('/parking_status', methods=['GET'])
def get_parking_status():
    return jsonify(parking_status)

# Flask server runner
def run_flask():
    app.run(host='0.0.0.0', port=5000, threaded=True, debug=False)

# Start all threads
if __name__ == '__main__':
    threading.Thread(target=run_flask).start()
    threading.Thread(target=frame_capture_loop).start()
    threading.Thread(target=detection_loop).start()
