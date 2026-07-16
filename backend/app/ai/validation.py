"""
Post-extraction validation and normalisation.

Takes the raw dict produced by Gemini, checks required fields, normalises
medicine names, flags anomalous dosages, and calculates a confidence score.
"""

from __future__ import annotations

import logging
import re
from typing import Any, Dict, List, Optional

from app.schemas.prescription import ExtractionResult, MedicineExtracted

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Known dosage ranges for sanity-checking (unit → (min, max) in mg).
# This is intentionally small — a production system would use a drug DB.
# ---------------------------------------------------------------------------
_DOSAGE_RANGES: Dict[str, tuple[float, float]] = {
    "paracetamol": (100.0, 1000.0),
    "amoxicillin": (125.0, 1000.0),
    "ibuprofen": (100.0, 800.0),
    "metformin": (250.0, 1000.0),
    "atorvastatin": (5.0, 80.0),
    "omeprazole": (10.0, 40.0),
    "cetirizine": (5.0, 10.0),
}


def _normalise_medicine_name(name: str) -> str:
    """Title-case and strip extraneous whitespace from a medicine name."""
    return " ".join(name.split()).title()


def _extract_mg(dosage: Optional[str]) -> Optional[float]:
    """Attempt to extract a milligram value from a dosage string."""
    if not dosage:
        return None
    match = re.search(r"(\d+(?:\.\d+)?)\s*mg", dosage, re.IGNORECASE)
    if match:
        return float(match.group(1))
    return None


def _check_dosage_range(
    medicine_name: str, dosage: Optional[str]
) -> Optional[str]:
    """Return a warning string if the dosage looks anomalous, else ``None``."""
    mg = _extract_mg(dosage)
    if mg is None:
        return None

    key = medicine_name.lower().strip()
    bounds = _DOSAGE_RANGES.get(key)
    if bounds is None:
        return None

    lo, hi = bounds
    if mg < lo or mg > hi:
        warning = (
            f"Dosage {mg} mg for {medicine_name} is outside typical range "
            f"({lo}–{hi} mg)"
        )
        logger.warning(warning)
        return warning
    return None


def _calculate_confidence(
    data: Dict[str, Any], warnings: List[str]
) -> float:
    """Heuristic confidence score (0.0 – 1.0).

    Starts at 1.0 and applies penalties:

    * –0.1  for each missing core field (doctor, patient, date, diagnosis).
    * –0.15 for each dosage anomaly.
    * –0.2  if no medicines extracted at all.
    """
    score = 1.0

    for field in ("doctor_name", "patient_name", "prescription_date", "diagnosis"):
        if not data.get(field):
            score -= 0.1

    score -= 0.15 * len(warnings)

    if not data.get("medicines"):
        score -= 0.2

    return max(round(score, 2), 0.0)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def validate_extraction(data: Dict[str, Any], user_allergies: Optional[List[str]] = None) -> ExtractionResult:
    """Validate and normalise an AI extraction dict.

    Args:
        data: Raw dict from ``GeminiExtractor.extract_prescription``.
        user_allergies: Optional list of user's known allergies.

    Returns:
        A fully validated ``ExtractionResult`` schema instance.
    """
    warnings: List[str] = []

    # --- Medicines & Rule Engine ---
    raw_medicines: list = data.get("medicines") or []
    validated_medicines: List[MedicineExtracted] = []
    seen_medicines = set()

    for raw in raw_medicines:
        if not isinstance(raw, dict):
            continue

        name = raw.get("medicine_name", "")
        if not name:
            warnings.append("Skipped medicine entry with empty name")
            continue

        name = _normalise_medicine_name(name)
        med_warnings = []
        med_confidence = 1.0

        # Duplicate check
        if name.lower() in seen_medicines:
            med_warnings.append(f"Duplicate medicine detected: {name}")
            warnings.append(f"Duplicate medicine detected: {name}")
            med_confidence -= 0.3
        seen_medicines.add(name.lower())

        # Allergy check
        if user_allergies:
            for allergy in user_allergies:
                if allergy.lower() in name.lower() or name.lower() in allergy.lower():
                    msg = f"CRITICAL: Potential allergy detected between {name} and {allergy}"
                    med_warnings.append(msg)
                    warnings.append(msg)
                    med_confidence -= 0.5

        # Dosage sanity check
        dosage_warning = _check_dosage_range(name, raw.get("dosage"))
        if dosage_warning:
            med_warnings.append(dosage_warning)
            warnings.append(dosage_warning)
            med_confidence -= 0.2
            
        if not raw.get("dosage"):
            med_confidence -= 0.2
        if not raw.get("timing"):
            med_confidence -= 0.1
        if not raw.get("frequency"):
            med_confidence -= 0.1
        
        duration = raw.get("duration_days")
        if duration and isinstance(duration, int) and duration > 100:
            msg = f"Suspicious duration: {duration} days for {name}"
            med_warnings.append(msg)
            warnings.append(msg)
            med_confidence -= 0.3
            
        med_confidence = max(0.0, min(1.0, round(med_confidence, 2)))

        validated_medicines.append(
            MedicineExtracted(
                medicine_name=name,
                dosage=raw.get("dosage"),
                frequency=raw.get("frequency"),
                timing=raw.get("timing"),
                duration_days=raw.get("duration_days"),
                special_instructions=raw.get("special_instructions"),
                confidence=med_confidence,
                warnings=med_warnings
            )
        )

    # --- Confidence ---
    confidence = _calculate_confidence(data, warnings)

    # --- Build notes ---
    notes_parts: List[str] = []
    if data.get("notes"):
        notes_parts.append(str(data["notes"]))
    if warnings:
        notes_parts.append("Warnings: " + "; ".join(warnings))

    result = ExtractionResult(
        doctor_name=data.get("doctor_name"),
        patient_name=data.get("patient_name"),
        prescription_date=data.get("prescription_date"),
        diagnosis=data.get("diagnosis"),
        medicines=validated_medicines,
        notes="\n".join(notes_parts) if notes_parts else None,
        confidence_score=confidence,
        rule_engine_warnings=warnings,
    )

    logger.info(
        "Extraction validated — %d medicines, confidence=%.2f",
        len(validated_medicines),
        confidence,
    )
    return result
