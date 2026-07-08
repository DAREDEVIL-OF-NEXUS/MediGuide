"""
Gemini Vision Extraction Benchmarking Script.
Evaluates accuracy on the test split of the medical-prescription-dataset.
"""

import os
import re
import json
import time
import argparse
from typing import Dict, Any, List
from google import genai
from google.genai import types

# Define Paths
DEFAULT_DATASET_ROOT = r"C:\Users\Rishabh Goyal\medical-prescription-dataset"
DEFAULT_TEST_LIMIT = 10  # Default to 10 images for cost/time safety

# Extraction prompt matching the backend pipeline
EXTRACTION_PROMPT = """You are an expert medical OCR agent. Extract all information from this prescription image into a structured JSON.
You must return a valid JSON object matching the schema below:

{
  "doctor_info": {
    "name": "string (without Dr. prefix)",
    "specialty": "string or null"
  },
  "clinic_info": {
    "name": "string",
    "address": "string or null",
    "phone": "string or null"
  },
  "patient_info": {
    "name": "string",
    "age": "integer or null",
    "gender": "string or null"
  },
  "prescription_date": "YYYY-MM-DD or null",
  "medicines": [
    {
      "medicine_name": "string (brand or generic)",
      "dosage": "string (e.g. 500mg, 1 tab)",
      "frequency": "string (e.g. twice daily, 1-0-1)",
      "timing": "string (e.g. before food, at bedtime) or null",
      "duration_days": "integer or null",
      "special_instructions": "string or null"
    }
  ]
}

Ensure the response contains ONLY the valid JSON, no markdown formatting.
"""

def parse_ground_truth(gt_str: str) -> Dict[str, Any]:
    """Parse flat OCR ground truth string into structured fields."""
    data = {}
    
    # Flat field regexes
    fields = ['doctor_name', 'clinic_name', 'clinic_address', 'patient_name', 'patient_age', 'date', 'signature']
    for field in fields:
        # Match from field name up to the next field name or end delimiter
        pattern = f"{field}:\\s*(.*?)\\s*(?:clinic_name:|clinic_address:|patient_name:|patient_age:|date:|medications:|signature:|</s>)"
        match = re.search(pattern, gt_str)
        if match:
            data[field] = match.group(1).strip()
        else:
            data[field] = ""
            
    # Parse medications
    meds = []
    meds_match = re.search(r"medications:\s*(.*?)\s*(?:signature:|</s>)", gt_str)
    if meds_match:
        meds_section = meds_match.group(1).strip()
        # Find all lines starting with "- "
        med_lines = re.findall(r"-\s*([^-]+)", meds_section)
        # In this dataset, each med is: line 1 = Name Dose, line 2 = Instructions
        # e.g., "Ibuprofen 5 mg" and "Take twice daily"
        for i in range(0, len(med_lines), 2):
            if i + 1 < len(med_lines):
                name_dose = med_lines[i].strip()
                instructions = med_lines[i+1].strip()
            else:
                name_dose = med_lines[i].strip()
                instructions = ""
            
            # Separate name and dose (e.g., "Ibuprofen 5 mg" -> "Ibuprofen", "5 mg")
            parts = name_dose.split()
            if len(parts) > 1 and parts[-1].lower() in ['mg', 'g', 'mcg', 'ml'] and len(parts) > 2:
                # e.g. ["Ibuprofen", "5", "mg"]
                dosage = " ".join(parts[-2:])
                med_name = " ".join(parts[:-2])
            elif len(parts) > 1:
                # e.g. ["Ibuprofen", "5mg"]
                dosage = parts[-1]
                med_name = " ".join(parts[:-1])
            else:
                dosage = ""
                med_name = name_dose
                
            meds.append({
                "medicine_name": med_name,
                "dosage": dosage,
                "special_instructions": instructions
            })
            
    data["medications"] = meds
    return data

