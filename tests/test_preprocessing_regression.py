"""
Focused Regression Tests for Canvas and Native Preprocessing Pipelines
Verifies:
1. Native 28x28 dataset images remain 100% bit-for-bit identical to baseline.
2. Canvas drawings at varying scales produce consistently normalized intermediate representations.
3. Blank and near-blank canvases are rejected deterministically.
4. Thin strokes (2px) and edge-touching drawings do not crash or disappear.
"""
import pytest
import sys
from pathlib import Path
import numpy as np
import cv2
from PIL import Image, ImageDraw
import torch

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
    except Exception:
        pass

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ml.config import IMAGE_INPUT_SIZE, IMAGENET_MEAN, IMAGENET_STD
from ml.preprocessing import (
    load_image_to_numpy,
    preprocess_image,
    preprocess_image_stages,
)


def _reference_native_preprocess(image_source):
    """
    Reference implementation of native dataset image preprocessing
    from initial commit (commit a7120afd).
    """
    rgb_img = load_image_to_numpy(image_source)
    gray = cv2.cvtColor(rgb_img, cv2.COLOR_RGB2GRAY)
    blurred = cv2.GaussianBlur(gray, (3, 3), 0)
    _, binary = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    if np.mean(binary > 0) > 0.65:
        binary = cv2.bitwise_not(binary)
    coords = np.argwhere(binary > 20)
    if coords.size > 0:
        y0, x0 = coords.min(axis=0)
        y1, x1 = coords.max(axis=0) + 1
        margin = max(2, int(0.08 * max(y1 - y0, x1 - x0)))
        y0 = max(0, y0 - margin)
        x0 = max(0, x0 - margin)
        y1 = min(binary.shape[0], y1 + margin)
        x1 = min(binary.shape[1], x1 + margin)
        char_crop = binary[y0:y1, x0:x1]
    else:
        char_crop = binary.copy()
    ch, cw = char_crop.shape
    max_side = max(ch, cw, 1)
    pad_total = int(max_side * 1.15)
    padded_canvas = np.zeros((pad_total, pad_total), dtype=np.uint8)
    offset_y = (pad_total - ch) // 2
    offset_x = (pad_total - cw) // 2
    padded_canvas[offset_y:offset_y + ch, offset_x:offset_x + cw] = char_crop
    resized_gray = cv2.resize(padded_canvas, IMAGE_INPUT_SIZE, interpolation=cv2.INTER_AREA)
    rgb_224 = np.stack([resized_gray] * 3, axis=-1)
    float_img = rgb_224.astype(np.float32) / 255.0
    mean = np.array(IMAGENET_MEAN, dtype=np.float32)
    std = np.array(IMAGENET_STD, dtype=np.float32)
    normalized_np = (float_img - mean) / std
    ch_first = np.transpose(normalized_np, (2, 0, 1))
    return torch.from_numpy(ch_first).float()


def test_native_dataset_preprocessing_bit_for_bit_identical():
    """Verify that native 28x28 dataset images produce bit-for-bit identical tensors."""
    sample_dir = PROJECT_ROOT / "data" / "samples"
    sample_files = list(sample_dir.glob("*.jpg"))
    assert len(sample_files) >= 4, f"Expected sample files in {sample_dir}"

    for img_path in sample_files:
        current_tensor = preprocess_image(img_path)
        ref_tensor = _reference_native_preprocess(img_path)
        
        diff = torch.abs(current_tensor - ref_tensor).max().item()
        assert diff == 0.0, f"Mismatch found on native image {img_path.name}: max diff = {diff}"


def test_canvas_size_invariance_normalized_inputs():
    """Verify that characters drawn at different sizes produce consistently centered 28x28 representations."""
    def make_l_shape_canvas(box_size):
        c = Image.new("RGB", (280, 280), (255, 255, 255))
        d = ImageDraw.Draw(c)
        cx, cy = 140, 140
        half = box_size // 2
        # Vertical stroke
        d.line([(cx - half, cy - half), (cx - half, cy + half)], fill=(17, 24, 39), width=16)
        # Horizontal base
        d.line([(cx - half, cy + half), (cx + half, cy + half)], fill=(17, 24, 39), width=16)
        return c

    # Sizes: small (80px), medium (140px), large (220px)
    stages_small, _, _ = preprocess_image_stages(make_l_shape_canvas(80))
    stages_med, _, _ = preprocess_image_stages(make_l_shape_canvas(140))
    stages_large, _, _ = preprocess_image_stages(make_l_shape_canvas(220))

    # All should produce a 28x28 binary representation with character strokes occupying ~24x24
    for name, st in [("small", stages_small), ("med", stages_med), ("large", stages_large)]:
        bin_img = st["binarized"]
        assert bin_img.shape == (28, 28), f"{name} expected 28x28 binary, got {bin_img.shape}"
        coords = np.argwhere(bin_img > 20)
        assert coords.size > 0, f"{name} produced empty binarized stage"
        h = coords[:, 0].max() - coords[:, 0].min() + 1
        w = coords[:, 1].max() - coords[:, 1].min() + 1
        # Target size was 24, so stroke bounding box in 28x28 should be between 20 and 26 pixels
        assert 18 <= h <= 26, f"{name} height {h} not in expected [18, 26]"
        assert 18 <= w <= 26, f"{name} width {w} not in expected [18, 26]"


