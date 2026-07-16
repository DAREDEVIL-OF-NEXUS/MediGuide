import os
import joblib
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
FEATURES_PATH = os.path.join(BASE_DIR, "features.pkl")

# Symptoms that require urgent medical attention (From Repo 1)
SERIOUS_SYMPTOMS = [
    "chest_pain",
    "shortness_of_breath",
    "loss_of_consciousness",
    "severe_bleeding"
]

# Symptoms that should be consulted with a doctor (From Repo 1)
MODERATE_SYMPTOMS = [
    "fever",
    "cough",
    "fatigue",
    "headache",
    "vomiting",
    "high_fever"
]

class MediTriageModel:
    def __init__(self):
        self.model = None
        self.feature_names = None
        self._load_model()

    def _load_model(self):
        if not os.path.exists(MODEL_PATH) or not os.path.exists(FEATURES_PATH):
            # Model needs to be trained
            from .train import train_meditriage_model
            train_meditriage_model()

        self.model = joblib.load(MODEL_PATH)
        self.feature_names = joblib.load(FEATURES_PATH)

    def _clean_symptom(self, sym: str) -> str:
        return str(sym).strip().lower().replace(" ", "_")

    def determine_severity(self, symptoms: list, model_confidence: float) -> str:
        """
        Determines severity based on rule-based logic (Repo 1) and model confidence (Repo 2).
        """
        cleaned_symptoms = [self._clean_symptom(s) for s in symptoms]
        
        for symptom in SERIOUS_SYMPTOMS:
            if symptom in cleaned_symptoms:
                return "Visit Hospital"

        for symptom in MODERATE_SYMPTOMS:
            if symptom in cleaned_symptoms:
                return "Consult Doctor"

        if model_confidence >= 80.0:
            return "Consult Doctor" # High confidence in a disease usually warrants at least a checkup

        return "Home Care"

    def predict(self, symptoms: list):
        if not symptoms:
            raise ValueError("No symptoms provided")

        x = np.zeros(len(self.feature_names), dtype=int)
        cleaned = [self._clean_symptom(s) for s in symptoms if str(s).strip()]
        
        for sym in cleaned:
            suffix = "_" + sym
            for i, fname in enumerate(self.feature_names):
                if fname.endswith(suffix):
                    x[i] = 1

        x = x.reshape(1, -1)
        pred = self.model.predict(x)[0]

        if hasattr(self.model, "predict_proba"):
            conf = float(np.max(self.model.predict_proba(x)[0]) * 100.0)
        else:
            conf = 0.0

        severity = self.determine_severity(symptoms, conf)

        return {
            "prediction": str(pred),
            "confidence": round(conf, 2),
            "severity": severity
        }

meditriage_engine = MediTriageModel()
