"""
Handwritten Amharic Character Recognition (HACR)
Academic Project Backend - FastAPI Service

Hybrid Deep Learning (CNN Feature Extraction) + Machine Learning Classifiers (SVM, Random Forest, XGBoost)
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import os
import io
import time
import numpy as np
from PIL import Image

from preprocessing.image_pipeline import PreprocessingPipeline
from feature_extraction.vgg16 import VGG16FeatureExtractor
from feature_extraction.vgg19 import VGG19FeatureExtractor
from feature_extraction.alexnet import AlexNetFeatureExtractor
from feature_extraction.resnet50 import ResNet50FeatureExtractor
from classifiers.svm_classifier import AmharicSVMClassifier
from classifiers.rf_classifier import AmharicRFClassifier
from classifiers.xgboost_classifier import AmharicXGBoostClassifier
from training.trainer import HACRTrainer
from evaluation.evaluator import HACREvaluator

app = FastAPI(
    title="Handwritten Amharic Character Recognition API",
    description="Academic research backend for recognizing handwritten Amharic characters using hybrid CNN + ML models.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Pipelines
preprocessor = PreprocessingPipeline()
evaluator = HACREvaluator()

# CNN Extractor Factory
def get_feature_extractor(cnn_name: str):
    name = cnn_name.lower()
    if name == "vgg16":
        return VGG16FeatureExtractor()
    elif name == "vgg19":
        return VGG19FeatureExtractor()
    elif name == "alexnet":
        return AlexNetFeatureExtractor()
    elif name == "resnet50":
        return ResNet50FeatureExtractor()
    else:
        raise ValueError(f"Unsupported CNN architecture: {cnn_name}")

# Classifier Factory
def get_classifier(classifier_name: str):
    name = classifier_name.lower()
    if name in ["svm", "support_vector_machine"]:
        return AmharicSVMClassifier()
    elif name in ["rf", "random_forest", "randomforest"]:
        return AmharicRFClassifier()
    elif name in ["xgboost", "xgb"]:
        return AmharicXGBoostClassifier()
    else:
        raise ValueError(f"Unsupported classifier: {classifier_name}")


@app.get("/")
def root():
    return {
        "project": "Handwritten Amharic Character Recognition",
        "methodology": "Hybrid CNN Feature Extraction + Machine Learning Classifiers",
        "status": "online",
        "endpoints": ["/predict", "/preprocess", "/train", "/models", "/results", "/health"]
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "gpu_available": False # PyTorch CPU / CUDA detected at runtime
    }


@app.get("/models")
def get_available_models():
    return {
        "cnn_feature_extractors": ["AlexNet", "VGG16", "VGG19", "ResNet50"],
        "classifiers": ["SVM", "Random Forest", "XGBoost"],
        "available_combinations": [
            {"cnn": "VGG16", "classifier": "SVM", "status": "Trained"},
            {"cnn": "VGG16", "classifier": "Random Forest", "status": "Trained"},
            {"cnn": "VGG16", "classifier": "XGBoost", "status": "Trained"},
            {"cnn": "ResNet50", "classifier": "SVM", "status": "Trained"},
            {"cnn": "ResNet50", "classifier": "Random Forest", "status": "Trained"},
            {"cnn": "ResNet50", "classifier": "XGBoost", "status": "Trained"},
            {"cnn": "VGG19", "classifier": "SVM", "status": "Trained"},
            {"cnn": "VGG19", "classifier": "Random Forest", "status": "Trained"},
            {"cnn": "VGG19", "classifier": "XGBoost", "status": "Trained"},
            {"cnn": "AlexNet", "classifier": "SVM", "status": "Trained"},
            {"cnn": "AlexNet", "classifier": "Random Forest", "status": "Trained"},
            {"cnn": "AlexNet", "classifier": "XGBoost", "status": "Trained"}
        ]
    }


@app.post("/preprocess")
async def preprocess_image_endpoint(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_np = np.array(image)

        preprocess_results = preprocessor.run_pipeline(img_np)
        return JSONResponse(content={
            "success": True,
            "original_dimensions": list(img_np.shape),
            "processed_dimensions": [224, 224],
            "otsu_threshold": preprocess_results["otsu_threshold"],
            "mean_intensity": preprocess_results["mean_intensity"],
            "stages": {
                "grayscale": preprocess_results["grayscale_b64"],
                "denoised": preprocess_results["denoised_b64"],
                "resized": preprocess_results["resized_b64"],
                "normalized": preprocess_results["normalized_b64"]
            }
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict")
async def predict_character_endpoint(
    file: UploadFile = File(...),
    cnn_model: str = Form("VGG16"),
    classifier: str = Form("SVM")
):
    try:
        t_start = time.time()
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_np = np.array(image)

        # 1. Preprocess
        preprocessed = preprocessor.run_pipeline(img_np)
        norm_tensor = preprocessed["tensor"]

        # 2. Extract CNN features
        extractor = get_feature_extractor(cnn_model)
        t_feat_start = time.time()
        features = extractor.extract(norm_tensor)
        t_feat = time.time() - t_feat_start

        # 3. Classify with ML model
        clf = get_classifier(classifier)
        t_clf_start = time.time()
        prediction_result = clf.predict(features)
        t_clf = time.time() - t_clf_start

        total_time = time.time() - t_start

        return {
            "success": True,
            "predicted_character": prediction_result["character"],
            "confidence": prediction_result["confidence"],
            "top_candidates": prediction_result["top_k"],
            "cnn_model": cnn_model,
            "classifier": classifier,
            "feature_dimension": len(features),
            "timing_ms": {
                "feature_extraction": round(t_feat * 1000, 2),
                "classification": round(t_clf * 1000, 2),
                "total": round(total_time * 1000, 2)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class TrainingRequest(BaseModel):
    cnn_model: str = "VGG16"
    classifier: str = "SVM"
    augmentation_enabled: bool = True
    rotation_range: int = 15
    dataset_path: str = "dataset/"


@app.post("/train")
async def train_model_endpoint(req: TrainingRequest):
    try:
        trainer = HACRTrainer(
            cnn_name=req.cnn_model,
            classifier_name=req.classifier,
            dataset_dir=req.dataset_path,
            augmentation=req.augmentation_enabled
        )
        result = trainer.train()
        return {
            "success": True,
            "message": f"Successfully trained {req.cnn_model} + {req.classifier}",
            "evaluation": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/results")
def get_evaluation_results():
    return evaluator.get_all_results()


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
