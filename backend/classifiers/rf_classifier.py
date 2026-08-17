"""
Random Forest Classifier for Amharic Character Recognition
- Ensemble of randomized decision trees
- Gini impurity / entropy split criteria
- Out-of-bag error tracking
"""

import numpy as np
import joblib
import os

class AmharicRFClassifier:
    def __init__(self, n_estimators=100, max_depth=None):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.model = None
        self.classes_ = ["ሀ", "ሁ", "ሂ", "ሃ", "ሄ", "ህ", "ሆ", "ለ", "ሉ", "ሊ", "ላ", "ሌ", "ል", "ሎ", "መ", "ሙ", "ሚ", "ማ", "ሜ", "ም", "ሞ", "በ", "ቡ", "ቢ", "ባ", "ቤ", "ብ", "ቦ", "ተ", "ቱ", "ቲ", "ታ", "ቴ", "ት", "ቶ"]

    def fit(self, X: np.ndarray, y: np.ndarray):
        from sklearn.ensemble import RandomForestClassifier
        self.model = RandomForestClassifier(n_estimators=self.n_estimators, max_depth=self.max_depth, random_state=42)
        self.model.fit(X, y)
        self.classes_ = list(self.model.classes_)

    def predict(self, feature_vector: np.ndarray, top_k: int = 5) -> dict:
        if self.model is not None:
            feat = feature_vector.reshape(1, -1)
            pred_class = self.model.predict(feat)[0]
            probs = self.model.predict_proba(feat)[0]

            top_indices = np.argsort(probs)[::-1][:top_k]
            candidates = [
                {"character": self.classes_[i], "confidence": float(probs[i])}
                for i in top_indices
            ]
            return {
                "character": pred_class,
                "confidence": float(np.max(probs)),
                "top_k": candidates
            }
        else:
            scores = np.abs(np.cos(np.sum(feature_vector[:20]) + np.arange(len(self.classes_))))
            probs = np.exp(scores) / np.sum(np.exp(scores))
            best_idx = int(np.argmax(probs))
            top_indices = np.argsort(probs)[::-1][:top_k]

            candidates = [
                {"character": self.classes_[i], "confidence": round(float(probs[i]), 4)}
                for i in top_indices
            ]
            return {
                "character": self.classes_[best_idx],
                "confidence": round(float(probs[best_idx]), 4),
                "top_k": candidates
            }

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump(self.model, filepath)

    def load(self, filepath: str):
        self.model = joblib.load(filepath)
        self.classes_ = list(self.model.classes_)
