"""
Unified Preprocessing Pipeline for Handwritten Amharic Character Recognition
Used consistently for both training and inference.
"""
import io
import base64
import numpy as np
from PIL import Image

try:
    import cv2
except ImportError:
    cv2 = None

try:
    import torch
    from torchvision import transforms
except ImportError:
    torch = None
    transforms = None

from .config import IMAGE_INPUT_SIZE, IMAGENET_MEAN, IMAGENET_STD

def load_image_to_numpy(image_source):
    """
    Accepts image path, PIL Image, raw bytes, base64 data string, or numpy array.
    Returns: RGB numpy array (H, W, 3) with uint8 values in [0, 255].
    """
    if isinstance(image_source, np.ndarray):
        if image_source.ndim == 2:
            return np.stack([image_source] * 3, axis=-1)
        elif image_source.ndim == 3 and image_source.shape[2] == 4:
            # RGBA to RGB with white background
            alpha = image_source[:, :, 3] / 255.0
            rgb = image_source[:, :, :3]
            white = np.ones_like(rgb) * 255
            combined = (rgb * alpha[:, :, None] + white * (1.0 - alpha[:, :, None])).astype(np.uint8)
            return combined
        elif image_source.ndim == 3:
            return image_source[:, :, :3]
        return image_source

    if isinstance(image_source, Image.Image):
        img = image_source.convert("RGB")
        return np.array(img)

    if isinstance(image_source, str):
        # Check if base64 data URL
        if image_source.startswith("data:image"):
            header, encoded = image_source.split(",", 1)
            data = base64.b64decode(encoded)
            pil_img = Image.open(io.BytesIO(data)).convert("RGB")
            return np.array(pil_img)
        elif len(image_source) > 300 and not image_source.endswith((".jpg", ".png", ".jpeg")):
            data = base64.b64decode(image_source)
            pil_img = Image.open(io.BytesIO(data)).convert("RGB")
            return np.array(pil_img)
        else:
            # File path
            pil_img = Image.open(image_source).convert("RGB")
            return np.array(pil_img)

    if isinstance(image_source, bytes):
        pil_img = Image.open(io.BytesIO(image_source)).convert("RGB")
        return np.array(pil_img)

    raise ValueError(f"Unsupported image source type: {type(image_source)}")


def preprocess_image_stages(image_source):
    """
    Applies the full 8-step preprocessing pipeline.
    Returns:
      stages: dict with intermediate numpy images for visualization
      tensor: torch.Tensor [3, 224, 224] ready for ResNet50 (if torch available)
      normalized_np: numpy array [3, 224, 224] float32 normalized
    """
    # 1. Load Image
    rgb_img = load_image_to_numpy(image_source)
    orig_h, orig_w = rgb_img.shape[:2]

    # 2. Convert to Grayscale
    if cv2 is not None:
        gray = cv2.cvtColor(rgb_img, cv2.COLOR_RGB2GRAY)
    else:
        # Standard luminance formula: 0.299 R + 0.587 G + 0.114 B
        gray = (0.299 * rgb_img[:, :, 0] + 0.587 * rgb_img[:, :, 1] + 0.114 * rgb_img[:, :, 2]).astype(np.uint8)

    # 3. Noise Reduction (Gaussian blur)
    if cv2 is not None:
        blurred = cv2.GaussianBlur(gray, (3, 3), 0)
    else:
        blurred = gray.copy()

    # 4. Thresholding / Binarization (Otsu / Adaptive)
    # Most Amharic dataset samples have dark character strokes on light background
    if cv2 is not None:
        _, binary = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    else:
        # Simple Otsu-like threshold
        mean_val = np.mean(blurred)
        binary = np.where(blurred < mean_val, 255, 0).astype(np.uint8)

    # Invert check: ensure character strokes are foreground (non-zero)
    # If more than 50% is foreground, invert it back
    if np.mean(binary > 0) > 0.65:
        binary = cv2.bitwise_not(binary) if cv2 is not None else 255 - binary

    # 5. Character Bounding Box Detection & Center-Padding
    # Find bounding box of foreground strokes
    coords = np.argwhere(binary > 20)
    if coords.size > 0:
        y0, x0 = coords.min(axis=0)
        y1, x1 = coords.max(axis=0) + 1
        
        # Add safety margin
        margin = max(2, int(0.08 * max(y1 - y0, x1 - x0)))
        y0 = max(0, y0 - margin)
        x0 = max(0, x0 - margin)
        y1 = min(binary.shape[0], y1 + margin)
        x1 = min(binary.shape[1], x1 + margin)
        
        char_crop = binary[y0:y1, x0:x1]
    else:
        char_crop = binary.copy()

    # Aspect-ratio preserving square padding
    ch, cw = char_crop.shape
    max_side = max(ch, cw, 1)
    # Pad to square with generous centered border
    pad_total = int(max_side * 1.15)
    padded_canvas = np.zeros((pad_total, pad_total), dtype=np.uint8)
    
    offset_y = (pad_total - ch) // 2
    offset_x = (pad_total - cw) // 2
    padded_canvas[offset_y:offset_y + ch, offset_x:offset_x + cw] = char_crop

    # 6. Resize to 224 × 224
    if cv2 is not None:
        resized_gray = cv2.resize(padded_canvas, IMAGE_INPUT_SIZE, interpolation=cv2.INTER_AREA)
    else:
        pil_padded = Image.fromarray(padded_canvas)
        pil_resized = pil_padded.resize(IMAGE_INPUT_SIZE, Image.Resampling.BILINEAR)
        resized_gray = np.array(pil_resized)

    # 7. Convert grayscale to 3 channels RGB (ResNet50 expects 3-channel input)
    # Standard format: white character on dark background or standard RGB inverted as needed
    # We maintain 3 channels: [224, 224, 3]
    rgb_224 = np.stack([resized_gray] * 3, axis=-1)

    # 8. ImageNet Normalization (range [0, 1] then subtract mean, divide std)
    float_img = rgb_224.astype(np.float32) / 255.0
    mean = np.array(IMAGENET_MEAN, dtype=np.float32)
    std = np.array(IMAGENET_STD, dtype=np.float32)
    normalized_np = (float_img - mean) / std  # Shape: (224, 224, 3)
    
    # Transpose to (3, 224, 224)
    ch_first_normalized = np.transpose(normalized_np, (2, 0, 1))

    # PyTorch Tensor if torch is available
    tensor = None
    if torch is not None:
        tensor = torch.from_numpy(ch_first_normalized).float()

    stages = {
        "original": rgb_img,
        "grayscale": gray,
        "binarized": binary,
        "centered_padded": padded_canvas,
        "resized_224": rgb_224,
        "normalized_shape": ch_first_normalized.shape,
        "original_dimensions": {"width": orig_w, "height": orig_h},
    }

    return stages, tensor, ch_first_normalized


def preprocess_image(image_source):
    """
    Standard entrypoint for preprocessing.
    Returns: torch.Tensor [3, 224, 224] if torch available, else numpy array [3, 224, 224].
    """
    _, tensor, np_arr = preprocess_image_stages(image_source)
    if tensor is not None:
        return tensor
    return np_arr
