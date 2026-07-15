"""
RAG Service using ChromaDB.

Embeds verified medical information and user prescriptions to provide true Retrieval-Augmented Generation context for the AI Assistant.
"""

from __future__ import annotations

import logging
import os
from typing import List, Dict, Any

from app.config import settings

logger = logging.getLogger(__name__)

class RAGService:
    """Manages Vector embeddings and retrieval using ChromaDB."""
    
    def __init__(self):
        self.enabled = getattr(settings, "use_rag", True)
        self.collection_name = "medicine_knowledge"
        self.client = None
        self.collection = None
        
        if self.enabled:
            try:
                import chromadb
                from chromadb.config import Settings as ChromaSettings
                
                db_path = getattr(settings, "vector_db_path", "./chroma_db")
                os.makedirs(db_path, exist_ok=True)
                
                self.client = chromadb.PersistentClient(path=db_path)
                
                # We use sentence-transformers implicitly via default embedding function
                # Or explicitly load it if required, but chromadb default is all-MiniLM-L6-v2
                from chromadb.utils import embedding_functions
                sentence_transformer_ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
                
                self.collection = self.client.get_or_create_collection(
                    name=self.collection_name,
                    embedding_function=sentence_transformer_ef
                )
                logger.info("ChromaDB RAG Service initialized successfully.")
            except ImportError:
                logger.warning("chromadb or sentence-transformers not installed. RAG is disabled.")
                self.enabled = False
            except Exception as exc:
                logger.error("Failed to initialize ChromaDB: %s", exc)
                self.enabled = False

    async def index_medicine(self, medicine_data: Dict[str, Any]) -> None:
        """Embed and store medicine facts in the vector database."""
        if not self.enabled or not self.collection:
            return
            
        try:
            doc_id = f"med_{medicine_data['name'].lower().replace(' ', '_')}"
            
            # Create a rich text document for embedding
            content = (
                f"Medicine: {medicine_data.get('name')} (Generic: {medicine_data.get('generic_name')})\n"
                f"Category: {medicine_data.get('category')}\n"
                f"Description: {medicine_data.get('description')}\n"
                f"Side Effects: {', '.join(medicine_data.get('side_effects', []))}\n"
                f"Contraindications: {', '.join(medicine_data.get('contraindications', []))}\n"
                f"Warnings: {', '.join(medicine_data.get('warnings', []))}\n"
                f"Interactions: {', '.join(medicine_data.get('interactions', []))}\n"
                f"Usage: {medicine_data.get('usage_instructions')}\n"
            )
            
            self.collection.upsert(
                documents=[content],
                metadatas=[{"name": medicine_data.get('name'), "source": medicine_data.get('source', 'Unknown')}],
                ids=[doc_id]
            )
            logger.info("Indexed %s into vector DB.", medicine_data.get('name'))
        except Exception as exc:
            logger.error("Failed to index medicine %s: %s", medicine_data.get('name'), exc)

    async def search_medical_knowledge(self, query: str, n_results: int = 3) -> str:
        """Retrieve relevant medical context based on the user's query."""
        if not self.enabled or not self.collection:
            return ""
            
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results
            )
            
            if not results["documents"] or not results["documents"][0]:
                return ""
                
            context_parts = []
            for i, doc in enumerate(results["documents"][0]):
                meta = results["metadatas"][0][i]
                context_parts.append(f"--- Document Source: {meta.get('source')} ---\n{doc}")
                
            return "\n\n".join(context_parts)
        except Exception as exc:
            logger.error("RAG search failed: %s", exc)
            return ""

# Singleton instance
rag_service = RAGService()
