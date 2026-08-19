"""
ResNet50 Feature Extractor Module for Transfer Learning
Extracts 2048-dimensional feature vectors from penultimate layer of ImageNet-pretrained ResNet50.
Strictly requires PyTorch and torchvision. No fake or random fallbacks.
"""
import numpy as np

try:
    import torch
    import torch.nn as nn
    from torchvision.models import resnet50, ResNet50_Weights
except ImportError:
    torch = None
    nn = None
    resnet50 = None
    ResNet50_Weights = None

from .config import FEATURE_DIM

class ResNet50FeatureExtractor:
    def __init__(self, device=None):
        """
        Initializes pretrained ResNet50 model with final FC classification layer bypassed with Identity.
        Model is set to eval() mode with all parameters frozen.
        """
        if torch is None or resnet50 is None:
            raise RuntimeError(
                "PyTorch and Torchvision are required for ResNet50 feature extraction. "
                "Fake or simulated features are strictly disabled."
            )

        if device is None:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        else:
            self.device = torch.device(device)

        print(f"[Feature Extractor] Loading ImageNet-pretrained ResNet50 on device: {self.device}")
        
        # Load torchvision pretrained ResNet50 with official ImageNet weights
        try:
            weights = ResNet50_Weights.DEFAULT
            self.model = resnet50(weights=weights)
        except Exception:
            self.model = resnet50(pretrained=True)

        # Remove/bypass the final classification layer to extract raw 2048-dim penultimate features
        self.model.fc = nn.Identity()
        
        # Freeze all model parameters
        for param in self.model.parameters():
            param.requires_grad = False
            
        self.model.eval()
        self.model.to(self.device)
        print(f"[Feature Extractor] Real ResNet50 initialized. Penultimate feature output dimension: {FEATURE_DIM}")

    def extract_features(self, tensor_or_np):
        """
        Extracts real 2048-dimensional feature vector for a single preprocessed image.
        Input: torch.Tensor [3, 224, 224] or [1, 3, 224, 224] or numpy array.
        Output: 1D numpy array of shape (2048,)
        """
        if self.model is None:
            raise RuntimeError("ResNet50 model is not loaded. Cannot extract features.")

        if isinstance(tensor_or_np, np.ndarray):
            tensor = torch.from_numpy(tensor_or_np).float()
        else:
            tensor = tensor_or_np

        if tensor.ndim == 3:
            tensor = tensor.unsqueeze(0)  # Shape: [1, 3, 224, 224]

        tensor = tensor.to(self.device)

        with torch.no_grad():
            features = self.model(tensor)
            feature_vector = features.squeeze().cpu().numpy().astype(np.float32)

        if feature_vector.shape != (FEATURE_DIM,):
            feature_vector = feature_vector.reshape(FEATURE_DIM)

        return feature_vector

    def extract_batch(self, tensors):
        """
        Extracts real 2048-dimensional feature vectors for a batch of images.
        Input: torch.Tensor of shape [B, 3, 224, 224]
        Output: 2D numpy array of shape (B, 2048)
        """
        if self.model is None:
            raise RuntimeError("ResNet50 model is not loaded. Cannot extract batch features.")

        if isinstance(tensors, np.ndarray):
            tensors = torch.from_numpy(tensors).float()

        tensors = tensors.to(self.device)

        with torch.no_grad():
            features = self.model(tensors)
            feature_matrix = features.cpu().numpy().astype(np.float32)

        return feature_matrix


# Global singleton instance for inference
_feature_extractor_instance = None

def get_feature_extractor():
    global _feature_extractor_instance
    if _feature_extractor_instance is None:
        _feature_extractor_instance = ResNet50FeatureExtractor()
    return _feature_extractor_instance

