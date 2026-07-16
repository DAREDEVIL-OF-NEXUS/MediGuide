from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List
from app.services.meditriage_service import meditriage_service

router = APIRouter(prefix="/meditriage", tags=["meditriage"])

class PredictionRequest(BaseModel):
    symptoms: List[str]

class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    severity: str
    explanation: str

@router.get("/symptoms", response_model=List[str])
async def get_symptoms():
    """Retrieve all available symptoms for the frontend dropdown."""
    return meditriage_service.get_all_symptoms()

@router.post("/predict", response_model=PredictionResponse)
async def predict_disease(request: PredictionRequest):
    """Predict disease based on symptoms and provide AI explanation."""
    if not request.symptoms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Symptoms list cannot be empty."
        )
    
    try:
        result = await meditriage_service.predict(request.symptoms)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
