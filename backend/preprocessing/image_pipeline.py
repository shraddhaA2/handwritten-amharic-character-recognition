"""
Image Preprocessing Pipeline for Handwritten Amharic Character Recognition
- Grayscale Conversion
- Noise Removal (Median Filter / Gaussian Blur)
- Adaptive Binarization (Otsu's Thresholding)
- Character Centering & Bounding Box Extraction
- Resizing to 224x224
- Normalization with ImageNet Standard Parameters
"""

import cv2
import numpy as np
import base64
import io
from PIL import Image

class PreprocessingPipeline:
    def __init__(self, target_size=(224, 224)):
        self.target_size = target_size
        self.mean = np.array([0.485, 0.456, 0.406])
        self.std = np.array([0.229, 0.224, 0.225])

    def to_grayscale(self, image: np.ndarray) -> np.ndarray:
        if len(image.shape) == 3:
            return cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        return image

    def remove_noise(self, gray: np.ndarray) -> np.ndarray:
        # 3x3 Median filter to remove salt-and-pepper stroke noise
        return cv2.medianBlur(gray, 3)

    def binarize_otsu(self, gray: np.ndarray) -> tuple:
        # Otsu's thresholding
        thresh_val, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        return thresh_val, binary

    def center_and_crop(self, binary: np.ndarray, gray: np.ndarray) -> np.ndarray:
        # Find contours / bounding box of character glyph
        coords = cv2.findNonZero(binary)
        if coords is None:
            return cv2.resize(gray, self.target_size)

        x, y, w, h = cv2.boundingRect(coords)
        pad = max(int(max(w, h) * 0.15), 10)

        # Create square canvas with white background
        size = max(w, h) + 2 * pad
        square = np.ones((size, size), dtype=np.uint8) * 255

        start_x = (size - w) // 2
        start_y = (size - h) // 2

        square[start_y:start_y+h, start_x:start_x+w] = gray[y:y+h, x:x+w]
        return square

    def resize(self, img: np.ndarray) -> np.ndarray:
        return cv2.resize(img, self.target_size, interpolation=cv2.INTER_AREA)

    def normalize(self, img_resized: np.ndarray) -> np.ndarray:
        # Convert to 3-channel RGB float [0, 1]
        rgb = cv2.cvtColor(img_resized, cv2.COLOR_GRAY2RGB).astype(np.float32) / 255.0
        normalized = (rgb - self.mean) / self.std
        # Transpose to PyTorch standard [C, H, W]
        return np.transpose(normalized, (2, 0, 1))

    def _to_base64(self, img: np.ndarray) -> str:
        pil_img = Image.fromarray(img)
        buff = io.BytesIO()
        pil_img.save(buff, format="PNG")
        return "data:image/png;base64," + base64.b64encode(buff.getvalue()).decode("utf-8")

    def run_pipeline(self, image: np.ndarray) -> dict:
        gray = self.to_grayscale(image)
        denoised = self.remove_noise(gray)
        otsu_val, binary = self.binarize_otsu(denoised)
        centered = self.center_and_crop(binary, denoised)
        resized = self.resize(centered)
        tensor = self.normalize(resized)

        return {
            "tensor": tensor,
            "otsu_threshold": float(otsu_val),
            "mean_intensity": float(np.mean(gray)),
            "grayscale_b64": self._to_base64(gray),
            "denoised_b64": self._to_base64(denoised),
            "resized_b64": self._to_base64(resized),
            "normalized_b64": self._to_base64((resized).astype(np.uint8))
        }
