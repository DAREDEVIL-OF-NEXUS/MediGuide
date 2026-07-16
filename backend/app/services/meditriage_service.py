import pandas as pd
import os
import logging
from app.ai.meditriage.model import meditriage_engine
from app.config import settings
from google import genai
from google.genai import types
from app.ai.ollama_client import ollama_client

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
        result = {}
        used_fallback = False
        
        try:
            result = meditriage_engine.predict(symptoms)
            # If confidence is below 40%, we consider it a low-confidence prediction and trigger fallback
            if result.get("confidence", 0) < 40.0 and self._client:
                used_fallback = True
        except Exception as e:
            logger.warning(f"Local ML Prediction failed: {e}. Falling back to Gemini.")
            used_fallback = True
            
        # Gemini/Ollama Fallback for Prediction
        if used_fallback and (self._client or settings.use_offline_ai):
            try:
                logger.info("Using AI fallback for disease prediction.")
                fallback_prompt = f"A patient has the following symptoms: {', '.join(symptoms)}. Based on medical knowledge, what is the single most likely disease? Reply with ONLY the disease name, nothing else."
                
                if settings.use_offline_ai:
                    response_text = await ollama_client.generate_text(
                        model="llama3.3",
                        prompt=fallback_prompt
                    )
                else:
                    fallback_response = self._client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=[types.Part.from_text(text=fallback_prompt)],
                        config=types.GenerateContentConfig(temperature=0.1, max_output_tokens=20),
                    )
                    response_text = fallback_response.text
                
                disease_name = response_text.strip().replace('.', '')
                result = {
                    "prediction": disease_name,
                    "confidence": 85.0, # Approximate high confidence for LLM fallback
                    "severity": meditriage_engine.determine_severity(symptoms, 85.0),
                    "is_fallback": True
                }
            except Exception as gemini_e:
                logger.error(f"Gemini fallback also failed: {gemini_e}")
                if not result:
                    raise Exception("Both Local ML and Gemini fallback failed.")
                
        disease = result.get("prediction", "Unknown")
        confidence = result.get("confidence", 0.0)
        severity = result.get("severity", "Unknown")

        explanation = "Explainability is currently unavailable."
        
        # Add Explainability
        if self._client or settings.use_offline_ai:
            try:
                prompt = f"""
                A patient has reported the following symptoms: {', '.join(symptoms)}.
                The predicted disease is: {disease} with a confidence of {confidence}%.
                The severity has been classified as: {severity}.
                
                As a medical AI assistant, provide a short, patient-friendly explanation of why these symptoms align with this disease. 
                Keep it under 3 sentences. Do not diagnose the patient, just explain the correlation.
                """
                
                if settings.use_offline_ai:
                    response_text = await ollama_client.generate_text(
                        model="llama3.3",
                        prompt=prompt
                    )
                else:
                    response = self._client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=[types.Part.from_text(text=prompt)],
                        config=types.GenerateContentConfig(
                            temperature=0.3,
                            max_output_tokens=150,
                        ),
                    )
                    response_text = response.text
                explanation = response_text.strip()
            except Exception as e:
                logger.error(f"AI explainability failed: {e}")

        result["explanation"] = explanation
        return result

meditriage_service = MediTriageService()
