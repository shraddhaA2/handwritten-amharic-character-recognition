"""
Amharic Dataset Loader & Augmentation Utility
Structure:
dataset/
    train/
        class_1/
        class_2/
    validation/
        class_1/
        class_2/
    test/
        class_1/
        class_2/
"""

import os
import glob
import cv2
import numpy as np
from PIL import Image

class AmharicDatasetLoader:
    def __init__(self, base_dir="dataset/"):
        self.base_dir = base_dir
        self.train_dir = os.path.join(base_dir, "train")
        self.val_dir = os.path.join(base_dir, "validation")
        self.test_dir = os.path.join(base_dir, "test")

    def get_classes(self) -> list:
        if os.path.exists(self.train_dir):
            classes = [d for d in os.listdir(self.train_dir) if os.path.isdir(os.path.join(self.train_dir, d))]
            return sorted(classes)
        return []

    def augment_image(self, img: np.ndarray, rotation_deg=15, shift_ratio=0.1) -> np.ndarray:
        h, w = img.shape[:2]
        # Random rotation
        angle = np.random.uniform(-rotation_deg, rotation_deg)
        center = (w // 2, h // 2)
        M_rot = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(img, M_rot, (w, h), borderValue=(255, 255, 255))

        # Random shift
        tx = np.random.uniform(-shift_ratio * w, shift_ratio * w)
        ty = np.random.uniform(-shift_ratio * h, shift_ratio * h)
        M_trans = np.float32([[1, 0, tx], [0, 1, ty]])
        shifted = cv2.warpAffine(rotated, M_trans, (w, h), borderValue=(255, 255, 255))

        return shifted

    def load_partition(self, partition="train", augment=False):
        p_dir = os.path.join(self.base_dir, partition)
        images = []
        labels = []
        if not os.path.exists(p_dir):
            return np.array(images), np.array(labels)

        classes = self.get_classes()
        for idx, cls_name in enumerate(classes):
            cls_path = os.path.join(p_dir, cls_name)
            for f in glob.glob(os.path.join(cls_path, "*.*")):
                if f.lower().endswith(('.png', '.jpg', '.jpeg')):
                    img = cv2.imread(f)
                    if img is not None:
                        images.append(img)
                        labels.append(cls_name)
                        if augment:
                            aug_img = self.augment_image(img)
                            images.append(aug_img)
                            labels.append(cls_name)

        return images, labels
