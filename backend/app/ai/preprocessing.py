"""
Image pre-processing pipeline for prescription photos.

Each step is a standalone function so individual stages can be tested,
profiled, or replaced independently.  The top-level ``preprocess_image``
runs the full pipeline and returns JPEG bytes ready for Gemini.
"""

from __future__ import annotations

import logging
import time
from typing import Optional

import cv2
import numpy as np

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Individual pipeline stages
# ---------------------------------------------------------------------------

def decode_image(image_bytes: bytes) -> np.ndarray:
    """Decode raw bytes into a BGR OpenCV image (``np.ndarray``).

    Raises:
        ValueError: If the bytes cannot be decoded.
    """
    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Unable to decode image — invalid or corrupt data")
    return img


def to_grayscale(img: np.ndarray) -> np.ndarray:
    """Convert a BGR image to single-channel grayscale."""
    return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)


def adaptive_threshold(gray: np.ndarray) -> np.ndarray:
    """Apply adaptive Gaussian thresholding to separate text from
    the background."""
    return cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )


def denoise(img: np.ndarray) -> np.ndarray:
    """Remove noise with a non-local-means filter.

    Works on both single-channel and BGR images.
    """
    if len(img.shape) == 2:
        return cv2.fastNlMeansDenoising(img, h=10)
    return cv2.fastNlMeansDenoisingColored(img, h=10, hForColorComponents=10)


def deskew(gray: np.ndarray, angle_limit: float = 15.0) -> np.ndarray:
    """Rotate a grayscale image to correct slight skew.

    If the detected skew angle exceeds *angle_limit* degrees the image
    is returned untouched (the detection is likely wrong).
    """
    coords = np.column_stack(np.where(gray > 0))
    if coords.shape[0] < 100:
        return gray  # not enough foreground pixels

    angle: float = cv2.minAreaRect(coords)[-1]

    # ``minAreaRect`` returns angles in [-90, 0); normalise.
    if angle < -45:
        angle = 90 + angle
    elif angle > 45:
        angle = angle - 90

    if abs(angle) > angle_limit:
        logger.debug("Deskew skipped — angle %.2f° exceeds limit", angle)
        return gray

    h, w = gray.shape[:2]
    center = (w // 2, h // 2)
    matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(
        gray, matrix, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE
    )
    return rotated


def apply_clahe(gray: np.ndarray) -> np.ndarray:
    """Enhance local contrast with CLAHE (Contrast Limited Adaptive
    Histogram Equalisation)."""
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    return clahe.apply(gray)


def encode_jpeg(img: np.ndarray, quality: int = 90) -> bytes:
    """Encode a (potentially grayscale) image back to JPEG bytes."""
    # Gemini Vision expects a colour image, so convert single-channel
    # back to 3-channel BGR before encoding.
    if len(img.shape) == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    ok, buf = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, quality])
    if not ok:
        raise RuntimeError("JPEG encoding failed")
    return buf.tobytes()


# ---------------------------------------------------------------------------
# Full pipeline
# ---------------------------------------------------------------------------

def preprocess_image(
    image_bytes: bytes,
    *,
    skip_threshold: bool = False,
) -> bytes:
    """Run the complete pre-processing pipeline and return JPEG bytes.

    Pipeline order::

        decode → grayscale → denoise → deskew → CLAHE
        → (optional) adaptive threshold → JPEG encode

    Args:
        image_bytes: Raw input image data (any format OpenCV supports).
        skip_threshold: If ``True``, skip the adaptive-threshold step
            which can hurt quality on high-resolution colour scans.

    Returns:
        Pre-processed JPEG image bytes.
    """
    start = time.perf_counter()

    img = decode_image(image_bytes)
    gray = to_grayscale(img)
    gray = denoise(gray)
    gray = deskew(gray)
    gray = apply_clahe(gray)

    if not skip_threshold:
        gray = adaptive_threshold(gray)

    result = encode_jpeg(gray)

    elapsed_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "Image pre-processed in %.1f ms (input=%d B → output=%d B)",
        elapsed_ms,
        len(image_bytes),
        len(result),
    )
    return result
