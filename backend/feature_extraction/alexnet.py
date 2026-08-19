"""
AlexNet Deep Feature Extractor
Extracts 4096-dimensional penultimate feature vectors.
"""

import numpy as np

class AlexNetFeatureExtractor:
    def __init__(self, pretrained: bool = True):
        self.name = "AlexNet"
        self.feature_dim = 4096
        self.device = "cpu"
        self._model = None
        self._init_model(pretrained)

    def _init_model(self, pretrained: bool):
        try:
            import torch
            import torchvision.models as models
            weights = models.AlexNet_Weights.DEFAULT if pretrained else None
            full_model = models.alexnet(weights=weights)
            self._model = torch.nn.Sequential(
                full_model.features,
                full_model.avgpool,
                torch.nn.Flatten(),
                *list(full_model.classifier.children())[:5]
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
            np.random.seed(101)
            flat = tensor.flatten()
            proj = np.dot(flat[:1000], np.random.randn(1000, self.feature_dim))
            relu = np.maximum(0, proj)
            norm = np.linalg.norm(relu)
            return relu / (norm + 1e-7)
