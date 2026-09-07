#!/usr/bin/env python3
"""
Gate Surveillance Inference Pipeline
====================================
Real-time intelligent analysis of gate surveillance video with:
  - YOLO license plate detection
  - YOLO character/digit OCR
  - EfficientNet-B4 vehicle make & model recognition
  - ByteTrack multi-object tracking
  - Temporal fusion for stable predictions
  - Pakistani license plate post-processing
  - Annotated video output + CSV vehicle log

Usage:
    python inference_pipeline.py                         # Opens GUI (upload video, run, download)
    python inference_pipeline.py --video input.mp4       # CLI mode
    python inference_pipeline.py --cli --video input.mp4 # Explicit CLI
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import shutil
import sys
import threading
import time
import tkinter as tk
from collections import Counter, defaultdict, deque
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from tkinter import filedialog, messagebox, ttk
from typing import Any, Callable, Deque, Dict, List, Optional, Sequence, Tuple

import cv2
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from PIL import Image, ImageTk
from torchvision import models, transforms
from ultralytics import YOLO

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("gate_pipeline")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent

# COCO class IDs for vehicles (yolov8n pretrained detector)
COCO_VEHICLE_CLASSES = {2, 3, 5, 7}  # car, motorcycle, bus, truck

# Pakistani plate regex patterns
PAK_PLATE_PATTERNS = [
    re.compile(r"^[A-Z]{3}-\d{4}$"),           # Standard private: ABC-1234
    re.compile(r"^[A-Z]{2}-\d{4}$"),           # Alternate: AB-1234
    re.compile(r"^[A-Z]{3}\d{4}$"),             # Without hyphen
    re.compile(r"^\d{1,4}-[A-Z]{1,3}-\d{1,4}$"),  # Sindh-style variants
]

# OCR confusion pairs (letter/digit)
OCR_CONFUSIONS: Dict[str, List[str]] = {
    "0": ["O"],
    "O": ["0"],
    "1": ["I"],
    "I": ["1"],
    "2": ["Z"],
    "Z": ["2"],
    "5": ["S"],
    "S": ["5"],
    "8": ["B"],
    "B": ["8"],
}

LETTERS = set("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
DIGITS = set("0123456789")

# Colors (BGR)
COLOR_VEHICLE_BOX = (255, 180, 0)      # cyan-ish
COLOR_VEHICLE_LABEL = (255, 220, 0)
COLOR_PLATE_BOX = (0, 220, 80)         # green
COLOR_PLATE_LABEL = (0, 255, 100)
COLOR_PANEL_BG = (18, 18, 18)
COLOR_PANEL_TEXT = (235, 235, 235)
COLOR_PANEL_ACCENT = (0, 200, 255)
COLOR_AUTHORIZED = (80, 220, 80)
COLOR_UNAUTHORIZED = (80, 80, 255)

IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD = (0.229, 0.224, 0.225)
VMMR_IMG_SIZE = 224


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
@dataclass
class PipelineConfig:
    """Runtime configuration for the inference pipeline."""

    video_path: Path
    output_dir: Path = SCRIPT_DIR / "output"
    models_dir: Path = SCRIPT_DIR

    plate_detector_names: Tuple[str, ...] = (
        "license_plate_detector.pt",
    )
    char_detector_names: Tuple[str, ...] = (
        "plate_character_detector.pt",
    )
    vehicle_model_names: Tuple[str, ...] = (
        "vehicle_make_model.pth",
    )
    vehicle_classes_names: Tuple[str, ...] = (
        "vmmr_classes.txt",
        "classes.txt",
    )
    vehicle_detector_name: str = "yolov8n.pt"

    authorized_vehicles_path: Optional[Path] = None

    plate_conf: float = 0.25
    char_conf: float = 0.20
    vehicle_conf: float = 0.40
    min_char_conf: float = 0.15
    min_vehicle_cls_conf: float = 0.35

    char_nms_iou: float = 0.40
    finalize_stable_frames: int = 12
    min_observation_frames: int = 5
    track_lost_finalize_frames: int = 20
    panel_width_px: int = 190
    show_live_preview: bool = False
    save_screenshots: bool = True

    device: str = field(default_factory=lambda: "cuda" if torch.cuda.is_available() else "cpu")


# Canonical trained weights for this FYP project (validated paths)
CANONICAL_MODEL_PATHS: Dict[str, Path] = {
    "plate detector": SCRIPT_DIR / "final yolo" / "best.pt",
    "char detector": SCRIPT_DIR / "yolo digits letter recognition12" / "best.pt",
    "vehicle classifier": SCRIPT_DIR / "vmmr fyp" / "efficientnet_b4_best.pth",
}
CANONICAL_CLASSES_PATH = SCRIPT_DIR / "vmmr fyp" / "vmmr_classes.txt"
EXPECTED_CHAR_CLASSES = 38
EXPECTED_PLATE_CLASSES = 1

ProgressCallback = Callable[[Dict[str, Any]], None]


# ---------------------------------------------------------------------------
# Model path resolution
# ---------------------------------------------------------------------------
def resolve_model_path(
    names: Sequence[str],
    search_dirs: Sequence[Path],
    label: str,
) -> Path:
    """
    Resolve model weights with strict priority:
      1) User-provided filenames in models_dir
      2) Canonical validated project weights
    """
    candidates: List[Path] = []
    for directory in search_dirs:
        for name in names:
            candidates.append(directory / name)

    canonical = CANONICAL_MODEL_PATHS.get(label)
    if canonical is not None:
        candidates.append(canonical)

    for candidate in candidates:
        if candidate.is_file():
            logger.info("Found %s: %s", label, candidate)
            return candidate

    searched = ", ".join(str(p) for p in candidates)
    raise FileNotFoundError(
        f"Could not locate {label}. Searched: {searched}\n"
        f"Place '{names[0]}' in --models-dir or keep canonical weights in project folders."
    )


def ensure_project_model_aliases(models_dir: Path) -> None:
    """Create user-facing model filenames from canonical trained weights."""
    aliases = {
        "license_plate_detector.pt": CANONICAL_MODEL_PATHS["plate detector"],
        "plate_character_detector.pt": CANONICAL_MODEL_PATHS["char detector"],
        "vehicle_make_model.pth": CANONICAL_MODEL_PATHS["vehicle classifier"],
    }
    models_dir.mkdir(parents=True, exist_ok=True)
    for alias_name, source in aliases.items():
        if not source.is_file():
            continue
        target = models_dir / alias_name
        if target.is_file():
            continue
        try:
            shutil.copy2(source, target)
            logger.info("Created model alias: %s -> %s", alias_name, source)
        except Exception as exc:
            logger.warning("Could not create alias %s: %s", alias_name, exc)


def _validate_yolo_model(model: YOLO, label: str, expected_classes: int) -> None:
    names = model.names
    num_classes = len(names) if isinstance(names, dict) else len(names)
    if num_classes != expected_classes:
        raise ValueError(
            f"{label} has {num_classes} classes, expected {expected_classes}. "
            f"Use the correct trained weights file."
        )
    if label == "plate detector":
        sample = list(names.values()) if isinstance(names, dict) else list(names)
        if "plate" not in [str(x).lower() for x in sample]:
            raise ValueError(f"{label} does not look like a plate detector model.")
    logger.info("Validated %s (%d classes)", label, num_classes)


def resolve_classes_path(names: Sequence[str], search_dirs: Sequence[Path]) -> Path:
    for directory in search_dirs:
        for name in names:
            candidate = directory / name
            if candidate.is_file():
                return candidate
        vmmr = directory / "vmmr fyp" / "vmmr_classes.txt"
        if vmmr.is_file():
            return vmmr
    if CANONICAL_CLASSES_PATH.is_file():
        return CANONICAL_CLASSES_PATH
    raise FileNotFoundError("Could not locate vehicle class labels (vmmr_classes.txt).")


# ---------------------------------------------------------------------------
# Pakistani plate OCR post-processing
# ---------------------------------------------------------------------------
@dataclass
class CharDetection:
    """Single character detection on a license plate crop."""

    char: str
    confidence: float
    x1: float
    y1: float
    x2: float
    y2: float

    @property
    def x_center(self) -> float:
        return (self.x1 + self.x2) / 2.0

    @property
    def y_center(self) -> float:
        return (self.y1 + self.y2) / 2.0

    @property
    def width(self) -> float:
        return max(self.x2 - self.x1, 1.0)

    @property
    def height(self) -> float:
        return max(self.y2 - self.y1, 1.0)


def char_iou(a: CharDetection, b: CharDetection) -> float:
    """Intersection-over-union for two character boxes."""
    ix1 = max(a.x1, b.x1)
    iy1 = max(a.y1, b.y1)
    ix2 = min(a.x2, b.x2)
    iy2 = min(a.y2, b.y2)
    inter = max(0.0, ix2 - ix1) * max(0.0, iy2 - iy1)
    if inter <= 0:
        return 0.0
    union = a.width * a.height + b.width * b.height - inter
    return inter / union if union > 0 else 0.0


def nms_characters(chars: List[CharDetection], iou_thresh: float) -> List[CharDetection]:
    """Non-maximum suppression on character detections."""
    if not chars:
        return []
    sorted_chars = sorted(chars, key=lambda c: c.confidence, reverse=True)
    kept: List[CharDetection] = []
    for candidate in sorted_chars:
        if all(char_iou(candidate, kept_char) < iou_thresh for kept_char in kept):
            kept.append(candidate)
    return kept


def normalize_char_label(raw: str) -> str:
    """Map YOLO class name to a single display character."""
    raw = str(raw).strip()
    if raw.upper() == "YY":
        return "Y"
    if len(raw) == 1:
        return raw.upper() if raw.isalpha() else raw
    return raw.upper()


def sort_characters(chars: List[CharDetection]) -> List[CharDetection]:
    """
    Sort characters left-to-right; for two-line plates, sort top row then bottom row.
    """
    if len(chars) <= 1:
        return chars

    heights = [c.height for c in chars]
    median_h = float(np.median(heights)) if heights else 10.0
    row_threshold = median_h * 0.55

    sorted_by_y = sorted(chars, key=lambda c: c.y_center)
    rows: List[List[CharDetection]] = [[sorted_by_y[0]]]

    for char in sorted_by_y[1:]:
        last_row = rows[-1]
        row_y = float(np.mean([c.y_center for c in last_row]))
        if abs(char.y_center - row_y) <= row_threshold:
            last_row.append(char)
        else:
            rows.append([char])

    ordered: List[CharDetection] = []
    for row in rows:
        ordered.extend(sorted(row, key=lambda c: c.x_center))
    return ordered


def remove_duplicate_characters(chars: List[CharDetection]) -> List[CharDetection]:
    """Remove overlapping duplicate characters, keeping highest confidence."""
    if not chars:
        return []
    result: List[CharDetection] = []
    for char in sorted(chars, key=lambda c: c.x_center):
        replaced = False
        for idx, existing in enumerate(result):
            if char_iou(char, existing) > 0.25:
                if char.confidence > existing.confidence:
                    result[idx] = char
                replaced = True
                break
        if not replaced:
            result.append(char)
    return result


def apply_ocr_corrections(text: str, position: str) -> str:
    """
    Correct common OCR confusions based on expected position (letter vs digit).
    position: 'letter' or 'digit'
    """
    corrected = []
    for ch in text:
        if position == "letter":
            if ch in DIGITS and ch in OCR_CONFUSIONS:
                corrected.append(OCR_CONFUSIONS[ch][0])
            else:
                corrected.append(ch)
        else:
            if ch in LETTERS and ch in OCR_CONFUSIONS:
                corrected.append(OCR_CONFUSIONS[ch][0])
            else:
                corrected.append(ch)
    return "".join(corrected)


def format_pakistani_plate(chars: List[CharDetection]) -> Tuple[str, float]:
    """
    Build Pakistani license plate string from sorted character detections.
    Returns (plate_text, mean_confidence).
    """
    if not chars:
        return "NO_TEXT", 0.0

    letters: List[Tuple[str, float, float]] = []
    digits: List[Tuple[str, float, float]] = []

    for det in chars:
        ch = normalize_char_label(det.char)
        if ch in LETTERS:
            letters.append((ch, det.x_center, det.confidence))
        elif ch in DIGITS:
            digits.append((ch, det.x_center, det.confidence))

    letters.sort(key=lambda t: t[1])
    digits.sort(key=lambda t: t[1])

    letter_str = "".join(c for c, _, _ in letters[:3])
    digit_str = "".join(c for c, _, _ in digits[-4:])

    letter_str = apply_ocr_corrections(letter_str, "letter")
    digit_str = apply_ocr_corrections(digit_str, "digit")

    if not letter_str and not digit_str:
        return "NO_TEXT", 0.0
    if not digit_str:
        confs = [c for _, _, c in letters]
        return letter_str, float(np.mean(confs)) if confs else 0.0
    if not letter_str:
        confs = [c for _, _, c in digits]
        return digit_str, float(np.mean(confs)) if confs else 0.0

    plate = f"{letter_str}-{digit_str}"
    all_confs = [c for _, _, c in letters[:3]] + [c for _, _, c in digits[-4:]]
    mean_conf = float(np.mean(all_confs)) if all_confs else 0.0
    return plate, mean_conf


def validate_pakistani_plate(plate: str) -> bool:
    """Regex validation for Pakistani license plate formats."""
    if not plate or plate in ("NO_TEXT", "NO_CHARS", "NO_PLATE"):
        return False
    return any(pattern.match(plate) for pattern in PAK_PLATE_PATTERNS)


def auto_spacing_correction(plate: str) -> str:
    """Insert hyphen for standard 3+4 plates if missing."""
    compact = plate.replace("-", "").replace(" ", "").upper()
    if len(compact) == 7 and compact[:3].isalpha() and compact[3:].isdigit():
        return f"{compact[:3]}-{compact[3:]}"
    return plate.upper()


class PakistaniPlatePostProcessor:
    """Advanced OCR post-processing for Pakistani license plates."""

    def __init__(self, min_char_conf: float = 0.15, nms_iou: float = 0.40):
        self.min_char_conf = min_char_conf
        self.nms_iou = nms_iou

    def process_yolo_boxes(
        self,
        boxes_xyxy: np.ndarray,
        classes: np.ndarray,
        confidences: np.ndarray,
        class_names: Dict[int, str],
    ) -> Tuple[str, float]:
        """Convert raw YOLO character detections to formatted plate text."""
        chars: List[CharDetection] = []
        for i in range(len(boxes_xyxy)):
            conf = float(confidences[i])
            if conf < self.min_char_conf:
                continue
            cls_id = int(classes[i])
            x1, y1, x2, y2 = boxes_xyxy[i]
            chars.append(
                CharDetection(
                    char=class_names.get(cls_id, str(cls_id)),
                    confidence=conf,
                    x1=float(x1),
                    y1=float(y1),
                    x2=float(x2),
                    y2=float(y2),
                )
            )

        if not chars:
            return "NO_CHARS", 0.0

        chars = nms_characters(chars, self.nms_iou)
        chars = remove_duplicate_characters(chars)
        chars = sort_characters(chars)
        plate, conf = format_pakistani_plate(chars)
        plate = auto_spacing_correction(plate)
        return plate, conf

    @staticmethod
    def temporal_fusion(
        history: Sequence[Tuple[str, float]],
    ) -> Tuple[str, float]:
        """
        Confidence-weighted majority voting across consecutive frames.
        Selects the highest-confidence plate after weighted voting.
        """
        valid = [
            (p, c) for p, c in history
            if p not in ("NO_TEXT", "NO_CHARS", "NO_PLATE", "")
        ]
        if not valid:
            return "NO_PLATE", 0.0

        weighted: Dict[str, float] = defaultdict(float)
        counts: Counter = Counter()
        for plate, conf in valid:
            weighted[plate] += conf
            counts[plate] += 1

        # Prefer plates that appear often with high cumulative confidence
        best_plate = max(
            weighted.keys(),
            key=lambda p: (counts[p], weighted[p]),
        )
        avg_conf = weighted[best_plate] / max(counts[best_plate], 1)
        return best_plate, float(avg_conf)


# ---------------------------------------------------------------------------
# Vehicle recognition post-processing
# ---------------------------------------------------------------------------
def parse_vehicle_label(label: str) -> Tuple[str, str, str]:
    """Parse class label into (display_name, make, model)."""
    if "_" in label:
        make, model = label.split("_", 1)
        make = make.replace("_", " ").strip()
        model = model.replace("_", " ").strip()
    else:
        make, model = label, ""
    display = f"{make} {model}".strip()
    return display, make, model


class VehicleRecognitionPostProcessor:
    """Temporal smoothing for vehicle make/model predictions."""

    @staticmethod
    def temporal_fusion(
        history: Sequence[Tuple[str, float]],
        min_conf: float = 0.35,
    ) -> Tuple[str, str, str, float]:
        """
        Majority voting with confidence averaging.
        Returns (display_name, make, model, confidence).
        """
        valid = [(lbl, c) for lbl, c in history if c >= min_conf and lbl]
        if not valid:
            return "Unknown", "Unknown", "", 0.0

        votes: Counter = Counter()
        conf_sums: Dict[str, float] = defaultdict(float)
        for label, conf in valid:
            votes[label] += 1
            conf_sums[label] += conf

        best_label = max(votes.keys(), key=lambda k: (votes[k], conf_sums[k]))
        avg_conf = conf_sums[best_label] / votes[best_label]
        display, make, model = parse_vehicle_label(best_label)
        return display, make, model, float(avg_conf)


# ---------------------------------------------------------------------------
# Track state & temporal fusion per vehicle
# ---------------------------------------------------------------------------
@dataclass
class VehicleTrackState:
    """Per-track accumulator for multi-frame fusion."""

    track_id: int
    plate_history: Deque[Tuple[str, float]] = field(
        default_factory=lambda: deque(maxlen=60)
    )
    vehicle_history: Deque[Tuple[str, float]] = field(
        default_factory=lambda: deque(maxlen=60)
    )
    observation_frames: int = 0
    missing_frames: int = 0
    finalized: bool = False
    logged: bool = False

    # Smoothed display (anti-flicker)
    display_plate: str = ""
    display_plate_conf: float = 0.0
    display_vehicle: str = ""
    display_vehicle_conf: float = 0.0

    # Final results
    final_plate: str = ""
    final_plate_conf: float = 0.0
    final_vehicle: str = ""
    final_make: str = ""
    final_model: str = ""
    final_vehicle_conf: float = 0.0
    final_status: str = "Pending"
    finalized_frame: int = -1
    finalized_time: str = ""

    # Geometry (latest)
    vehicle_bbox: Optional[Tuple[int, int, int, int]] = None
    plate_bbox: Optional[Tuple[int, int, int, int]] = None
    best_plate_crop: Optional[np.ndarray] = None
    best_plate_conf: float = 0.0

    def update_smoothed_display(self) -> None:
        plate, p_conf = PakistaniPlatePostProcessor.temporal_fusion(self.plate_history)
        vehicle, _, _, v_conf = VehicleRecognitionPostProcessor.temporal_fusion(
            self.vehicle_history
        )
        if plate not in ("NO_PLATE", "NO_TEXT", "NO_CHARS"):
            self.display_plate = plate
            self.display_plate_conf = p_conf
        if vehicle != "Unknown":
            self.display_vehicle = vehicle
            self.display_vehicle_conf = v_conf

    def ready_to_finalize(self, cfg: PipelineConfig) -> bool:
        if self.finalized:
            return False
        if self.observation_frames < cfg.min_observation_frames:
            return False
        stable_plate = self.display_plate and validate_pakistani_plate(self.display_plate)
        stable_vehicle = self.display_vehicle_conf >= cfg.min_vehicle_cls_conf
        enough_frames = self.observation_frames >= cfg.finalize_stable_frames
        lost_track = self.missing_frames >= cfg.track_lost_finalize_frames
        return (enough_frames and (stable_plate or stable_vehicle)) or (
            lost_track and self.observation_frames >= 3
        )

    def finalize(self, frame_idx: int, authorized_plates: set) -> None:
        self.finalized = True
        self.finalized_frame = frame_idx
        self.finalized_time = datetime.now().strftime("%H:%M:%S")

        plate, p_conf = PakistaniPlatePostProcessor.temporal_fusion(self.plate_history)
        vehicle, make, model, v_conf = VehicleRecognitionPostProcessor.temporal_fusion(
            self.vehicle_history
        )

        self.final_plate = plate if plate not in ("NO_PLATE",) else self.display_plate
        self.final_plate_conf = max(p_conf, self.display_plate_conf)
        self.final_vehicle = vehicle if vehicle != "Unknown" else self.display_vehicle
        self.final_make = make
        self.final_model = model
        self.final_vehicle_conf = max(v_conf, self.display_vehicle_conf)

        if self.final_plate and self.final_plate in authorized_plates:
            self.final_status = "Authorized"
        elif self.final_plate and validate_pakistani_plate(self.final_plate):
            self.final_status = "Unauthorized"
        else:
            self.final_status = "Pending Review"


# ---------------------------------------------------------------------------
# Model manager
# ---------------------------------------------------------------------------
class ModelManager:
    """Load and run all inference models."""

    def __init__(self, cfg: PipelineConfig):
        self.cfg = cfg
        self.device = torch.device(cfg.device)
        search_dirs = [cfg.models_dir, SCRIPT_DIR, SCRIPT_DIR / "models", Path.cwd()]
        ensure_project_model_aliases(cfg.models_dir)
        ensure_project_model_aliases(SCRIPT_DIR / "models")

        plate_path = resolve_model_path(cfg.plate_detector_names, search_dirs, "plate detector")
        char_path = resolve_model_path(cfg.char_detector_names, search_dirs, "char detector")
        vehicle_path = resolve_model_path(cfg.vehicle_model_names, search_dirs, "vehicle classifier")
        classes_path = resolve_classes_path(cfg.vehicle_classes_names, search_dirs)

        logger.info("Loading models on %s ...", self.device)
        self.plate_model = YOLO(str(plate_path))
        self.char_model = YOLO(str(char_path))
        _validate_yolo_model(self.plate_model, "plate detector", EXPECTED_PLATE_CLASSES)
        _validate_yolo_model(self.char_model, "char detector", EXPECTED_CHAR_CLASSES)

        vehicle_detector_path = Path(cfg.vehicle_detector_name)
        if not vehicle_detector_path.is_file():
            vehicle_detector_path = SCRIPT_DIR / cfg.vehicle_detector_name
        self.vehicle_detector = YOLO(str(vehicle_detector_path))

        try:
            checkpoint = torch.load(vehicle_path, map_location=self.device, weights_only=False)
        except TypeError:
            checkpoint = torch.load(vehicle_path, map_location=self.device)

        ckpt_classes = checkpoint.get("class_names") if isinstance(checkpoint, dict) else None
        if ckpt_classes:
            self.vehicle_classes = [str(c).strip() for c in ckpt_classes if str(c).strip()]
            logger.info("Loaded %d VMMR classes from checkpoint.", len(self.vehicle_classes))
        else:
            with open(classes_path, encoding="utf-8") as f:
                self.vehicle_classes = [line.strip() for line in f if line.strip()]
            logger.info("Loaded %d VMMR classes from %s", len(self.vehicle_classes), classes_path)

        self.vehicle_model = self._load_vmmr(checkpoint, len(self.vehicle_classes))
        self.plate_processor = PakistaniPlatePostProcessor(
            min_char_conf=cfg.min_char_conf,
            nms_iou=cfg.char_nms_iou,
        )
        self.vehicle_transform = transforms.Compose([
            transforms.Resize((VMMR_IMG_SIZE, VMMR_IMG_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
        ])
        logger.info("All models loaded successfully.")

    def _load_vmmr(self, checkpoint: Any, num_classes: int) -> nn.Module:
        """Load EfficientNet-B4 exactly as trained (Dropout + Linear head)."""
        model = models.efficientnet_b4(weights=None)
        in_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_features, num_classes)

        state = checkpoint.get("model_state", checkpoint) if isinstance(checkpoint, dict) else checkpoint
        model.load_state_dict(state)
        model.eval()
        return model.to(self.device)

    @torch.inference_mode()
    def classify_vehicle_crop(self, crop_bgr: np.ndarray) -> Tuple[str, float]:
        """Run VMMR on a vehicle crop."""
        if crop_bgr.size == 0:
            return "", 0.0
        rgb = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(rgb)
        tensor = self.vehicle_transform(pil_img).unsqueeze(0).to(self.device)
        logits = self.vehicle_model(tensor)
        probs = torch.softmax(logits, dim=1)
        conf, pred = probs.max(1)
        label = self.vehicle_classes[pred.item()]
        return label, float(conf.item())

    def detect_plate_in_roi(
        self, roi_bgr: np.ndarray
    ) -> Tuple[Optional[Tuple[int, int, int, int]], Optional[np.ndarray], str, float]:
        """
        Detect license plate within a vehicle ROI.
        Returns (bbox_in_roi_coords, crop, plate_text, confidence).
        """
        if roi_bgr.size == 0:
            return None, None, "NO_PLATE", 0.0

        results = self.plate_model.predict(
            source=roi_bgr,
            conf=self.cfg.plate_conf,
            verbose=False,
        )
        boxes = results[0].boxes
        if boxes is None or len(boxes) == 0:
            return None, None, "NO_PLATE", 0.0

        # Largest plate by area
        xyxy = boxes.xyxy.cpu().numpy()
        confs = boxes.conf.cpu().numpy()
        areas = (xyxy[:, 2] - xyxy[:, 0]) * (xyxy[:, 3] - xyxy[:, 1])
        best_idx = int(np.argmax(areas))
        x1, y1, x2, y2 = xyxy[best_idx].astype(int)

        h, w = roi_bgr.shape[:2]
        pad = 4
        px1, py1 = max(0, x1 - pad), max(0, y1 - pad)
        px2, py2 = min(w, x2 + pad), min(h, y2 + pad)
        crop = roi_bgr[py1:py2, px1:px2]

        plate_text, plate_conf = self.read_plate(crop)
        return (px1, py1, px2, py2), crop, plate_text, plate_conf

    def read_plate(self, plate_crop: np.ndarray) -> Tuple[str, float]:
        """OCR on a cropped plate image."""
        if plate_crop.size == 0:
            return "NO_CHARS", 0.0

        results = self.char_model.predict(
            source=plate_crop,
            conf=self.cfg.char_conf,
            verbose=False,
        )
        boxes = results[0].boxes
        if boxes is None or len(boxes) == 0:
            return "NO_CHARS", 0.0

        xyxy = boxes.xyxy.cpu().numpy()
        cls = boxes.cls.cpu().numpy().astype(int)
        confs = boxes.conf.cpu().numpy()
        names = self.char_model.names
        class_map = {int(k): v for k, v in names.items()} if isinstance(names, dict) else {
            i: n for i, n in enumerate(names)
        }
        return self.plate_processor.process_yolo_boxes(xyxy, cls, confs, class_map)


# ---------------------------------------------------------------------------
# Authorization registry
# ---------------------------------------------------------------------------
def load_authorized_plates(path: Optional[Path]) -> set:
    """Load authorized plate numbers from JSON or text file."""
    if path is None or not path.is_file():
        default = SCRIPT_DIR / "web dashboard" / "server" / "data" / "vehicles.json"
        path = default if default.is_file() else None
    if path is None:
        return set()

    plates: set = set()
    try:
        if path.suffix.lower() == ".json":
            data = json.loads(path.read_text(encoding="utf-8"))
            vehicles = data.get("vehicles", data if isinstance(data, list) else [])
            for v in vehicles:
                if v.get("accessType") == "allow":
                    plate = v.get("licensePlate") or v.get("plate") or ""
                    if plate:
                        plates.add(auto_spacing_correction(plate.upper()))
        else:
            for line in path.read_text(encoding="utf-8").splitlines():
                line = line.strip().upper()
                if line and not line.startswith("#"):
                    plates.add(auto_spacing_correction(line))
    except Exception as exc:
        logger.warning("Could not load authorized plates from %s: %s", path, exc)
    logger.info("Loaded %d authorized plate(s).", len(plates))
    return plates


# ---------------------------------------------------------------------------
# Visualization
# ---------------------------------------------------------------------------
class VideoRenderer:
    """Draw bounding boxes, labels, and the right-side analysis panel."""

    def __init__(self, panel_width: int):
        self.panel_width = panel_width
        self.latest_finalized: Optional[VehicleTrackState] = None

    def set_panel_vehicle(self, state: Optional[VehicleTrackState]) -> None:
        if state is not None:
            self.latest_finalized = state

    @staticmethod
    def _font_scale(frame_h: int) -> float:
        return max(0.45, frame_h / 900.0 * 0.62)

    @staticmethod
    def _draw_filled_label(
        img: np.ndarray,
        text: str,
        x: int,
        y: int,
        bg: Tuple[int, int, int],
        fg: Tuple[int, int, int],
        scale: float,
        thickness: int = 1,
    ) -> None:
        font = cv2.FONT_HERSHEY_SIMPLEX
        (tw, th), baseline = cv2.getTextSize(text, font, scale, thickness)
        pad = 4
        top = max(0, y - th - baseline - pad * 2)
        cv2.rectangle(
            img,
            (x, top),
            (min(img.shape[1] - 1, x + tw + pad * 2), y),
            bg,
            -1,
            cv2.LINE_AA,
        )
        cv2.putText(
            img,
            text,
            (x + pad, y - baseline - pad),
            font,
            scale,
            fg,
            thickness,
            cv2.LINE_AA,
        )

    def draw_track(
        self,
        frame: np.ndarray,
        state: VehicleTrackState,
        scale: float,
    ) -> None:
        """Draw vehicle and plate overlays for an active track."""
        if state.vehicle_bbox is None:
            return

        x1, y1, x2, y2 = state.vehicle_bbox
        cv2.rectangle(frame, (x1, y1), (x2, y2), COLOR_VEHICLE_BOX, 2, cv2.LINE_AA)

        if state.finalized and state.final_vehicle:
            vehicle_label = state.final_vehicle
            v_conf = state.final_vehicle_conf
        else:
            vehicle_label = state.display_vehicle or "Vehicle Detected"
            v_conf = state.display_vehicle_conf
        label = f"ID:{state.track_id:02d} | {vehicle_label} ({v_conf:.0%})"
        self._draw_filled_label(
            frame, label, x1, max(y1 - 4, 20),
            (30, 30, 30), COLOR_VEHICLE_LABEL, scale, 2,
        )

        if state.plate_bbox is not None:
            px1, py1, px2, py2 = state.plate_bbox
            cv2.rectangle(frame, (px1, py1), (px2, py2), COLOR_PLATE_BOX, 2, cv2.LINE_AA)
            if state.finalized and state.final_plate:
                plate_text = state.final_plate
                p_conf = state.final_plate_conf
            else:
                plate_text = state.display_plate or "Plate Detecting"
                p_conf = state.display_plate_conf
            plate_label = f"{plate_text} ({p_conf:.0%})"
            self._draw_filled_label(
                frame, plate_label, px1, max(py1 - 4, 20),
                (20, 60, 20), COLOR_PLATE_LABEL, scale * 0.9, 1,
            )

    def compose_panel(
        self,
        frame_h: int,
        panel_state: Optional[VehicleTrackState] = None,
    ) -> np.ndarray:
        """Render the fixed right-side analysis panel."""
        panel = np.full((frame_h, self.panel_width, 3), COLOR_PANEL_BG, dtype=np.uint8)
        # Keep panel typography compact even when output video is upscaled.
        scale = min(0.40, max(0.33, frame_h / 900.0 * 0.36))
        font = cv2.FONT_HERSHEY_SIMPLEX
        x_margin = 12
        y = 30

        def put_line(text: str, color=COLOR_PANEL_TEXT, bold_scale=None) -> None:
            nonlocal y
            s = bold_scale if bold_scale else scale
            cv2.putText(panel, text, (x_margin, y), font, s, color, 1, cv2.LINE_AA)
            y += int(24 * s / 0.42)

        sep = "=" * 30
        put_line(sep, COLOR_PANEL_ACCENT, scale * 0.55)
        put_line("VEHICLE ANALYSIS", COLOR_PANEL_ACCENT, scale * 0.65)
        put_line(sep, COLOR_PANEL_ACCENT, scale * 0.55)
        y += 8

        state = panel_state if panel_state is not None else self.latest_finalized
        if state is None or not state.finalized:
            if state is None:
                put_line("Awaiting vehicle...", (160, 160, 160))
                put_line("")
                put_line("No active tracks", (120, 120, 120), scale * 0.42)
            else:
                fields_live = [
                    ("Vehicle ID", f"{state.track_id:02d}"),
                    ("Vehicle Name", state.display_vehicle or "Vehicle Detected"),
                    ("License Plate", state.display_plate or "Plate Detecting"),
                    ("Plate Confidence", f"{state.display_plate_conf * 100:.1f}%"),
                    ("Vehicle Confidence", f"{state.display_vehicle_conf * 100:.1f}%"),
                    ("Status", "Analyzing"),
                    ("Time", datetime.now().strftime("%H:%M:%S")),
                ]
                for key, value in fields_live:
                    put_line(
                        f"{key:16}: {value}",
                        COLOR_PANEL_ACCENT if key == "Status" else COLOR_PANEL_TEXT,
                    )
                put_line("")
                put_line(sep, COLOR_PANEL_ACCENT, scale * 0.55)
        else:
            status_color = (
                COLOR_AUTHORIZED if state.final_status == "Authorized"
                else COLOR_UNAUTHORIZED if state.final_status == "Unauthorized"
                else COLOR_PANEL_ACCENT
            )
            fields = [
                ("Vehicle ID", f"{state.track_id:02d}"),
                ("Vehicle Name", state.final_vehicle or "Unknown"),
                ("License Plate", state.final_plate or "N/A"),
                ("Plate Confidence", f"{state.final_plate_conf * 100:.1f}%"),
                ("Vehicle Confidence", f"{state.final_vehicle_conf * 100:.1f}%"),
                ("Status", state.final_status),
                ("Time", state.finalized_time or "--:--:--"),
            ]
            for key, value in fields:
                put_line(f"{key:16}: {value}", (
                    status_color if key == "Status" else COLOR_PANEL_TEXT
                ))
            put_line("")
            put_line(sep, COLOR_PANEL_ACCENT, scale * 0.55)

        return panel

    def render_frame(
        self,
        frame: np.ndarray,
        active_tracks: Dict[int, VehicleTrackState],
        panel_state: Optional[VehicleTrackState] = None,
    ) -> np.ndarray:
        """Draw overlays and append a compact analysis panel on the right."""
        scale = self._font_scale(frame.shape[0])
        annotated = frame.copy()
        for state in active_tracks.values():
            self.draw_track(annotated, state, scale)

        h, w = annotated.shape[:2]
        panel_w = min(self.panel_width, max(150, int(w * 0.20)))
        panel_img = self.compose_panel(h, panel_state=panel_state)
        panel_img = cv2.resize(panel_img, (panel_w, h), interpolation=cv2.INTER_AREA)
        return np.hstack([annotated, panel_img])


# ---------------------------------------------------------------------------
# Vehicle log
# ---------------------------------------------------------------------------
class VehicleLogger:
    """CSV log of finalized vehicle detections."""

    COLUMNS = [
        "vehicle_id",
        "plate_number",
        "vehicle_make",
        "vehicle_model",
        "plate_confidence",
        "vehicle_confidence",
        "status",
        "timestamp",
        "frame_number",
    ]

    def __init__(self, log_path: Path):
        self.log_path = log_path
        self.rows: List[Dict[str, Any]] = []
        log_path.parent.mkdir(parents=True, exist_ok=True)

    def log_vehicle(self, state: VehicleTrackState, frame_idx: int) -> None:
        if state.logged:
            return
        row = {
            "vehicle_id": f"{state.track_id:02d}",
            "plate_number": state.final_plate,
            "vehicle_make": state.final_make,
            "vehicle_model": state.final_model,
            "plate_confidence": round(state.final_plate_conf, 4),
            "vehicle_confidence": round(state.final_vehicle_conf, 4),
            "status": state.final_status,
            "timestamp": datetime.now().isoformat(timespec="seconds"),
            "frame_number": frame_idx,
        }
        self.rows.append(row)
        state.logged = True
        logger.info(
            "Logged vehicle ID=%02d plate=%s vehicle=%s status=%s",
            state.track_id, state.final_plate, state.final_vehicle, state.final_status,
        )

    def save(self) -> None:
        df = pd.DataFrame(self.rows, columns=self.COLUMNS)
        df.to_csv(self.log_path, index=False)
        logger.info("Vehicle log saved: %s (%d entries)", self.log_path, len(self.rows))


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------
class GateInferencePipeline:
    """End-to-end gate surveillance inference pipeline."""

    def __init__(self, cfg: PipelineConfig):
        self.cfg = cfg
        self.models = ModelManager(cfg)
        self.authorized_plates = load_authorized_plates(cfg.authorized_vehicles_path)
        self.tracks: Dict[int, VehicleTrackState] = {}
        self.finalized_tracks: Dict[int, VehicleTrackState] = {}
        self.panel_track_id: Optional[int] = None

        cfg.output_dir.mkdir(parents=True, exist_ok=True)
        (cfg.output_dir / "plates").mkdir(exist_ok=True)
        if cfg.save_screenshots:
            (cfg.output_dir / "screenshots").mkdir(exist_ok=True)

        self.logger = VehicleLogger(cfg.output_dir / "vehicle_log.csv")
        self.renderer = VideoRenderer(panel_width=cfg.panel_width_px)

    def _crop_with_bounds(
        self, frame: np.ndarray, bbox: Tuple[int, int, int, int]
    ) -> Tuple[np.ndarray, Tuple[int, int, int, int]]:
        h, w = frame.shape[:2]
        x1, y1, x2, y2 = bbox
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w, x2), min(h, y2)
        return frame[y1:y2, x1:x2].copy(), (x1, y1, x2, y2)

    def _process_track(
        self,
        frame: np.ndarray,
        track_id: int,
        vehicle_bbox: Tuple[int, int, int, int],
        frame_idx: int,
    ) -> None:
        if track_id not in self.tracks:
            self.tracks[track_id] = VehicleTrackState(track_id=track_id)

        state = self.tracks[track_id]
        state.missing_frames = 0
        state.observation_frames += 1
        state.vehicle_bbox = vehicle_bbox

        roi, clamped = self._crop_with_bounds(frame, vehicle_bbox)
        if roi.size == 0:
            return

        # Vehicle make/model on vehicle crop
        try:
            v_label, v_conf = self.models.classify_vehicle_crop(roi)
            if v_conf >= self.cfg.min_vehicle_cls_conf * 0.8:
                state.vehicle_history.append((v_label, v_conf))
        except Exception as exc:
            logger.debug("VMMR failed for track %d: %s", track_id, exc)

        # Plate detection within vehicle ROI
        try:
            plate_bbox_roi, plate_crop, plate_text, plate_conf = (
                self.models.detect_plate_in_roi(roi)
            )
            if plate_bbox_roi is not None:
                px1, py1, px2, py2 = plate_bbox_roi
                vx1, vy1, _, _ = clamped
                state.plate_bbox = (vx1 + px1, vy1 + py1, vx1 + px2, vy1 + py2)

                if plate_text not in ("NO_CHARS", "NO_TEXT", "NO_PLATE"):
                    state.plate_history.append((plate_text, plate_conf))

                if plate_crop is not None and plate_conf > state.best_plate_conf:
                    state.best_plate_conf = plate_conf
                    state.best_plate_crop = plate_crop.copy()
        except Exception as exc:
            logger.debug("Plate OCR failed for track %d: %s", track_id, exc)

        state.update_smoothed_display()

        if state.ready_to_finalize(self.cfg):
            self._finalize_track(state, frame_idx, frame)

    def _finalize_track(
        self,
        state: VehicleTrackState,
        frame_idx: int,
        frame: Optional[np.ndarray] = None,
    ) -> None:
        state.finalize(frame_idx, self.authorized_plates)
        self.finalized_tracks[state.track_id] = state
        self.renderer.set_panel_vehicle(state)
        self.logger.log_vehicle(state, frame_idx)

        plate_slug = re.sub(r"[^A-Z0-9]", "", (state.final_plate or "unknown").upper())

        # Save cropped plate
        if state.best_plate_crop is not None:
            plate_path = (
                self.cfg.output_dir / "plates"
                / f"id{state.track_id:02d}_{plate_slug}.jpg"
            )
            try:
                cv2.imwrite(str(plate_path), state.best_plate_crop)
            except Exception as exc:
                logger.warning("Failed to save plate crop: %s", exc)

        # Optional screenshot of finalized annotated frame
        if self.cfg.save_screenshots and frame is not None:
            visible = {state.track_id: state}
            shot = self.renderer.render_frame(frame, visible, panel_state=state)
            shot_path = (
                self.cfg.output_dir / "screenshots"
                / f"id{state.track_id:02d}_{plate_slug}_f{frame_idx}.jpg"
            )
            try:
                cv2.imwrite(str(shot_path), shot)
            except Exception as exc:
                logger.warning("Failed to save screenshot: %s", exc)

    def _update_missing_tracks(self, active_ids: set, frame_idx: int) -> None:
        if self.panel_track_id is not None and self.panel_track_id not in active_ids:
            self.panel_track_id = None
        for tid, state in list(self.tracks.items()):
            if tid not in active_ids:
                state.missing_frames += 1
                if not state.finalized and state.ready_to_finalize(self.cfg):
                    self._finalize_track(state, frame_idx, None)

    def _select_panel_state(self, active_ids: set) -> Optional[VehicleTrackState]:
        """
        Keep panel synchronized with one active track.
        Sticky selection avoids ID mismatch and label flicker.
        """
        if self.panel_track_id is not None and self.panel_track_id in active_ids:
            return self.tracks.get(self.panel_track_id)

        best_tid: Optional[int] = None
        best_area = -1
        for tid in active_ids:
            st = self.tracks.get(tid)
            if st is None or st.vehicle_bbox is None:
                continue
            x1, y1, x2, y2 = st.vehicle_bbox
            area = max(0, x2 - x1) * max(0, y2 - y1)
            if area > best_area:
                best_area = area
                best_tid = tid

        self.panel_track_id = best_tid
        if best_tid is not None:
            return self.tracks.get(best_tid)
        return self.renderer.latest_finalized

    def run(
        self,
        on_progress: Optional[ProgressCallback] = None,
        cancel_event: Optional[threading.Event] = None,
        preview_every: int = 5,
    ) -> Dict[str, Any]:
        """Process the video and write outputs."""
        cfg = self.cfg
        cap = cv2.VideoCapture(str(cfg.video_path))
        if not cap.isOpened():
            raise RuntimeError(f"Cannot open video: {cfg.video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        panel_w = min(self.renderer.panel_width, max(150, int(width * 0.20)))
        out_w = width + panel_w
        out_h = height

        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out_path = cfg.output_dir / "output.mp4"
        writer = cv2.VideoWriter(str(out_path), fourcc, fps, (out_w, out_h))

        logger.info(
            "Processing %s [%dx%d @ %.1f fps, ~%d frames]",
            cfg.video_path.name, width, height, fps, total_frames,
        )

        if on_progress:
            on_progress({
                "phase": "processing",
                "frame_idx": 0,
                "total_frames": total_frames,
                "active_tracks": 0,
                "finalized": 0,
                "status": "Starting analysis...",
                "preview": None,
            })

        frame_idx = 0
        t0 = time.perf_counter()
        active_ids: set = set()

        try:
            while True:
                if cancel_event and cancel_event.is_set():
                    logger.info("Processing cancelled by user.")
                    break

                ret, frame = cap.read()
                if not ret:
                    break

                frame_idx += 1
                active_ids = set()

                # Vehicle detection + ByteTrack tracking
                try:
                    track_results = self.models.vehicle_detector.track(
                        source=frame,
                        persist=True,
                        tracker="bytetrack.yaml",
                        classes=list(COCO_VEHICLE_CLASSES),
                        conf=cfg.vehicle_conf,
                        verbose=False,
                    )
                    result = track_results[0]
                    if result.boxes is not None and result.boxes.id is not None:
                        boxes = result.boxes.xyxy.cpu().numpy().astype(int)
                        ids = result.boxes.id.cpu().numpy().astype(int)
                        for bbox, tid in zip(boxes, ids):
                            tid = int(tid)
                            active_ids.add(tid)
                            self._process_track(
                                frame, tid, tuple(bbox), frame_idx
                            )
                except Exception as exc:
                    logger.warning("Tracking error on frame %d: %s", frame_idx, exc)

                self._update_missing_tracks(active_ids, frame_idx)

                visible: Dict[int, VehicleTrackState] = {}
                for tid in active_ids:
                    if tid in self.tracks:
                        visible[tid] = self.tracks[tid]
                for tid, state in self.finalized_tracks.items():
                    if tid in active_ids:
                        visible[tid] = state

                panel_state = self._select_panel_state(active_ids)
                output_frame = self.renderer.render_frame(
                    frame,
                    visible,
                    panel_state=panel_state,
                )
                writer.write(output_frame)

                if cfg.show_live_preview:
                    preview = cv2.resize(output_frame, (out_w // 2, out_h // 2))
                    cv2.imshow("Gate Surveillance", preview)
                    if cv2.waitKey(1) & 0xFF == ord("q"):
                        logger.info("Preview interrupted by user.")
                        break

                if on_progress and (
                    frame_idx == 1
                    or frame_idx % preview_every == 0
                    or frame_idx == total_frames
                ):
                    preview_small = None
                    if output_frame is not None:
                        preview_small = output_frame.copy()
                    on_progress({
                        "phase": "processing",
                        "frame_idx": frame_idx,
                        "total_frames": total_frames,
                        "active_tracks": len(active_ids),
                        "finalized": len(self.finalized_tracks),
                        "status": f"Frame {frame_idx}/{total_frames or '?'}",
                        "preview": preview_small,
                        "vehicles": self._vehicles_snapshot(),
                    })

                if frame_idx % 100 == 0:
                    elapsed = time.perf_counter() - t0
                    fps_proc = frame_idx / elapsed if elapsed > 0 else 0
                    logger.info(
                        "Frame %d/%d (%.1f fps) | active tracks: %d | finalized: %d",
                        frame_idx, total_frames, fps_proc,
                        len(active_ids), len(self.finalized_tracks),
                    )

        finally:
            for state in self.tracks.values():
                if not state.finalized and state.observation_frames >= 3:
                    self._finalize_track(state, frame_idx, None)

            cap.release()
            writer.release()
            if cfg.show_live_preview:
                cv2.destroyAllWindows()

        self.logger.save()
        elapsed = time.perf_counter() - t0

        summary = {
            "video": str(cfg.video_path),
            "output_video": str(out_path),
            "vehicle_log": str(cfg.output_dir / "vehicle_log.csv"),
            "output_dir": str(cfg.output_dir),
            "frames_processed": frame_idx,
            "vehicles_finalized": len(self.finalized_tracks),
            "elapsed_seconds": round(elapsed, 2),
            "processing_fps": round(frame_idx / elapsed, 2) if elapsed > 0 else 0,
            "vehicles": self._vehicles_snapshot(),
            "cancelled": bool(cancel_event and cancel_event.is_set()),
        }
        logger.info("Pipeline complete: %s", summary)

        if on_progress:
            on_progress({
                "phase": "done",
                "frame_idx": frame_idx,
                "total_frames": total_frames,
                "active_tracks": 0,
                "finalized": len(self.finalized_tracks),
                "status": "Analysis complete.",
                "preview": None,
                "summary": summary,
                "vehicles": summary["vehicles"],
            })

        return summary

    def _vehicles_snapshot(self) -> List[Dict[str, Any]]:
        """Serializable list of finalized vehicle results."""
        rows = []
        for state in sorted(self.finalized_tracks.values(), key=lambda s: s.track_id):
            rows.append({
                "id": f"{state.track_id:02d}",
                "plate": state.final_plate or "N/A",
                "vehicle": state.final_vehicle or "Unknown",
                "plate_conf": round(state.final_plate_conf * 100, 1),
                "vehicle_conf": round(state.final_vehicle_conf * 100, 1),
                "status": state.final_status,
                "time": state.finalized_time,
            })
        return rows


# ---------------------------------------------------------------------------
# Graphical user interface
# ---------------------------------------------------------------------------
class GatePipelineGUI:
    """Desktop popup for video upload, analysis, results, and download."""

    BG = "#1a1a2e"
    PANEL = "#16213e"
    ACCENT = "#0f9ed5"
    TEXT = "#eaeaea"
    MUTED = "#8a8a9a"
    SUCCESS = "#2ecc71"
    WARN = "#e74c3c"

    def __init__(self) -> None:
        self.root = tk.Tk()
        self.root.title("Gate Surveillance — Vehicle Analysis")
        self.root.geometry("1280x820")
        self.root.minsize(1100, 700)
        self.root.configure(bg=self.BG)

        self.video_path = tk.StringVar()
        self.models_dir = tk.StringVar(value=str(SCRIPT_DIR))
        self.status_text = tk.StringVar(value="Upload a gate surveillance video to begin.")
        self.device_label = tk.StringVar(
            value=f"Device: {'CUDA' if torch.cuda.is_available() else 'CPU'}"
        )

        self._worker: Optional[threading.Thread] = None
        self._cancel_event = threading.Event()
        self._summary: Optional[Dict[str, Any]] = None
        self._preview_photo: Optional[Any] = None

        self._build_ui()
        self.root.protocol("WM_DELETE_WINDOW", self._on_close)

    def _build_ui(self) -> None:
        style = ttk.Style()
        style.theme_use("clam")
        style.configure("TFrame", background=self.BG)
        style.configure("Card.TFrame", background=self.PANEL)
        style.configure("TLabel", background=self.BG, foreground=self.TEXT, font=("Segoe UI", 10))
        style.configure("Title.TLabel", background=self.BG, foreground=self.ACCENT, font=("Segoe UI", 16, "bold"))
        style.configure("Muted.TLabel", background=self.BG, foreground=self.MUTED, font=("Segoe UI", 9))
        style.configure("Card.TLabel", background=self.PANEL, foreground=self.TEXT, font=("Segoe UI", 10))
        style.configure("Accent.TButton", font=("Segoe UI", 10, "bold"))
        style.configure("Horizontal.TProgressbar", troughcolor=self.PANEL, background=self.ACCENT)

        header = ttk.Frame(self.root, style="TFrame")
        header.pack(fill=tk.X, padx=20, pady=(16, 8))
        ttk.Label(header, text="Smart Gate Vehicle Analysis", style="Title.TLabel").pack(anchor=tk.W)
        ttk.Label(
            header,
            text="License plate OCR • Vehicle make/model • ByteTrack • Temporal fusion",
            style="Muted.TLabel",
        ).pack(anchor=tk.W, pady=(2, 0))
        ttk.Label(header, textvariable=self.device_label, style="Muted.TLabel").pack(anchor=tk.W, pady=(4, 0))

        card = ttk.Frame(self.root, style="Card.TFrame", padding=14)
        card.pack(fill=tk.X, padx=20, pady=8)

        row1 = ttk.Frame(card, style="Card.TFrame")
        row1.pack(fill=tk.X, pady=4)
        ttk.Label(row1, text="Video file", style="Card.TLabel", width=12).pack(side=tk.LEFT)
        ttk.Entry(row1, textvariable=self.video_path, width=70).pack(side=tk.LEFT, padx=6, fill=tk.X, expand=True)
        ttk.Button(row1, text="Browse…", command=self._browse_video).pack(side=tk.LEFT)

        row2 = ttk.Frame(card, style="Card.TFrame")
        row2.pack(fill=tk.X, pady=4)
        ttk.Label(row2, text="Models folder", style="Card.TLabel", width=12).pack(side=tk.LEFT)
        ttk.Entry(row2, textvariable=self.models_dir, width=70).pack(side=tk.LEFT, padx=6, fill=tk.X, expand=True)
        ttk.Button(row2, text="Browse…", command=self._browse_models).pack(side=tk.LEFT)

        actions = ttk.Frame(self.root, style="TFrame")
        actions.pack(fill=tk.X, padx=20, pady=4)
        self.run_btn = ttk.Button(actions, text="▶  Run Analysis", command=self._start_analysis)
        self.run_btn.pack(side=tk.LEFT, padx=(0, 8))
        self.cancel_btn = ttk.Button(actions, text="Cancel", command=self._cancel_analysis, state=tk.DISABLED)
        self.cancel_btn.pack(side=tk.LEFT)

        self.progress = ttk.Progressbar(self.root, mode="determinate", style="Horizontal.TProgressbar")
        self.progress.pack(fill=tk.X, padx=20, pady=(8, 4))
        ttk.Label(self.root, textvariable=self.status_text, style="Muted.TLabel").pack(anchor=tk.W, padx=22)

        body = ttk.Frame(self.root, style="TFrame")
        body.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)

        preview_frame = ttk.LabelFrame(body, text=" Live Preview ", padding=6)
        preview_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 8))
        self.preview_label = tk.Label(
            preview_frame,
            text="Preview will appear here during analysis",
            bg="#0d0d14",
            fg=self.MUTED,
            font=("Segoe UI", 10),
            anchor=tk.CENTER,
        )
        self.preview_label.pack(fill=tk.BOTH, expand=True)

        results_frame = ttk.LabelFrame(body, text=" Analysis ", padding=6)
        results_frame.pack(side=tk.RIGHT, fill=tk.Y, expand=False)
        self.results_box = tk.Text(
            results_frame,
            width=24,
            height=18,
            bg="#0d0d14",
            fg=self.TEXT,
            font=("Consolas", 9),
            relief=tk.FLAT,
            padx=8,
            pady=8,
            wrap=tk.WORD,
            state=tk.DISABLED,
        )
        scroll = ttk.Scrollbar(results_frame, command=self.results_box.yview)
        self.results_box.configure(yscrollcommand=scroll.set)
        self.results_box.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scroll.pack(side=tk.RIGHT, fill=tk.Y)

        downloads = ttk.Frame(self.root, style="TFrame")
        downloads.pack(fill=tk.X, padx=20, pady=(0, 16))
        self.download_video_btn = ttk.Button(
            downloads, text="⬇ Download Annotated Video", command=self._download_video, state=tk.DISABLED,
        )
        self.download_video_btn.pack(side=tk.LEFT, padx=(0, 8))
        self.download_csv_btn = ttk.Button(
            downloads, text="⬇ Download Vehicle Log (CSV)", command=self._download_csv, state=tk.DISABLED,
        )
        self.download_csv_btn.pack(side=tk.LEFT, padx=(0, 8))
        self.open_folder_btn = ttk.Button(
            downloads, text="Open Output Folder", command=self._open_output_folder, state=tk.DISABLED,
        )
        self.open_folder_btn.pack(side=tk.LEFT)

    def _browse_video(self) -> None:
        path = filedialog.askopenfilename(
            title="Select gate surveillance video",
            filetypes=[
                ("Video files", "*.mp4 *.avi *.mov *.mkv *.webm"),
                ("All files", "*.*"),
            ],
        )
        if path:
            self.video_path.set(path)

    def _browse_models(self) -> None:
        path = filedialog.askdirectory(title="Select folder containing model weights")
        if path:
            self.models_dir.set(path)

    def _set_results_text(self, text: str) -> None:
        self.results_box.configure(state=tk.NORMAL)
        self.results_box.delete("1.0", tk.END)
        self.results_box.insert(tk.END, text)
        self.results_box.configure(state=tk.DISABLED)

    def _format_vehicle_results(self, vehicles: List[Dict[str, Any]]) -> str:
        if not vehicles:
            return "No vehicles finalized yet.\n\nResults appear here as each\nvehicle is analyzed."
        lines = ["=" * 32, "  VEHICLE ANALYSIS RESULTS", "=" * 32, ""]
        for v in vehicles:
            lines.extend([
                f"ID       : {v['id']}",
                f"Plate    : {v['plate']}",
                f"Vehicle  : {v['vehicle']}",
                f"Plate %  : {v['plate_conf']}%",
                f"Vehicle %: {v['vehicle_conf']}%",
                f"Status   : {v['status']}",
                f"Time     : {v['time']}",
                "-" * 32,
            ])
        return "\n".join(lines)

    def _start_analysis(self) -> None:
        video = Path(self.video_path.get().strip())
        if not video.is_file():
            messagebox.showerror("No video", "Please select a valid video file.")
            return

        models_dir = Path(self.models_dir.get().strip() or SCRIPT_DIR)
        if self._worker and self._worker.is_alive():
            messagebox.showwarning("Busy", "Analysis is already running.")
            return

        self._cancel_event.clear()
        self._summary = None
        self.progress["value"] = 0
        self._set_results_text("Loading models and starting analysis…")
        self.status_text.set("Loading models…")
        self.run_btn.configure(state=tk.DISABLED)
        self.cancel_btn.configure(state=tk.NORMAL)
        self.download_video_btn.configure(state=tk.DISABLED)
        self.download_csv_btn.configure(state=tk.DISABLED)
        self.open_folder_btn.configure(state=tk.DISABLED)

        cfg = PipelineConfig(
            video_path=video.resolve(),
            output_dir=(SCRIPT_DIR / "output" / f"run_{datetime.now().strftime('%Y%m%d_%H%M%S')}").resolve(),
            models_dir=models_dir.resolve(),
            show_live_preview=False,
            save_screenshots=True,
            device="cuda" if torch.cuda.is_available() else "cpu",
        )

        self._worker = threading.Thread(
            target=self._run_worker,
            args=(cfg,),
            daemon=True,
        )
        self._worker.start()

    def _run_worker(self, cfg: PipelineConfig) -> None:
        try:
            self.root.after(0, lambda: self.status_text.set("Loading AI models (first run may take a minute)…"))
            pipeline = GateInferencePipeline(cfg)
            pipeline.run(
                on_progress=self._on_progress_threadsafe,
                cancel_event=self._cancel_event,
                preview_every=3,
            )
        except Exception as exc:
            logger.exception("GUI pipeline failed")
            self.root.after(0, lambda: self._on_error(str(exc)))

    def _on_progress_threadsafe(self, data: Dict[str, Any]) -> None:
        self.root.after(0, lambda: self._on_progress(data))

    def _scale_preview_for_label(self, bgr: np.ndarray) -> ImageTk.PhotoImage:
        """Fit preview to available width while keeping aspect ratio."""
        lw = max(self.preview_label.winfo_width(), 900)
        lh = max(self.preview_label.winfo_height(), 500)
        h, w = bgr.shape[:2]
        scale = min(lw / w, lh / h)
        nw = max(1, int(w * scale))
        nh = max(1, int(h * scale))
        resized = cv2.resize(bgr, (nw, nh), interpolation=cv2.INTER_AREA)
        rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
        return ImageTk.PhotoImage(Image.fromarray(rgb))

    def _on_progress(self, data: Dict[str, Any]) -> None:
        phase = data.get("phase", "processing")
        frame_idx = int(data.get("frame_idx", 0))
        total = int(data.get("total_frames", 0))
        finalized = int(data.get("finalized", 0))
        status = str(data.get("status", ""))

        if total > 0:
            self.progress["value"] = min(100, (frame_idx / total) * 100)
        self.status_text.set(
            f"{status}  |  Active: {data.get('active_tracks', 0)}  |  Finalized: {finalized}"
        )

        vehicles = data.get("vehicles") or []
        self._set_results_text(self._format_vehicle_results(vehicles))

        preview = data.get("preview")
        if preview is not None:
            self._preview_photo = self._scale_preview_for_label(preview)
            self.preview_label.configure(image=self._preview_photo, text="")

        if phase == "done":
            self._summary = data.get("summary")
            self.run_btn.configure(state=tk.NORMAL)
            self.cancel_btn.configure(state=tk.DISABLED)
            self.download_video_btn.configure(state=tk.NORMAL)
            self.download_csv_btn.configure(state=tk.NORMAL)
            self.open_folder_btn.configure(state=tk.NORMAL)
            if self._summary and self._summary.get("cancelled"):
                self.status_text.set("Analysis cancelled. Partial outputs may be available.")
                messagebox.showinfo("Cancelled", "Analysis was cancelled. Partial results were saved.")
            else:
                n = self._summary.get("vehicles_finalized", 0) if self._summary else 0
                self.status_text.set(f"Complete — {n} vehicle(s) analyzed.")
                messagebox.showinfo(
                    "Analysis Complete",
                    f"Processing finished.\n\n"
                    f"Vehicles detected: {n}\n"
                    f"Output saved to:\n{self._summary.get('output_dir', '')}",
                )

    def _on_error(self, message: str) -> None:
        self.run_btn.configure(state=tk.NORMAL)
        self.cancel_btn.configure(state=tk.DISABLED)
        self.status_text.set("Error during analysis.")
        self._set_results_text(f"ERROR\n\n{message}")
        messagebox.showerror("Analysis Failed", message)

    def _cancel_analysis(self) -> None:
        if self._worker and self._worker.is_alive():
            self._cancel_event.set()
            self.status_text.set("Cancelling…")

    def _download_video(self) -> None:
        if not self._summary:
            return
        src = Path(self._summary["output_video"])
        if not src.is_file():
            messagebox.showerror("Not found", f"Output video not found:\n{src}")
            return
        dest = filedialog.asksaveasfilename(
            title="Save annotated video",
            defaultextension=".mp4",
            initialfile="gate_analysis_output.mp4",
            filetypes=[("MP4 video", "*.mp4"), ("All files", "*.*")],
        )
        if dest:
            shutil.copy2(src, dest)
            messagebox.showinfo("Saved", f"Video saved to:\n{dest}")

    def _download_csv(self) -> None:
        if not self._summary:
            return
        src = Path(self._summary["vehicle_log"])
        if not src.is_file():
            messagebox.showerror("Not found", f"Vehicle log not found:\n{src}")
            return
        dest = filedialog.asksaveasfilename(
            title="Save vehicle log",
            defaultextension=".csv",
            initialfile="vehicle_log.csv",
            filetypes=[("CSV file", "*.csv"), ("All files", "*.*")],
        )
        if dest:
            shutil.copy2(src, dest)
            messagebox.showinfo("Saved", f"CSV saved to:\n{dest}")

    def _open_output_folder(self) -> None:
        if not self._summary:
            return
        folder = Path(self._summary.get("output_dir", ""))
        if folder.is_dir():
            import os
            os.startfile(str(folder))
        else:
            messagebox.showerror("Not found", f"Output folder not found:\n{folder}")

    def _on_close(self) -> None:
        if self._worker and self._worker.is_alive():
            if not messagebox.askyesno("Quit", "Analysis is running. Cancel and exit?"):
                return
            self._cancel_event.set()
        self.root.destroy()

    def run(self) -> None:
        self.root.mainloop()


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def parse_args(argv: Optional[Sequence[str]] = None) -> Optional[PipelineConfig]:
    parser = argparse.ArgumentParser(
        description="Gate surveillance inference pipeline with LPR + VMMR + ByteTrack",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--cli", action="store_true",
        help="Run in command-line mode (requires --video)",
    )
    parser.add_argument(
        "--video", "-v", type=Path, default=None,
        help="Path to input surveillance video (CLI mode)",
    )
    parser.add_argument(
        "--output-dir", "-o", type=Path, default=SCRIPT_DIR / "output",
        help="Directory for output.mp4, vehicle_log.csv, and crops",
    )
    parser.add_argument(
        "--models-dir", "-m", type=Path, default=SCRIPT_DIR,
        help="Directory containing model weight files",
    )
    parser.add_argument(
        "--authorized", type=Path, default=None,
        help="JSON or text file with authorized plates (optional)",
    )
    parser.add_argument("--plate-conf", type=float, default=0.25)
    parser.add_argument("--char-conf", type=float, default=0.20)
    parser.add_argument("--vehicle-conf", type=float, default=0.40)
    parser.add_argument(
        "--finalize-frames", type=int, default=12,
        help="Frames of stable observation before finalizing",
    )
    parser.add_argument(
        "--preview", action="store_true",
        help="Show live preview window during processing",
    )
    parser.add_argument(
        "--device", type=str, default=None,
        choices=["cpu", "cuda"],
        help="Force inference device (default: auto)",
    )
    parser.add_argument(
        "--no-screenshots", action="store_true",
        help="Skip saving finalized detection screenshots",
    )

    args = parser.parse_args(argv)

    # Default: open GUI when no CLI flags provided
    if not args.cli and args.video is None:
        return None

    if args.video is None:
        parser.error("--video is required in CLI mode (or run without --cli for GUI)")

    if not args.video.is_file():
        parser.error(f"Video not found: {args.video}")

    device = args.device or ("cuda" if torch.cuda.is_available() else "cpu")

    return PipelineConfig(
        video_path=args.video.resolve(),
        output_dir=args.output_dir.resolve(),
        models_dir=args.models_dir.resolve(),
        authorized_vehicles_path=args.authorized.resolve() if args.authorized else None,
        plate_conf=args.plate_conf,
        char_conf=args.char_conf,
        vehicle_conf=args.vehicle_conf,
        finalize_stable_frames=args.finalize_frames,
        show_live_preview=args.preview,
        save_screenshots=not args.no_screenshots,
        device=device,
    )


def main(argv: Optional[Sequence[str]] = None) -> int:
    try:
        cfg = parse_args(argv)
        if cfg is None:
            GatePipelineGUI().run()
            return 0

        pipeline = GateInferencePipeline(cfg)
        summary = pipeline.run()
        print("\n" + "=" * 50)
        print("GATE SURVEILLANCE ANALYSIS COMPLETE")
        print("=" * 50)
        for key, value in summary.items():
            if key != "vehicles":
                print(f"  {key}: {value}")
        print("=" * 50)
        return 0
    except FileNotFoundError as exc:
        logger.error("%s", exc)
        return 1
    except KeyboardInterrupt:
        logger.info("Interrupted.")
        return 130
    except Exception as exc:
        logger.exception("Pipeline failed: %s", exc)
        return 1


if __name__ == "__main__":
    sys.exit(main())
