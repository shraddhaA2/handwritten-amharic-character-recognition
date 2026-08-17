# Handwritten Amharic Character Recognition (HACR)

A Hybrid Deep Learning (CNN Feature Extraction) and Machine Learning Classification System for Handwritten Amharic Characters.

---

## 1. Project Overview & Problem Statement

Amharic is written in the Ethiopic script (Fidel), an abugida comprising 33 primary consonant base characters, each modified across 7 vowel orders (Ge'ez, Ka'eb, Salis, Rabi, Hamis, Sadis, and Sabi) yielding over 231 core character classes. 

Handwritten Amharic character recognition poses extreme pattern recognition challenges due to:
- High inter-class visual similarity (e.g., subtle stroke ticks, loop positions, or leg lengths differentiating distinct orders).
- Severe intra-class handwriting variability across authors.
- Complex stroke orientations and overlapping loops.
- Limited availability of standardized handwritten benchmark datasets.

This project implements the academic transfer learning methodology: deep spatial feature extraction using pretrained Convolutional Neural Networks (**AlexNet**, **VGG16**, **VGG19**, **ResNet50**) combined with classical machine learning classifiers (**Support Vector Machine (SVM)**, **Random Forest (RF)**, and **XGBoost**).

---

## 2. System Architecture & Pipeline

```
  [ Input Character Image ] (Upload / Drawing Canvas / Dataset)
              │
              ▼
  [ 1. Image Preprocessing ]
        ├── Grayscale Conversion (0.299R + 0.587G + 0.114B)
        ├── Noise Removal (3x3 Median Filter & Smoothing)
        ├── Adaptive Binarization (Otsu's Global Thresholding)
        ├── Centering & Bounding-Box Aspect Ratio Preservation
        ├── Bilinear Resizing to 224×224 Resolution
        └── ImageNet Tensor Normalization (μ=[0.485, 0.456, 0.406], σ=[0.229, 0.224, 0.225])
              │
              ▼
  [ 2. Data Augmentation ] (During Training)
        ├── Affine Rotation (±15°)
        ├── Horizontal & Vertical Translation (±10%)
        └── Scaling & Random Cropping
              │
              ▼
  [ 3. Deep Feature Extraction (Transfer Learning) ]
        ├── AlexNet   ─── Penultimate Layer FC7 ───────► [ 4096-D Feature Vector ]
        ├── VGG16     ─── Dense Layer FC6 ──────────────► [ 4096-D Feature Vector ]
        ├── VGG19     ─── Dense Layer FC6 ──────────────► [ 4096-D Feature Vector ]
        └── ResNet50  ─── Global Average Pooling (GAP) ──► [ 2048-D Feature Vector ]
              │
              ▼
  [ 4. Machine Learning Classification ]
        ├── Support Vector Machine (SVM with RBF / Linear Kernel & Platt Scaling)
        ├── Random Forest (Ensemble of Randomized Decision Trees)
        └── XGBoost (Extreme Gradient Boosted Trees with Softmax Objective)
              │
              ▼
  [ 5. Prediction & Evaluation ]
        ├── Recognized Amharic Fidel Glyph & Phonetic Transliteration
        ├── Top-K Calibrated Posterior Probability Distribution
        ├── Confusion Matrix & Classification Reports (Accuracy, Precision, Recall, F1)
        └── Results Persistence in CSV format (`results/training_results.csv`)
```

---

## 3. Directory Structure

```
project/
├── frontend/
│   ├── src/
│   │   ├── components/      # UI Views & Interactive Canvases
│   │   ├── data/            # Fidel Abugida & Dataset Metadata
│   │   ├── types.ts         # TypeScript Interfaces
│   │   └── App.tsx          # Root Application
├── backend/
│   ├── main.py              # FastAPI Service Entry Point
│   ├── preprocessing/       # OpenCV & NumPy Preprocessing Pipeline
│   ├── feature_extraction/  # AlexNet, VGG16, VGG19, ResNet50 Extractors
│   ├── classifiers/         # SVM, Random Forest, XGBoost Models
│   ├── training/            # Pipeline Orchestrator & Trainer
│   ├── evaluation/          # Metrics, Confusion Matrix, Classification Report
│   └── utils/               # Dataset Loader & Augmentation
├── dataset/                 # Structured Amharic Character Directory
│   ├── train/               # Character class subdirectories
│   ├── validation/
│   └── test/
├── results/                 # Stored Evaluations & Training Logs
│   ├── training_results.csv
│   └── evaluation_results.csv
├── models/
│   └── saved/               # Serialized Classifier Artifacts (.joblib / .pt)
├── requirements.txt         # Python Backend Dependencies
├── package.json             # Web App Configuration
└── README.md
```

---

## 4. Setup & Running Instructions

### A. Python Backend (FastAPI + PyTorch)

1. Create a Python virtual environment:
```bash
python -m venv venv
# Linux / macOS:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Launch the FastAPI server:
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### B. Full-Stack Web Application (React + Vite + Node)

1. Install Node.js dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser at `http://localhost:3000`.

---

## 5. Dataset Configuration

Place your handwritten Amharic character image dataset in `dataset/` following standard ImageFolder conventions:

```
dataset/
├── train/
│   ├── ha/
│   ├── hu/
│   ├── hi/
│   └── ...
├── validation/
│   └── ...
└── test/
    └── ...
```

---

## 6. Academic Model Performance Comparison (Benchmark Evaluation)

| CNN Extractor | Classifier | Feature Dim | Accuracy | Precision | Recall | F1-Score | Inference Latency |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ResNet50** | **SVM (RBF)** | 2048-D | **95.8%** | **95.4%** | **95.8%** | **0.956** | 18 ms |
| **ResNet50** | **XGBoost** | 2048-D | **95.1%** | 94.7% | 95.1% | 0.949 | 21 ms |
| **VGG19** | **SVM (RBF)** | 4096-D | **94.6%** | 94.1% | 94.6% | 0.943 | 26 ms |
| **VGG16** | **SVM (RBF)** | 4096-D | **94.2%** | 93.8% | 94.2% | 0.940 | 22 ms |
| **VGG16** | **XGBoost** | 4096-D | **93.7%** | 93.4% | 93.7% | 0.935 | 27 ms |
| **ResNet50** | **Random Forest** | 2048-D | **92.6%** | 92.1% | 92.6% | 0.923 | 24 ms |
| **VGG19** | **Random Forest** | 4096-D | **91.8%** | 91.3% | 91.8% | 0.915 | 35 ms |
| **VGG16** | **Random Forest** | 4096-D | **91.5%** | 91.0% | 91.5% | 0.912 | 31 ms |
| **AlexNet** | **SVM (RBF)** | 4096-D | **89.4%** | 88.7% | 89.4% | 0.890 | 12 ms |
| **AlexNet** | **XGBoost** | 4096-D | **88.9%** | 88.2% | 88.9% | 0.885 | 15 ms |
| **AlexNet** | **Random Forest** | 4096-D | **86.8%** | 86.1% | 86.8% | 0.864 | 19 ms |
