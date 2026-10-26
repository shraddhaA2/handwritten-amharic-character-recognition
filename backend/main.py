"""
FastAPI Backend for Handwritten Amharic Character Recognition (HACR)
Exposes clean REST endpoints for model health and single-image character recognition.
"""
import io
import json
from typing import Optional, Dict, Any

from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from ml.config import (
    SVM_MODEL_PATH,
    LABEL_MAPPING_PATH,
    get_character_info,
)
from ml.predict import get_predictor

app = FastAPI(
    title="Handwritten Amharic Character Recognition API",
    description="Transfer Learning: Pretrained ResNet50 Feature Extractor + Linear SVM Classifier",
    version="1.0.0",
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class JsonPredictRequest(BaseModel):
    image: Optional[str] = None
    image_base64: Optional[str] = None


@app.get("/")
@app.get("/api")
def root():
    """Root health check endpoint."""
    return {
        "status": "ok",
        "service": "Handwritten Amharic Character Recognition (HACR) API",
        "endpoints": {
            "health": "/health",
            "predict": "/predict",
            "docs": "/docs",
        },
    }


@app.get("/health")
@app.get("/api/health")
def health_check():
    """Detailed health check endpoint indicating model readiness."""
    model_ready = SVM_MODEL_PATH.exists()
    return {
        "status": "ready" if model_ready else "error",
        "service": "Handwritten Amharic Character Recognition",
        "model_loaded": model_ready,
        "model_file": str(SVM_MODEL_PATH.name),
        "model_type": "Linear SVM (LinearSVC)",
        "feature_extractor": "ResNet50 (ImageNet Pretrained)",
        "feature_dimension": 2048,
        "total_classes": 238,
    }


@app.post("/predict")
@app.post("/api/predict")
async def predict_character(
    request: Request,
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
):
    """
    Main prediction endpoint.
    Accepts:
      1. Multipart file upload: key 'file'
      2. Form data base64 string: key 'image_base64'
      3. JSON payload: {"image": "..."} or {"image_base64": "..."}
    """
    image_data = None

    # 1. Check if multipart file upload
    if file is not None and file.filename:
        image_data = await file.read()
        if not image_data:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # 2. Check form data base64
    elif image_base64:
        image_data = image_base64.strip()

    # 3. Check JSON body
    else:
        try:
            content_type = request.headers.get("content-type", "")
            if "application/json" in content_type:
                body = await request.json()
                image_data = body.get("image") or body.get("image_base64")
        except Exception:
            image_data = None

    if not image_data:
        raise HTTPException(
            status_code=400,
            detail="No image provided. Please upload an image file (multipart/form-data) or provide a base64 string.",
        )

    try:
        predictor = get_predictor()
        result = predictor.predict(image_data, return_top_k=5)
        return JSONResponse(content=result)
    except FileNotFoundError as fnf:
        raise HTTPException(status_code=500, detail=str(fnf))
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=f"Invalid image format: {str(ve)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
