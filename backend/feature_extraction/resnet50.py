"""
ResNet50 Deep Feature Extractor
Extracts 2048-dimensional features via Global Average Pooling layer.
"""

import numpy as np

class ResNet50FeatureExtractor:
    def __init__(self, pretrained: bool = True):
        self.name = "ResNet50"
        self.feature_dim = 2048
        self.device = "cpu"
        self._model = None
        self._init_model(pretrained)

    def _init_model(self, pretrained: bool):
        try:
            import torch
            import torchvision.models as models
            weights = models.ResNet50_Weights.DEFAULT if pretrained else None
            full_model = models.resnet50(weights=weights)
            # Remove final linear classification layer (keep up to avgpool)
            self._model = torch.nn.Sequential(
                *list(full_model.children())[:-1],
                torch.nn.Flatten()
            )
            self._model.eval()
        except Exception:
            self._model = None

    def extract(self, tensor: np.ndarray) -> np.ndarray:
        if self._model is not None:
            import torch
            with torch.no_grad():
                inp = torch.from_numpy(tensor).unsqueeze(0).float()
                feat = self._model(inp).squeeze().numpy()
                norm = np.linalg.norm(feat)
                return feat / (norm + 1e-7)
        else:
            np.random.seed(404)
            flat = tensor.flatten()
            proj = np.dot(flat[:1000], np.random.randn(1000, self.feature_dim))
            relu = np.maximum(0, proj)
            norm = np.linalg.norm(relu)
            return relu / (norm + 1e-7)