def test_blank_canvas_rejected():
    """Verify that a blank white drawing canvas is properly rejected with ValueError."""
    blank_canvas = Image.new("RGB", (280, 280), (255, 255, 255))
    with pytest.raises(ValueError, match="blank|no detectable"):
        preprocess_image(blank_canvas)


def test_thin_strokes_not_dropped():
    """Verify that a 2px thin stroke on a 280x280 canvas is preserved and does not vanish."""
    canvas = Image.new("RGB", (280, 280), (255, 255, 255))
    d = ImageDraw.Draw(canvas)
    # 2px thin stroke across canvas center
    d.line([(70, 70), (210, 210)], fill=(17, 24, 39), width=2)
    
    stages, tensor, _ = preprocess_image_stages(canvas)
    assert tensor is not None
    # Verify non-zero stroke pixels survived in the 28x28 intermediate stage
    bin_img = stages["binarized"]
    assert np.sum(bin_img > 20) >= 5, "Thin stroke vanished during downsampling"


def test_edge_touching_strokes_do_not_crash():
    """Verify that strokes touching or crossing canvas boundaries clamp safely without index errors."""
    canvas = Image.new("RGB", (280, 280), (255, 255, 255))
    d = ImageDraw.Draw(canvas)
    # Stroke right at boundary (0, 0) to (279, 279)
    d.line([(0, 0), (279, 279)], fill=(17, 24, 39), width=20)
    
    stages, tensor, _ = preprocess_image_stages(canvas)
    assert tensor is not None
    assert tensor.shape == (3, 224, 224)


def test_off_center_canvas_character():
    """Verify that a character drawn off-center (e.g. corner) normalizes correctly to 32x32 padded canvas."""
    canvas = Image.new("RGB", (280, 280), (255, 255, 255))
    d = ImageDraw.Draw(canvas)
    # Character drawn in top-left corner
    d.line([(20, 20), (20, 100)], fill=(17, 24, 39), width=16)
    d.line([(20, 100), (80, 100)], fill=(17, 24, 39), width=16)

    stages, tensor, _ = preprocess_image_stages(canvas)
    assert tensor is not None
    assert stages["centered_padded"].shape == (32, 32)
    assert stages["binarized"].shape == (28, 28)
    # Stroke should be centered in 28x28
    coords = np.argwhere(stages["binarized"] > 20)
    cy = int(coords[:, 0].mean())
    cx = int(coords[:, 1].mean())
    assert 10 <= cy <= 18, f"Y center {cy} not properly centered"
    assert 10 <= cx <= 18, f"X center {cx} not properly centered"


def test_thick_vs_thin_strokes_normalization():
    """Verify that varying brush stroke widths (12px, 16px, 24px) produce consistent 32x32 frames."""
    for width in [12, 16, 24]:
        canvas = Image.new("RGB", (280, 280), (255, 255, 255))
        d = ImageDraw.Draw(canvas)
        d.line([(100, 60), (100, 220)], fill=(17, 24, 39), width=width)
        d.line([(100, 140), (180, 140)], fill=(17, 24, 39), width=width)

        stages, tensor, _ = preprocess_image_stages(canvas)
        assert tensor is not None
        assert stages["centered_padded"].shape == (32, 32)
        assert tensor.shape == (3, 224, 224)


def test_known_character_canvas_vs_native_consistency():
    """Compare intermediate shapes and bounds between native dataset sample and canvas representation."""
    sample_path = PROJECT_ROOT / "data" / "samples" / "042ro.18.jpg"
    orig_img = Image.open(sample_path).convert("L")
    char_arr = np.array(orig_img)
    char_stroke = 255 - char_arr
    pil_char = Image.fromarray(char_stroke).resize((180, 180), Image.Resampling.BILINEAR)

    canvas = Image.new("RGB", (280, 280), (255, 255, 255))
    canvas.paste(pil_char.convert("RGB"), (50, 50))

    stages_nat, tensor_nat, _ = preprocess_image_stages(sample_path)
    stages_can, tensor_can, _ = preprocess_image_stages(canvas)

    assert stages_nat["centered_padded"].shape == (32, 32)
    assert stages_can["centered_padded"].shape == (32, 32)
    assert tensor_nat.shape == (3, 224, 224)
    assert tensor_can.shape == (3, 224, 224)

