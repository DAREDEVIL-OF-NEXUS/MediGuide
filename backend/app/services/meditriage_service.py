import pandas as pd
import os
import logging
from app.ai.meditriage.model import meditriage_engine
from app.config import settings
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

class MediTriageService:
    def __init__(self):
        self._all_symptoms = []
        self._load_symptoms()
        # Initialize Gemini Client for explainability
        if settings.gemini_api_key:
            self._client = genai.Client(api_key=settings.gemini_api_key)
        else:
            self._client = None
            logger.warning("Gemini API key not found. Explainability will be limited.")

    def _load_symptoms(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        dataset_path = os.path.join(base_dir, "ai", "meditriage", "dataset.csv")
        try:
            df = pd.read_csv(dataset_path)
            sym_cols = [c for c in df.columns if c.lower().startswith("symptom")]
            s = set()
            for col in sym_cols:
                s.update(df[col].dropna().astype(str).str.strip().str.lower().tolist())
            s.discard("")
            s.discard("nan")
            self._all_symptoms = sorted([x.replace("_", " ") for x in s])
        except Exception as e:
            logger.error(f"Failed to load symptoms from dataset: {e}")
            self._all_symptoms = []

    def get_all_symptoms(self):
        return self._all_symptoms

    async def predict(self, symptoms: list) -> dict:
        # Run local ML prediction
        try:
            result = meditriage_engine.predict(symptoms)
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            raise e

        disease = result.get("prediction")
        confidence = result.get("confidence")
        severity = result.get("severity")

        explanation = "Explainability is currently unavailable."
        
        # Add Gemini Explainability
        if self._client:
            try:
                prompt = f"""
                A patient has reported the following symptoms: {', '.join(symptoms)}.
                Our machine learning model has predicted the disease: {disease} with a confidence of {confidence}%.
                The severity has been classified as: {severity}.
                
                As a medical AI assistant, provide a short, patient-friendly explanation of why these symptoms align with this disease. 
                Keep it under 3 sentences. Do not diagnose the patient, just explain the correlation.
                """
                response = self._client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=[types.Part.from_text(text=prompt)],
                    config=types.GenerateContentConfig(
                        temperature=0.3,
                        max_output_tokens=150,
                    ),
                )
                explanation = response.text.strip()
            except Exception as e:
                logger.error(f"Gemini explainability failed: {e}")

        result["explanation"] = explanation
        return result

meditriage_service = MediTriageService()
