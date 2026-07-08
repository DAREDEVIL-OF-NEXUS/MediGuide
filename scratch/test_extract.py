import os
import sys
from dotenv import load_dotenv

# Load env variables from backend/.env
load_dotenv(dotenv_path="backend/.env")

from google import genai
from google.genai import types

# Add backend folder to path
sys.path.append("backend")
from app.ai.prompts import PRESCRIPTION_EXTRACTION_PROMPT

key = os.getenv("GEMINI_API_KEY")
print("Using API key:", key[:10] + "..." if key else "None")

client = genai.Client(api_key=key)

# Read the uploaded image
image_path = "backend/app/static/uploads/b9054805-6914-4039-b6d6-7880b8655bf8_20260708162647_114b4b74.jpeg"
with open(image_path, "rb") as f:
    image_bytes = f.read()

print("Sending request to gemini-2.5-flash...")
try:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Content(
                role="user",
                parts=[
                    types.Part.from_bytes(
                        data=image_bytes,
                        mime_type="image/jpeg",
                    ),
                    types.Part.from_text(
                        text=PRESCRIPTION_EXTRACTION_PROMPT
                    ),
                ],
            )
        ],
        config=types.GenerateContentConfig(
            temperature=0.1,
            max_output_tokens=4096,
            response_mime_type="application/json",
        ),
    )
    print("----- Raw Output -----")
    print(response.text)
    print("----------------------")
except Exception as e:
    print("Error:", e)
