"""
OpenFDA API Client.

Fetches real medical data for drugs using the OpenFDA Drug Label API.
"""

from __future__ import annotations

import logging
import urllib.parse
from typing import Dict, Any, Optional
import httpx

from app.config import settings

logger = logging.getLogger(__name__)

class OpenFDAService:
    """Client for the OpenFDA Drug Label API."""
    
    BASE_URL = "https://api.fda.gov/drug/label.json"

    def __init__(self):
        self.api_key = getattr(settings, "openfda_api_key", None)
        self.client = httpx.AsyncClient(timeout=10.0)

    async def fetch_drug_data(self, medicine_name: str) -> Optional[Dict[str, Any]]:
        """Fetch and parse drug data from OpenFDA by brand or generic name."""
        if not getattr(settings, "use_real_medicine_database", True):
            return None

        # Clean up medicine name for searching
        query_name = urllib.parse.quote(medicine_name.strip().lower())
        
        # Search by generic name or brand name
        search_query = f'(openfda.generic_name:"{query_name}"+openfda.brand_name:"{query_name}")'
        url = f"{self.BASE_URL}?search={search_query}&limit=1"
        
        if self.api_key:
            url += f"&api_key={self.api_key}"

        try:
            response = await self.client.get(url)
            if response.status_code == 404:
                logger.info("OpenFDA: No data found for %s", medicine_name)
                return None
                
            response.raise_for_status()
            data = response.json()
            
            if not data.get("results"):
                return None
                
            return self._parse_label_data(data["results"][0], medicine_name)
            
        except httpx.RequestError as exc:
            logger.error("OpenFDA request failed for %s: %s", medicine_name, exc)
            return None
        except Exception as exc:
            logger.error("Error parsing OpenFDA data for %s: %s", medicine_name, exc)
            return None

    def _parse_label_data(self, result: Dict[str, Any], original_name: str) -> Dict[str, Any]:
        """Extract relevant fields from the raw OpenFDA label result."""
        openfda = result.get("openfda", {})
        
        # Extract basic info
        generic_name = openfda.get("generic_name", [original_name])[0].title()
        brand_names = openfda.get("brand_name", [])
        category = openfda.get("pharm_class_epc", ["Unknown Category"])[0]
        
        # Extract clinical texts (OpenFDA returns arrays of strings)
        description = self._get_first_text(result, ["description", "indications_and_usage"])
        side_effects = self._get_list(result, "adverse_reactions")
        interactions = self._get_list(result, "drug_interactions")
        contraindications = self._get_list(result, "contraindications")
        warnings = self._get_list(result, "warnings")
        usage_instructions = self._get_first_text(result, ["dosage_and_administration", "instructions_for_use"])
        storage = self._get_first_text(result, ["storage_and_handling"])
        pregnancy_category = self._get_first_text(result, ["pregnancy"])
        
        return {
            "name": original_name,
            "generic_name": generic_name,
            "brand_names": brand_names,
            "category": category,
            "description": description,
            "side_effects": side_effects,
            "interactions": interactions,
            "contraindications": contraindications,
            "warnings": warnings,
            "usage_instructions": usage_instructions,
            "storage": storage,
            "pregnancy_category": pregnancy_category,
            "source": "OpenFDA"
        }

    def _get_first_text(self, result: Dict[str, Any], keys: list[str]) -> str:
        """Find the first matching key and return its first paragraph."""
        for key in keys:
            val = result.get(key)
            if val and isinstance(val, list) and len(val) > 0:
                return val[0]
        return ""
        
    def _get_list(self, result: Dict[str, Any], key: str) -> list[str]:
        """Extract a field as a list of strings, splitting by newlines if necessary."""
        val = result.get(key)
        if not val:
            return []
        if isinstance(val, list):
            # Often OpenFDA returns one massive string inside a list. Let's split it nicely.
            text = val[0]
            # Split by common bullets or newlines
            lines = [line.strip() for line in text.replace("•", "\n").split("\n") if line.strip()]
            # Return first 10 items to avoid blowing up DB
            return lines[:10]
        return []
