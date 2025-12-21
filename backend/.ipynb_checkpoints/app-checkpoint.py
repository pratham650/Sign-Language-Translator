from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2 # We'll use cv2 for robust image processing, as used in training
from tensorflow.keras.models import load_model
from PIL import Image
import base64
import io
import json
import os
import sys

app = Flask(__name__)
CORS(app)

# --- Configuration ---
IMG_SIZE = 64
MODEL_PATH = "model/sign_language_model.h5"
LABELS_PATH = "model/labels.json"
# ---------------------

try:
    # 1. Load Model
    model = load_model(MODEL_PATH)
    
    # Check if the model is fully loaded before proceeding (optional but safe)
    if model is None:
        raise ValueError("Keras model failed to load correctly.")

    # 2. Load Labels
    with open(LABELS_PATH, 'r') as f:
        labels = json.load(f)
        
    # CRITICAL FIX: Use model.output_shape[1] to get the output size.
    # The output shape is typically (None, N_CLASSES), where [1] is N_CLASSES.
    model_output_size = model.output_shape[1] 
    label_count = len(labels)
    
    # 3. Consistency Check
    if model_output_size != label_count:
        print(f"🚨 FATAL ERROR: Model output size ({model_output_size}) MUST match label count ({label_count}).")
        print("Please check if the correct labels.json was saved by the training script.")
        sys.exit(1)
    
    print(f"✅ Model and {label_count} labels loaded successfully.")
    
    # Compile the model explicitly to clear the warning (optional)
    model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy']) 

except Exception as e:
    # This catches the 'output_shape' error and any subsequent errors
    print(f"🔴 Error loading model or labels: {e}")
    sys.exit(1)



def prepare_image(img_stream_or_file):
    """
    Preprocesses the image (from file or webcam stream) to match the training pipeline.
    
    CRUCIAL: We use the PIL approach for the Flask front-end but ensure we normalize and resize correctly.
    """
    # Resize and convert to RGB (PIL handles this well)
    img = img_stream_or_file.resize((IMG_SIZE, IMG_SIZE)).convert('RGB')
    
    # Convert to numpy array
    img_array = np.array(img, dtype=np.float32)
    
    # Normalize to [0.0, 1.0]
    img_array = img_array / 255.0
    
    # Add batch dimension (1, 64, 64, 3)
    return img_array.reshape(1, IMG_SIZE, IMG_SIZE, 3)


def get_prediction_result(processed_image_array):
    """Predicts, checks index validity, and returns the label and confidence."""
    
    # Predict
    probabilities = model.predict(processed_image_array, verbose=0)[0]
    
    # Find the index of the highest probability
    predicted_index = np.argmax(probabilities)
    
    # 🚨 FIX: Check for IndexError before access
    if predicted_index >= len(labels):
        raise IndexError(f"Prediction index ({predicted_index}) is out of range for labels list of size {len(labels)}. Model/Label mismatch.")

    # Get label and confidence
    prediction_label = labels[predicted_index]
    confidence = float(probabilities[predicted_index])
    
    return prediction_label, confidence


@app.route('/predict', methods=['POST'])
def predict_file():
    """Handles prediction for uploaded image files."""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400
            
        file = request.files['file']
        
        # Open image using PIL
        img = Image.open(file.stream)
        
        # Preprocess
        processed = prepare_image(img)
        
        # Predict and check consistency
        prediction_label, confidence = get_prediction_result(processed)
        
        return jsonify({'prediction': prediction_label, 'confidence': confidence})

    except IndexError as e:
        app.logger.error(f"Prediction IndexError: {e}")
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        app.logger.error(f"Unhandled Prediction Error: {e}")
        return jsonify({'error': 'Unhandled error during file prediction.'}), 500


@app.route('/predict-webcam', methods=['POST'])
def predict_webcam():
    """Handles prediction for base64-encoded webcam frames."""
    try:
        data = request.json['image']
        
        # Decode base64 string
        img_data = base64.b64decode(data.split(',')[1])
        
        # Open image stream using PIL
        img = Image.open(io.BytesIO(img_data))
        
        # Preprocess
        processed = prepare_image(img)
        
        # Predict and check consistency
        prediction_label, confidence = get_prediction_result(processed)
        
        return jsonify({'prediction': prediction_label, 'confidence': confidence})
        
    except IndexError as e:
        app.logger.error(f"Webcam IndexError: {e}")
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        app.logger.error(f"Unhandled Webcam Error: {e}")
        return jsonify({'error': 'Unhandled error during webcam prediction.'}), 500


if __name__ == '__main__':
    # Ensure the model file is accessible
    if not os.path.exists(MODEL_PATH) or not os.path.exists(LABELS_PATH):
        print(f"🔴 FATAL: Model or labels file not found. Check paths: {MODEL_PATH}, {LABELS_PATH}")
        sys.exit(1)
        
    app.run(port=5000, debug=True)