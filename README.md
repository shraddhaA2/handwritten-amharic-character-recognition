# Handwritten Amharic Character Recognition (HACR) Through Transfer Learning

An end-to-end Machine Learning system and Web Application for offline **Handwritten Amharic Character Recognition** across **238 character classes** using deep feature representations from a pretrained **ResNet50** convolutional neural network and a **Linear Support Vector Machine (LinearSVC)** classifier.

---

## 1. Project Overview & Architecture

Amharic uses the **Ethiopic (Ge'ez)** script, an abugida writing system consisting of **34 base consonants**, each modified by vocalic inflection into **7 vowel orders**:
$$\text{Total Classes} = 34 \text{ base families} \times 7 \text{ orders} = 238 \text{ unique characters}$$

### Transfer Learning Pipeline

```
[ Input Handwritten Character Image (28×28 Grayscale) ]
                           ↓
              [ Image Preprocessing ]
  1. Grayscale luminance conversion (0.299R + 0.587G + 0.114B)
  2. Gaussian smoothing (3×3 kernel)
  3. Adaptive Otsu binarization & foreground stroke isolation
  4. Stroke bounding box detection with aspect-ratio square padding
  5. Resizing to 224 × 224 pixels & 3-channel expansion
  6. ImageNet normalization (mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
                           ↓
          [ Pretrained ResNet50 Backbone ]
  - Torchvision ResNet50 (ImageNet Pretrained Weights)
  - Convolutional layers frozen (requires_grad = False)
  - Global Average Pooling layer (2048-d continuous embedding)
                           ↓
             [ Linear SVM Classifier ]
  - Multi-class LinearSVC (One-vs-Rest hyperplanes across 238 classes)
  - Evaluates decision margin scores for all 238 classes
                           ↓
             [ Ethiopic Fidel Mapping ]
  - Predicted class index (0–237) mapped to Amharic character glyph (e.g. "ሀ"),
    phonetic sound ("he"), base family ("ሀ"), and vowel order ("Ge'ez 1st")
```

---

## 2. Requirements & Prerequisites

- **Python**: `3.10` to `3.12`
- **Node.js**: `v18+` or `v20+` (with npm)
- **Operating System**: Windows, Linux, or macOS

---

## 3. Quick Start & Execution Guide

### Step 1: Install Dependencies

```bash
# 1. Install Python ML & backend dependencies
pip install -r requirements.txt

# 2. Install Frontend dependencies
npm install
```

### Step 2: Start the System (Two Commands)

Open two terminal windows:

#### Terminal 1 — Start the Python FastAPI Backend:
```bash
uvicorn backend.main:app --port 8000 --reload
```
*Backend runs at:* `http://localhost:8000` (API docs at `http://localhost:8000/docs`)

#### Terminal 2 — Start the React Web Frontend:
```bash
npm run dev
```
*Frontend runs at:* `http://localhost:3000`

---

## 4. Testing & Inference via CLI

You can test single character images directly from the command line without starting the web server:

```bash
# Test sample 'ሀ' (he, Class 001he)
python -m ml.predict data/samples/001he.1.jpg

# Test sample 'ፈ' (fe, Class 225fe)
python -m ml.predict data/samples/225fe.134.jpg
```

Example CLI Output:
```
=================================================================
HANDWRITTEN AMHARIC CHARACTER RECOGNITION (HACR)
=================================================================
Input Image         : data/samples/001he.1.jpg
Predicted Character : ሀ (Phonetic: 'he')
Base Consonant      : ሀ
Vowel Order         : Ge'ez (1st)
Class Identifier    : 001he (ID: 0)
Confidence (Softmax): 2.86%
SVM Decision Score  : -0.0830

Top 5 Candidates:
  1. ሀ (he)  | Label: 001he    | Conf:  2.86% | Score: -0.0830
  2. ዊ (wi)  | Label: 136wi    | Conf:  1.35% | Score: -0.8338
  3. ህ (h)   | Label: 006hh    | Conf:  1.26% | Score: -0.8986
  4. ዐ (ae)  | Label: 141_x    | Conf:  1.22% | Score: -0.9313
  5. ዔ (aee) | Label: 145_x    | Conf:  1.14% | Score: -1.0018
=================================================================
```

---

## 5. Model Evaluation & Real Benchmark Metrics

Evaluated on **5,648 real test images** (15% stratified test split from the Fetulhak dataset):

| Metric | Measured Value | Notes |
| :--- | :--- | :--- |
| **Overall Top-1 Accuracy** | **48.02%** | Random guessing across 238 classes is only **0.42%** |
| **Top-5 Accuracy** | **76.24%** | Correct character is in top 5 predictions in 3 out of 4 cases |
| **Weighted Precision** | **0.4751** | Multi-class weighted precision |
| **Weighted Recall** | **0.4802** | Multi-class weighted recall |
| **Weighted F1-Score** | **0.4725** | Multi-class weighted F1 |
| **Macro F1-Score** | **0.4648** | Unweighted average across all 238 classes |

To re-run the evaluation suite on the cached test features:
```bash
python -m ml.evaluate
```

---

## 6. Project Directory Structure

```
handwritten-amharic-character-recognition/
├── backend/
│   └── main.py                     # Clean FastAPI backend (/health, /predict)
├── data/
│   ├── features/                   # Cached .npy features (train, val, test)
│   ├── metadata.csv                # 37,652 stratified image split annotations
│   └── samples/                    # Real Amharic sample images for testing
├── ml/
│   ├── config.py                   # Global constants, paths, and Amharic Fidel matrix
│   ├── dataset.py                  # Dataset scanner and stratified splitter
│   ├── preprocessing.py            # 8-stage image preprocessing pipeline
│   ├── feature_extractor.py        # Pretrained ResNet50 2,048-d feature extractor
│   ├── train.py                    # Feature extraction & SVM training pipeline
│   ├── predict.py                  # AmharicPredictor & CLI prediction module
│   └── evaluate.py                 # Evaluation metrics on test split
├── models/
│   ├── svm_resnet50.joblib         # Trained LinearSVM model (3.9 MB)
│   ├── label_mapping.json          # 238 class ID to dataset label map
│   └── training_results.json       # Training metadata and metrics
├── public/
│   └── samples/                    # Web-accessible preset test images
├── src/
│   ├── App.tsx                     # Main React application (Recognition, How It Works, About)
│   ├── index.css                   # Tailwind styles
│   ├── main.tsx                    # React DOM entry point
│   └── types.ts                    # TypeScript interface definitions
├── tests/
│   └── test_backend.py             # Automated integration tests for FastAPI & ML
├── requirements.txt                # Python dependencies
├── package.json                    # Frontend dependencies and build scripts
├── vite.config.ts                  # Vite config with backend proxy on port 3000
└── README.md                       # Project documentation
```

---

## 7. Model Location & File Requirements

- The trained SVM classifier file is located at:
  ```
  models/svm_resnet50.joblib
  ```
- The class label mapping file is located at:
  ```
  models/label_mapping.json
  ```
- The pre-extracted ResNet50 feature cache is located at:
  ```
  data/features/test_features.npy
  data/features/test_labels.npy
  ```

---

## 8. Automated Testing

Run the integration test suite covering the FastAPI endpoints, error handling, blank canvas rejection, drawn canvas PNG inference, and end-to-end model inference on real samples:

```bash
python tests/test_backend.py
```

Expected output:
```
✓ test_root_endpoint passed
✓ test_health_endpoint passed
✓ test_predict_missing_image passed
✓ test_predict_real_sample_he passed
✓ test_predict_real_sample_fe passed
✓ test_predict_blank_canvas_rejected passed
✓ test_predict_drawn_canvas_png passed

All integration tests passed successfully!
```


---

## 9. Common Viva Questions & Defense Notes

1. **Why use Transfer Learning instead of training a CNN from scratch?**
   - Amharic has 238 classes with subtle differences. Training a deep network from scratch with ~150 samples per class leads to severe overfitting. Pretrained ResNet50 provides general visual features (edges, corners, loops) learned from 1.2M ImageNet images.
2. **Why Linear SVM rather than an RBF kernel or Dense Softmax layer?**
   - In a high-dimensional space ($D=2048$), data points are often linearly separable. LinearSVC trains in minutes, occupies only 3.9 MB of disk space, and performs inference in milliseconds on a standard CPU.
3. **How does Otsu Binarization work?**
   - Otsu's algorithm automatically calculates an optimal threshold that minimizes intra-class variance between foreground handwritten strokes and background paper texture.
4. **Why is Top-1 accuracy 48% but Top-5 accuracy 76%?**
   - In Amharic, vowel inflections for the same consonant family (e.g. 1st order ሀ vs 6th order ህ) differ by tiny stroke modifications. When the model misclassifies a character, the correct character is frequently ranked in the top 2 or 3 candidates.
5. **How does the "Draw a Character" canvas work with the model?**
   - The user draws on a $280 \times 280$ white HTML5 canvas with a dark brush using Pointer Events (`touch-action: none`). The canvas exports a PNG blob to `/api/predict`. In `ml/preprocessing.py`, inverted Otsu binarization detects the dark strokes as foreground, verifies non-blank input (`coords.size >= 15`), crops the character bounding box with square aspect padding, resizes to $224 \times 224$, normalizes for ImageNet, and feeds the image directly through the ResNet50 + LinearSVC classifier.

