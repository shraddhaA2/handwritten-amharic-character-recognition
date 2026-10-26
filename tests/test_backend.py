"""
Automated Integration Tests for Handwritten Amharic Character Recognition
Tests FastAPI Endpoints and ML Prediction Pipeline
"""
import pytest
import sys
from pathlib import Path
from fastapi.testclient import TestClient

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
    except Exception:
        pass

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.main import app

client = TestClient(app)
PROJECT_ROOT = Path(__file__).resolve().parent.parent


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "service" in data


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["model_loaded"] is True
    assert data["total_classes"] == 238


def test_predict_missing_image():
    response = client.post("/predict")
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data


def test_predict_real_sample_he():
    sample_path = PROJECT_ROOT / "data" / "samples" / "001he.1.jpg"
    assert sample_path.exists(), f"Sample file not found at {sample_path}"

    with open(sample_path, "rb") as f:
        response = client.post(
            "/predict",
            files={"file": ("001he.1.jpg", f, "image/jpeg")},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["predicted_character"] == "ሀ"
    assert data["class_id"] == 0
    assert data["class_label"] == "001he"
    assert data["phonetic"] == "he"
    assert data["confidence"] > 0
    assert len(data["top_candidates"]) == 5


def test_predict_real_sample_fe():
    sample_path = PROJECT_ROOT / "data" / "samples" / "225fe.134.jpg"
    assert sample_path.exists(), f"Sample file not found at {sample_path}"

    with open(sample_path, "rb") as f:
        response = client.post(
            "/predict",
            files={"file": ("225fe.134.jpg", f, "image/jpeg")},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["predicted_character"] == "ፈ"
    assert data["class_id"] == 224
    assert data["class_label"] == "225fe"
    assert data["phonetic"] == "fe"
    assert data["confidence"] > 0
    assert len(data["top_candidates"]) == 5


def test_predict_blank_canvas_rejected():
    """Verify that a blank white drawing canvas is rejected with HTTP 400."""
    import io
    from PIL import Image

    blank_img = Image.new("RGB", (280, 280), (255, 255, 255))
    buf = io.BytesIO()
    blank_img.save(buf, format="PNG")
    buf.seek(0)

    response = client.post(
        "/predict",
        files={"file": ("drawn_blank.png", buf.getvalue(), "image/png")},
    )

    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "blank" in data["detail"].lower() or "no detectable" in data["detail"].lower()


def test_predict_drawn_canvas_png():
    """Verify that a drawn character PNG from the canvas is successfully recognized."""
    import io
    from PIL import Image, ImageDraw

    # Simulate drawing 'ሀ' on a 280x280 white canvas
    canvas = Image.new("RGB", (280, 280), (255, 255, 255))
    draw = ImageDraw.Draw(canvas)
    # Left stroke, top arch, right stroke
    draw.line([(80, 70), (80, 220)], fill=(17, 24, 39), width=16)
    draw.line([(80, 70), (200, 70)], fill=(17, 24, 39), width=16)
    draw.line([(200, 70), (200, 220)], fill=(17, 24, 39), width=16)

    buf = io.BytesIO()
    canvas.save(buf, format="PNG")
    buf.seek(0)

    response = client.post(
        "/predict",
        files={"file": ("drawn_canvas.png", buf.getvalue(), "image/png")},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "predicted_character" in data
    assert isinstance(data["predicted_character"], str) and len(data["predicted_character"]) > 0
    assert "phonetic" in data
    assert data["class_id"] >= 0 and data["class_id"] < 238
    assert len(data["top_candidates"]) == 5
    assert data["top_candidates"][0]["rank"] == 1


if __name__ == "__main__":
    test_root_endpoint()
    print("✓ test_root_endpoint passed")
    test_health_endpoint()
    print("✓ test_health_endpoint passed")
    test_predict_missing_image()
    print("✓ test_predict_missing_image passed")
    test_predict_real_sample_he()
    print("✓ test_predict_real_sample_he passed")
    test_predict_real_sample_fe()
    print("✓ test_predict_real_sample_fe passed")
    test_predict_blank_canvas_rejected()
    print("✓ test_predict_blank_canvas_rejected passed")
    test_predict_drawn_canvas_png()
    print("✓ test_predict_drawn_canvas_png passed")
    print("\nAll integration tests passed successfully!")

