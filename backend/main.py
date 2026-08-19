"""
FastAPI Backend for Handwritten Amharic Character Recognition
Serves ResNet50 Transfer Learning + SVM Classification API
"""
import io
import json
import base64
from pathlib import Path
from typing import Optional, List
from pydantic import BaseModel

try:
    from fastapi import FastAPI, File, UploadFile, HTTPException, Form
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
except ImportError:
    FastAPI = None

from ml.config import (
    SVM_MODEL_PATH,
    LABEL_ENCODER_PATH,
    RESULTS_JSON_PATH,
    CLASSIFICATION_REPORT_PATH,
    load_categories_map
)
from ml.preprocessing import preprocess_image_stages
from ml.predict import get_predictor

app = FastAPI(
    title="Handwritten Amharic Character Recognition API",
    description="Transfer Learning: ResNet50 Penultimate Feature Extraction + SVM Classifier",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Base64PredictRequest(BaseModel):
    image_base64: str
    top_k: Optional[int] = 5

@app.get("/health")
def health_check():
    """Health check endpoint indicating model loading status."""
    model_loaded = SVM_MODEL_PATH.exists() and LABEL_ENCODER_PATH.exists()
    categories = load_categories_map()
    
    return {
        "status": "ok",
        "service": "Handwritten Amharic Character Recognition",
        "model": "ResNet50 + SVM",
        "model_loaded": model_loaded,
        "classes_count": len(categories),
        "feature_dim": 2048
    }

@app.get("/categories")
def get_categories():
    """Returns all 238 Amharic character categories and metadata."""
    categories = load_categories_map()
    return {
        "total_classes": len(categories),
        "categories": list(categories.values())
    }

@app.get("/metrics")
def get_metrics():
    """Returns model evaluation metrics, reports, and comparison benchmarks."""
    metrics_data = {}
    if RESULTS_JSON_PATH.exists():
        try:
            with open(RESULTS_JSON_PATH, "r", encoding="utf-8") as f:
                metrics_data = json.load(f)
        except Exception:
            pass

    report_text = ""
    if CLASSIFICATION_REPORT_PATH.exists():
        try:
            with open(CLASSIFICATION_REPORT_PATH, "r", encoding="utf-8") as f:
                report_text = f.read()
        except Exception:
            pass

    return {
        "results": metrics_data,
        "classification_report": report_text,
        "model_architecture": "Pretrained ResNet50 (2048-d Penultimate Pool) + SVM (RBF Kernel)",
        "pipeline_description": "Transfer learning using ImageNet-pretrained ResNet50 CNN for deep representation extraction and Support Vector Classifier for multi-class categorization."
    }

@app.post("/predict")
async def predict_character(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None)
):
    """
    Inference endpoint:
    Uploaded Image -> Preprocessing -> ResNet50 Features -> SVM Prediction -> JSON Result
    """
    predictor = get_predictor()
    
    try:
        if file is not None:
            contents = await file.read()
            result = predictor.predict(contents)
        elif image_base64 is not None and len(image_base64) > 0:
            result = predictor.predict(image_base64)
        else:
            raise HTTPException(status_code=400, detail="Must provide either an uploaded file or image_base64 string.")

        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict-json")
def predict_json(req: Base64PredictRequest):
    """JSON payload endpoint for base64 canvas/drawing inputs."""
    predictor = get_predictor()
    try:
        result = predictor.predict(req.image_base64, return_top_k=req.top_k or 5)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/preprocess-preview")
async def preprocess_preview(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None)
):
    """Returns visual representation of each step in the preprocessing pipeline."""
    try:
        if file is not None:
            data = await file.read()
        elif image_base64 is not None:
            data = image_base64
        else:
            raise HTTPException(status_code=400, detail="No image provided")

        stages, _, _ = preprocess_image_stages(data)
        
        # Convert numpy stages to base64 PNGs for preview
        import cv2
        from PIL import Image
        
        encoded_stages = {}
        for stage_name in ["grayscale", "binarized", "centered_padded", "resized_224"]:
            arr = stages.get(stage_name)
            if arr is not None:
                pil_img = Image.fromarray(arr)
                buffered = io.BytesIO()
                pil_img.save(buffered, format="PNG")
                encoded_stages[stage_name] = f"data:image/png;base64,{base64.b64encode(buffered.getvalue()).decode('utf-8')}"

        return {
            "success": True,
            "dimensions": stages.get("original_dimensions", {}),
            "stages": encoded_stages
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