def run_benchmark(dataset_root: str, limit: int, api_key: str):
    print(f"=== Starting Gemini Vision Benchmark (Sample Size: {limit}) ===")
    
    test_images_dir = os.path.join(dataset_root, "test", "images")
    test_ann_dir = os.path.join(dataset_root, "test", "annotations")
    
    if not os.path.exists(test_images_dir) or not os.path.exists(test_ann_dir):
        print(f"Error: Dataset split directories not found under {dataset_root}")
        return
        
    image_files = sorted([f for f in os.listdir(test_images_dir) if f.lower().endswith(".png")])[:limit]
    
    client = genai.Client(api_key=api_key)
    results = []
    
    # Evaluation metrics
    total_samples = len(image_files)
    correct_doctors = 0
    correct_clinics = 0
    correct_patients = 0
    correct_dates = 0
    total_medications = 0
    correct_medications = 0
    
    for idx, img_name in enumerate(image_files):
        base_name = os.path.splitext(img_name)[0]
        img_path = os.path.join(test_images_dir, img_name)
        ann_path = os.path.join(test_ann_dir, base_name + ".json")
        
        print(f"[{idx+1}/{total_samples}] Evaluating {img_name}...")
        
        # Load ground truth
        with open(ann_path, "r", encoding="utf-8") as f:
            ann_data = json.load(f)
        gt = parse_ground_truth(ann_data["ground_truth"])
        
        # Load image bytes
        with open(img_path, "rb") as f:
            img_bytes = f.read()
            
        # Run extraction
        try:
            start_time = time.time()
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[
                    types.Content(
                        role="user",
                        parts=[
                            types.Part.from_bytes(data=img_bytes, mime_type="image/jpeg"),
                            types.Part.from_text(text=EXTRACTION_PROMPT),
                        ],
                    )
                ],
                config=types.GenerateContentConfig(
                    temperature=0.0,
                    response_mime_type="application/json",
                ),
            )
            elapsed = time.time() - start_time
            
            # Parse response
            raw_text = response.text or ""
            # Handle markdown code blocks
            if raw_text.strip().startswith("```"):
                lines = raw_text.strip().split("\n")
                lines = [line for line in lines if not line.strip().startswith("```")]
                raw_text = "\n".join(lines).strip()
                
            extracted = json.loads(raw_text)
            
            # Perform comparisons
            # 1. Doctor info (normalized prefix check)
            gt_doc = gt.get("doctor_name", "").replace("Dr.", "").strip().lower()
            ex_doc = extracted.get("doctor_info", {}).get("name", "").strip().lower()
            doc_ok = gt_doc == ex_doc
            if doc_ok: correct_doctors += 1
            
            # 2. Clinic Name
            gt_clinic = gt.get("clinic_name", "").strip().lower()
            ex_clinic = extracted.get("clinic_info", {}).get("name", "").strip().lower()
            clinic_ok = gt_clinic == ex_clinic
            if clinic_ok: correct_clinics += 1
            
            # 3. Patient Name
            gt_patient = gt.get("patient_name", "").strip().lower()
            ex_patient = extracted.get("patient_info", {}).get("name", "").strip().lower()
            patient_ok = gt_patient == ex_patient
            if patient_ok: correct_patients += 1
            
            # 4. Date
            gt_date = gt.get("date", "").strip()
            ex_date = extracted.get("prescription_date", "").strip()
            date_ok = gt_date == ex_date
            if date_ok: correct_dates += 1
            
            # 5. Medications
            gt_meds = gt.get("medications", [])
            ex_meds = extracted.get("medicines", [])
            
            meds_eval = []
            for g_med in gt_meds:
                total_medications += 1
                g_name = g_med.get("medicine_name", "").strip().lower()
                
                # Check if it was extracted
                found = False
                for e_med in ex_meds:
                    e_name = e_med.get("medicine_name", "").strip().lower()
                    if g_name == e_name:
                        found = True
                        correct_medications += 1
                        break
                meds_eval.append({"gt_name": g_name, "found": found})
                
            results.append({
                "image": img_name,
                "time_taken_sec": round(elapsed, 2),
                "doctor": {"gt": gt.get("doctor_name"), "extracted": extracted.get("doctor_info", {}).get("name"), "ok": doc_ok},
                "clinic": {"gt": gt.get("clinic_name"), "extracted": extracted.get("clinic_info", {}).get("name"), "ok": clinic_ok},
                "patient": {"gt": gt.get("patient_name"), "extracted": extracted.get("patient_info", {}).get("name"), "ok": patient_ok},
                "date": {"gt": gt.get("date"), "extracted": extracted.get("prescription_date"), "ok": date_ok},
                "meds_evaluation": meds_eval
            })
            
        except Exception as e:
            print(f"Failed to process {img_name}: {e}")
            results.append({
                "image": img_name,
                "error": str(e)
            })
            
    # Calculate accuracy metrics
    doc_acc = (correct_doctors / total_samples) * 100 if total_samples > 0 else 0
    clinic_acc = (correct_clinics / total_samples) * 100 if total_samples > 0 else 0
    patient_acc = (correct_patients / total_samples) * 100 if total_samples > 0 else 0
    date_acc = (correct_dates / total_samples) * 100 if total_samples > 0 else 0
    med_acc = (correct_medications / total_medications) * 100 if total_medications > 0 else 0
    
    summary = {
        "metrics": {
            "evaluated_samples": total_samples,
            "doctor_accuracy_percent": round(doc_acc, 2),
            "clinic_accuracy_percent": round(clinic_acc, 2),
            "patient_accuracy_percent": round(patient_acc, 2),
            "date_accuracy_percent": round(date_acc, 2),
            "medication_extraction_recall_percent": round(med_acc, 2),
        },
        "details": results
    }
    
    # Save output
    output_path = r"C:\Users\Rishabh Goyal\Documents\Mediguide\ai\gemini_benchmark_results.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
        
    print("\n=== Benchmark Summary ===")
    print(f"Doctor Name Accuracy: {doc_acc:.1f}%")
    print(f"Clinic Name Accuracy: {clinic_acc:.1f}%")
    print(f"Patient Name Accuracy: {patient_acc:.1f}%")
    print(f"Prescription Date Accuracy: {date_acc:.1f}%")
    print(f"Medication Extraction Recall: {med_acc:.1f}% ({correct_medications}/{total_medications} items)")
    print(f"Saved detailed results to {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", default=DEFAULT_DATASET_ROOT, help="Dataset root path")
    parser.add_argument("--limit", type=int, default=DEFAULT_TEST_LIMIT, help="Number of samples to evaluate")
    parser.add_argument("--api-key", default=os.getenv("GEMINI_API_KEY", "PLACEHOLDER_KEY_GOES_HERE"), help="Gemini API Key")
    
    args = parser.parse_args()
    
    # Read API key if it's placeholder
    api_key = args.api_key
    if api_key == "PLACEHOLDER_KEY_GOES_HERE":
        # Try loading from local .env
        env_path = r"C:\Users\Rishabh Goyal\Documents\Mediguide\.env"
        if os.path.exists(env_path):
            with open(env_path, "r") as ef:
                for line in ef:
                    if line.startswith("GEMINI_API_KEY="):
                        val = line.split("=", 1)[1].strip()
                        if val and val != "PLACEHOLDER_KEY_GOES_HERE":
                            api_key = val
                            break
                            
    if api_key == "PLACEHOLDER_KEY_GOES_HERE" or not api_key:
        print("Warning: Gemini API Key is not set. The benchmark calls will fail.")
        
    run_benchmark(args.dataset, args.limit, api_key)
