"""
YOLOv8 Layout Detector.

Locates structure regions (doctor info, medicine blocks, signatures) within
prescription images to improve semantic extraction accuracy.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Dict

logger = logging.getLogger(__name__)


class YOLODetector:
    """YOLOv8 layout detector for prescription segmentation.

    If the model weights 'ai/yolo/models/best.pt' are present, performs inference
    to locate doctor info, patient info, dates, and medicine blocks.
    Otherwise, falls back to full-image processing gracefully.
    """

    def __init__(self) -> None:
        # Check standard relative paths
        self.weights_path = Path(__file__).resolve().parent.parent.parent.parent / "ai" / "yolo" / "models" / "best.pt"
        if not self.weights_path.exists():
            # Try alternate path relative to Cwd
            self.weights_path = Path("ai/yolo/models/best.pt")
            
        self.model = None
        self._load_model()

    def _load_model(self) -> None:
        """Attempt to load YOLO model weights if available on disk."""
        if not self.weights_path.exists():
            logger.info("YOLO weights not found at %s. Full-image fallback enabled.", self.weights_path.absolute())
            return

        try:
            from ultralytics import YOLO
            self.model = YOLO(str(self.weights_path))
            logger.info("YOLOv8 layout detector loaded successfully from %s", self.weights_path)
        except ImportError:
            logger.warning(
                "Ultralytics package is not installed. "
                "Run 'pip install ultralytics' to enable YOLO detection. Falling back."
            )
        except Exception as exc:
            logger.error("Failed to initialize YOLO model: %s", exc)

    def detect_regions(self, image_bytes: bytes) -> Dict[str, Any]:
        """Detect layout region bounding boxes in prescription.

        Args:
            image_bytes: Raw prescription image bytes.

        Returns:
            A dict containing coordinates of detected blocks, or an empty dict
            if the YOLO model is not loaded or detection fails.
        """
        if not self.model:
            return {}

        try:
            import cv2
            import numpy as np

            # Decode image
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                logger.warning("YOLO could not decode image bytes.")
                return {}

            # Run inference
            results = self.model(img, verbose=False)
            if not results:
                return {}

            result = results[0]
            boxes = result.boxes
            names = self.model.names

            detected = {}
            for box in boxes:
                cls_id = int(box.cls[0])
                cls_name = names.get(cls_id, f"class_{cls_id}")
                conf = float(box.conf[0])
                xyxy = box.xyxy[0].tolist()  # [xmin, ymin, xmax, ymax]

                # Store bounding boxes with highest confidence
                if cls_name not in detected or detected[cls_name]["confidence"] < conf:
                    detected[cls_name] = {
                        "bbox": [int(x) for x in xyxy],
                        "confidence": round(conf, 3)
                    }

            logger.info("YOLO layout detection found regions: %s", list(detected.keys()))
            return detected

        except Exception as exc:
            logger.error("YOLO inference failed: %s. Falling back.", exc)
            return {}
