# Handwritten Amharic Character Recognition Through Transfer Learning

An end-to-end machine learning system for recognizing handwritten Amharic (Ethiopic/Ge'ez) characters across **238 character classes** using transfer learning with **ResNet50** and a **Linear Support Vector Machine (LinearSVC)**. The project includes a React web application, a FastAPI backend, image preprocessing, model evaluation, and support for preset samples, uploaded images, and handwritten input through a drawing canvas.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Dataset](#dataset)
- [Model and Training Approach](#model-and-training-approach)
- [Evaluation Results](#evaluation-results)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Running the Application](#running-the-application)
- [Making Predictions](#making-predictions)
- [Model Evaluation](#model-evaluation)
- [Automated Testing](#automated-testing)
- [API Endpoints](#api-endpoints)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)
- [References](#references)

## Overview

Amharic is written using the Ethiopic script, an abugida in which consonant-vowel combinations are represented by distinct characters. Recognizing handwritten Ethiopic characters is challenging because many classes share similar structural patterns and differ only in small stroke variations.

This project addresses the problem using a transfer-learning pipeline that extracts visual features from a pretrained ResNet50 network and classifies those features using a linear support vector machine.

The system supports three input methods:

- **Preset samples:** Test the model using sample images provided with the application.
- **Image upload:** Upload an image of a handwritten Amharic character.
- **Drawing canvas:** Draw a character directly in the browser and submit it for recognition.

The application returns the predicted character, its associated class information, and ranked alternative predictions.

## Features

- Recognition across 238 Amharic character classes.
- Transfer learning with ImageNet-pretrained ResNet50.
- 2,048-dimensional feature extraction using global average pooling.
- Multi-class LinearSVC classification.
- Image preprocessing, including grayscale conversion, smoothing, thresholding, cropping, and resizing.
- Character-to-label mapping using Ethiopic character metadata.
- Top-5 candidate predictions based on classifier decision scores.
- React and TypeScript frontend.
- FastAPI prediction backend.
- Command-line inference for individual images.
- Cached feature extraction for efficient model training and evaluation.
- Automated backend integration tests.

## System Architecture

The application follows a modular architecture that separates image preprocessing, feature extraction, classification, and web-based inference.

```text
              Input Character Image
                       |
                       v
              Image Preprocessing
                       |
                       v
             Resize to 224 x 224
                       |
                       v
              Pretrained ResNet50
                       |
                       v
         Global Average Pooling Layer
                       |
                       v
          2,048-D Feature Representation
                       |
                       v
              LinearSVC Classifier
                       |
                       v
             Predicted Class Index
                       |
                       v
              Label Mapping Layer
                       |
                       v
          Ethiopic Character and Metadata
                       |
                       v
         Prediction and Top-5 Candidates
```

### Image Preprocessing

Input images are standardized before feature extraction.

1. Convert RGB input to grayscale using luminance-based conversion.
2. Apply Gaussian smoothing with a 3 × 3 kernel.
3. Apply Otsu thresholding to separate foreground strokes from the background.
4. Detect the foreground bounding box.
5. Crop the character and add padding to preserve its aspect ratio.
6. Resize the image to 224 × 224 pixels.
7. Expand the grayscale image to three channels.
8. Normalize the image using the ImageNet mean and standard deviation expected by the pretrained backbone.

For canvas input, the preprocessing pipeline also handles the inverted foreground representation and rejects blank or nearly blank drawings.

**Important:** The exact preprocessing operations and their order must remain consistent with the implementation used during training and inference.

### Transfer Learning with ResNet50

The project uses a ResNet50 convolutional neural network pretrained on ImageNet.

Rather than training the entire network from scratch, the pretrained convolutional layers are frozen and used as a feature extractor. The final classification layer is replaced with an intermediate representation obtained through global average pooling.

Each input image is represented by a 2,048-dimensional feature vector.

These embeddings are then passed to the LinearSVC classifier.

### Linear Support Vector Machine

The classifier uses `LinearSVC` from scikit-learn to distinguish between the 238 character classes.

The model produces decision scores for the candidate classes. These scores are used to rank the most likely characters.

The final class index is mapped to its corresponding Ethiopic glyph and associated metadata.

## Dataset

The project uses the Fetulhak handwritten Amharic character dataset.

| Property | Value |
|---|---|
| Total annotated images | 37,652 |
| Number of classes | 238 |
| Approximate images per class | 158 on average |
| Evaluation split | 15% stratified test split |
| Test images | 5,648 |

The dataset annotations are stored in `data/metadata.csv`, while the image files and cached features are organized within the project directories.

A stratified split is used to maintain class representation across the training, validation, and test subsets.

**Data integrity note:** If multiple images originate from the same writer or source, a writer-independent or source-independent split should also be evaluated to determine how well the model generalizes to unseen handwriting.

## Model and Training Approach

The training pipeline consists of the following stages:

1. Scan the dataset and associate images with their class labels.
2. Create stratified training, validation, and test splits.
3. Preprocess the images.
4. Extract ResNet50 features.
5. Cache the extracted feature vectors.
6. Train the LinearSVC classifier.
7. Save the trained classifier and label mapping.
8. Evaluate predictions on the held-out test set.

The extracted features are cached in NumPy files, reducing the need to repeatedly execute the ResNet50 backbone during classifier experimentation.

### Model artifacts

| File | Purpose |
|---|---|
| `models/svm_resnet50.joblib` | Trained LinearSVC classifier |
| `models/label_mapping.json` | Mapping between class indices and dataset labels |
| `models/training_results.json` | Stored training metadata and evaluation results |
| `data/features/test_features.npy` | Cached test-set feature vectors |
| `data/features/test_labels.npy` | Corresponding test-set labels |

The pretrained ResNet50 weights must also be available to the feature extractor. Depending on the implementation, they may be downloaded automatically by Torchvision or loaded from a local cache.

## Evaluation Results

The following results are reported for the held-out test set of 5,648 images.

| Metric | Result |
|---|---:|
| Top-1 accuracy | 48.02% |
| Top-5 accuracy | 76.24% |
| Weighted precision | 0.4751 |
| Weighted recall | 0.4802 |
| Weighted F1-score | 0.4725 |
| Macro F1-score | 0.4648 |

### Interpretation

**Top-1 accuracy** measures how often the highest-ranked prediction matches the correct character.

**Top-5 accuracy** measures how often the correct character appears among the five highest-ranked predictions.

The difference between these metrics indicates that the correct class is often ranked among the model's leading candidates even when it is not ranked first.

The macro F1-score gives equal weight to each class, whereas weighted F1 accounts for the number of test examples in each class.

These metrics describe the reported held-out test set. They should not be interpreted as measured performance on arbitrary user drawings without a separate canvas-specific evaluation.

## Technology Stack

### Machine Learning

- Python
- PyTorch
- Torchvision
- scikit-learn
- NumPy
- scikit-image or OpenCV, depending on the implemented preprocessing dependencies
- Joblib

### Backend

- FastAPI
- Uvicorn
- Pydantic

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Testing and Evaluation

- Python integration tests
- FastAPI test client
- NumPy-based feature caching
- scikit-learn classification metrics

## Project Structure

```text
handwritten-amharic-character-recognition/
├── backend/
│   └── main.py
├── data/
│   ├── features/
│   │   ├── test_features.npy
│   │   └── test_labels.npy
│   ├── metadata.csv
│   └── samples/
├── ml/
│   ├── config.py
│   ├── dataset.py
│   ├── preprocessing.py
│   ├── feature_extractor.py
│   ├── train.py
│   ├── predict.py
│   └── evaluate.py
├── models/
│   ├── svm_resnet50.joblib
│   ├── label_mapping.json
│   └── training_results.json
├── public/
│   └── samples/
├── src/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── tests/
│   └── test_backend.py
├── requirements.txt
├── package.json
├── vite.config.ts
└── README.md
```

## Prerequisites

Install the following before running the application:

- Python 3.10–3.12
- Node.js 18 or later
- npm
- Git

The repository should contain the trained model files and label mapping. If these artifacts are not included in the checkout, obtain them from the project's designated artifact storage before starting inference.

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/shraddhaA2/handwritten-amharic-character-recognition.git

cd handwritten-amharic-character-recognition
```

### 2. Install Python dependencies

```bash
python -m venv .venv
```

Activate the virtual environment.

**Windows PowerShell**

```powershell
.venv\Scripts\Activate.ps1
```

**Windows Command Prompt**

```cmd
.venv\Scripts\activate.bat
```

**Linux or macOS**

```bash
source .venv/bin/activate
```

Install the required packages:

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Install frontend dependencies

```bash
npm install
```

### 4. Verify the required model files

Ensure the following files are present:

```text
models/svm_resnet50.joblib
models/label_mapping.json
```

The feature cache is required for the documented cached evaluation workflow:

```text
data/features/test_features.npy
data/features/test_labels.npy
```

If the model or dataset artifacts are excluded from version control, follow the project's artifact acquisition instructions.

## Running the Application

Start the backend and frontend in separate terminals.

### Terminal 1: FastAPI backend

Activate the Python virtual environment and run:

```bash
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend URL:

`http://localhost:8000`

Interactive API documentation:

`http://localhost:8000/docs`

### Terminal 2: React frontend

From the repository root, run:

```bash
npm run dev
```

Frontend URL:

`http://localhost:3000`

The Vite configuration should proxy API requests to the FastAPI backend on port 8000.

## Making Predictions

### Using the web application

1. Start the backend and frontend.
2. Open the frontend in your browser.
3. Select a preset sample, upload an image, or draw a character on the canvas.
4. Submit the image for recognition.
5. Review the predicted character and ranked alternative candidates.

### Using the command line

The project provides a CLI inference module for testing individual images without starting the web server.

Test a sample from the `ሀ` class:

```bash
python -m ml.predict data/samples/001he.1.jpg
```

Test a sample from the `ፈ` class:

```bash
python -m ml.predict data/samples/225fe.134.jpg
```

The output includes the predicted glyph, phonetic label, class identifier, decision score, and top-five candidate list, depending on the implemented output configuration.

### Understanding classifier scores

`LinearSVC` produces decision scores rather than native probability estimates.

If the application applies softmax to these scores to display percentages, those values are normalized ranking scores, not calibrated probabilities. A displayed confidence percentage should therefore be interpreted cautiously.

## Model Evaluation

To evaluate the model using cached test features, run:

```bash
python -m ml.evaluate
```

This workflow avoids repeating feature extraction if the required feature and label files are already available.

For a reliable evaluation, confirm that:

- The test features and labels correspond to the same test split.
- The label order matches the classifier's expected class order.
- No test images were used during training or model selection.
- The saved metrics correspond to the current model version.

## Automated Testing

Run the backend integration tests:

```bash
python tests/test_backend.py
```

The documented test suite covers:

- Root endpoint response.
- Health endpoint response.
- Prediction request without an image.
- Inference on real sample images.
- Blank canvas rejection.
- Inference using a drawn-canvas PNG.
- End-to-end backend and model integration.

The expected test cases are:

```text
test_root_endpoint
test_health_endpoint
test_predict_missing_image
test_predict_real_sample_he
test_predict_real_sample_fe
test_predict_blank_canvas_rejected
test_predict_drawn_canvas_png
```

A successful run should report that all seven integration tests passed. Actual results depend on the current code, model artifacts, and environment.

## API Endpoints

The FastAPI backend exposes the following documented endpoint categories.

| Endpoint | Purpose |
|---|---|
| `GET /` | Root endpoint |
| `GET /health` | Backend health check |
| `POST /predict` | Submit an image for character recognition |

The frontend may access these endpoints through the configured Vite proxy.

For exact request formats, required fields, response schemas, and error codes, inspect the running API documentation at `http://localhost:8000/docs`.

## Limitations

- **Moderate top-1 accuracy:** The current reported accuracy is 48.02%, so the highest-ranked prediction is incorrect for many test examples.
- **Similar character classes:** Small visual differences between related characters can cause misclassification.
- **Hand-drawn input variation:** Canvas drawings may differ from dataset images in stroke width, alignment, proportions, and image contrast.
- **Domain generalization:** Performance on the existing test split does not establish performance on handwriting from unseen users.
- **Confidence interpretation:** Softmax-transformed SVM scores are not automatically calibrated probabilities.
- **Offline operation:** Inference can run locally when the application dependencies and model weights are available. Initial setup may still require downloading dependencies or pretrained weights.

## Future Improvements

- Improve drawing-canvas preprocessing while preserving the working upload and preset-image pipelines.
- Compare intermediate preprocessed images from all three input methods.
- Evaluate alternative CNN architectures and fine-tuning strategies.
- Investigate data augmentation for stroke thickness, translation, rotation, and handwriting variation.
- Evaluate per-class precision, recall, confusion matrices, and class-level accuracy.
- Test on handwriting collected from users who are not represented in the training set.
- Calibrate prediction confidence or expose raw decision scores more clearly.
- Add systematic error analysis for commonly confused characters.

## References

- [PyTorch](https://pytorch.org/)
- [Torchvision Models](https://pytorch.org/vision/stable/models.html)
- [scikit-learn LinearSVC](https://scikit-learn.org/stable/modules/generated/sklearn.svm.LinearSVC.html)
- [scikit-learn Classification Metrics](https://scikit-learn.org/stable/modules/model_evaluation.html)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)

---

## Author

**Shraddha Ashoka**

Computer Science and Engineering

GitHub: [shraddhaA2](https://github.com/shraddhaA2)

Repository: [Handwritten Amharic Character Recognition](https://github.com/shraddhaA2/handwritten-amharic-character-recognition)

---

*This project demonstrates the integration of computer vision, transfer learning, classical machine learning, backend APIs, and a web-based interface for handwritten character recognition.*
