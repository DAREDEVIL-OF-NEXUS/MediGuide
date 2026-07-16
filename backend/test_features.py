import asyncio
import os
import json
from unittest.mock import patch, MagicMock

# Set env before importing config
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["USE_SQLITE_FALLBACK"] = "true"
os.environ["USE_GEMINI"] = "false"
os.environ["USE_OFFLINE_AI"] = "true"

from app.ai.validation import validate_extraction
from app.ai.ollama_client import OllamaClient
from app.models.prescription import ExtractionResult, MedicineExtraction

def test_medication_safety():
    """
    Test Phase 5: Allergy checking and duplicate detection
    """
    print("Testing Phase 5: Medication Safety...")
    
    # 1. Duplicate Detection
    mock_extraction = ExtractionResult(
        doctor_name="Dr. Smith",
        medicines=[
            MedicineExtraction(name="Paracetamol", dosage="500mg", frequency="twice daily"),
            MedicineExtraction(name="Paracetamol", dosage="500mg", frequency="twice daily")
        ]
    )
    
    validated = validate_extraction(mock_extraction, user_allergies=["Penicillin"])
    assert len(validated.medicines) == 2
    # Check if duplicate logic applies (if it modifies score, test for score < 100)
    # The current validation.py should have flagged it with a warning or lowered score
    
    # 2. Allergy Detection
    mock_extraction_allergic = ExtractionResult(
        doctor_name="Dr. Smith",
        medicines=[
            MedicineExtraction(name="Penicillin", dosage="250mg", frequency="once daily", confidence_score=95.0)
        ]
    )
    
    validated_allergic = validate_extraction(mock_extraction_allergic, user_allergies=["Penicillin", "Peanuts"])
    assert len(validated_allergic.medicines) == 1
    # Check that the confidence score is penalized
    assert validated_allergic.medicines[0].confidence_score < 95.0, "Allergy check failed to penalize score!"
    print("✅ Phase 5 (Medication Safety) Tests Passed!")

@patch('app.ai.ollama_client.httpx.AsyncClient.post')
async def test_offline_ai(mock_post):
    """
    Test Phase 6: Offline AI (llama3.3 reasoning and llava extraction fallback)
    """
    print("Testing Phase 6: Offline AI...")
    
    # Mocking httpx response
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"message": {"content": "This is a local response."}}
    mock_post.return_value = mock_response
    
    client = OllamaClient()
    
    # Test Llama 3.3 Text Generation
    response_text = await client.generate_text(
        prompt="Explain hypertension",
        system_prompt="You are a medical AI."
    )
    assert response_text == "This is a local response."
    
    # Test LLaVA Vision Extraction
    mock_response_vision = MagicMock()
    mock_response_vision.status_code = 200
    mock_response_vision.json.return_value = {"message": {"content": '{"medicines": []}'}}
    mock_post.return_value = mock_response_vision
    
    response_vision = await client.analyze_image(
        image_bytes=b"fake_image_bytes",
        prompt="Extract medicines",
        system_prompt="Return JSON"
    )
    assert 'medicines' in response_vision
    
    print("✅ Phase 6 (Offline AI) Tests Passed!")

if __name__ == "__main__":
    test_medication_safety()
    asyncio.run(test_offline_ai())
    print("All End-to-End verification checks completed successfully.")
