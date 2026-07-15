MASTER PROMPT — PHASE 5
Real Medical Knowledge Base + RAG + Intelligent Chatbot

You have already completed Phases 1–4.

Do NOT modify those implementations unless necessary for compatibility.

Your task is to complete Phase 5 exactly according to this roadmap.

This phase focuses on replacing all fake/generated medical knowledge with a real medical knowledge base, implementing a proper RAG pipeline, and upgrading the chatbot into a trustworthy medical assistant.

IMPORTANT RULES

Do NOT fake any implementation.

If a feature requires

downloading a dataset
obtaining an API key
downloading a model
manual configuration

STOP immediately.

Explain exactly what is required.

Wait for my approval before continuing.

Never silently replace a missing dependency with dummy data.

GOAL OF THIS PHASE

Replace every LLM-generated medicine fact with information retrieved from a real medical knowledge source.

Currently the Medicine table contains Gemini-generated information.

This is NOT acceptable.

We want a genuine Retrieval-Augmented Generation architecture.

PHASE 5 TASKS
Task 1 — Audit Existing Medicine Pipeline

First audit:

Medicine model
Medicine table
MedicationIntelligenceService
AssistantService
MedicineLibrary
Chatbot pipeline

Determine:

Where medicine data currently comes from.

What is AI-generated.

What is SQL.

What is cached.

What is hallucinated.

Give me a short report.

Only then continue.

Task 2 — Choose Free Medical Knowledge Source

Research and compare free datasets.

Evaluate:

OpenFDA

RxNorm

DailyMed

DrugBank Free

NIH resources

UMLS (only if completely free)

Compare them for

coverage

API availability

offline download

license

medical reliability

ease of integration

Choose the best option for this project.

Do NOT choose a paid service.

Explain WHY.

Task 3 — Tell Me Exactly What I Need

If a dataset must be downloaded,

STOP.

Give me

Step 1

Step 2

Step 3

exactly.

Example:

Download from

official website

Extract

Move folder here

Run this command

Expected folder structure

Expected file size

Everything.

Do NOT continue until I provide it.

Task 4 — Design Proper Medicine Database

Redesign the Medicine schema.

Current schema is insufficient.

Need support for:

Medicine Name

Generic Name

Brand Name

Strength

Dosage Forms

Route

Description

Common Uses

Side Effects

Contraindications

Drug Interactions

Warnings

Pregnancy

Storage

Manufacturer (if available)

Source

Last Updated

Confidence

Source URL

Medical Reference

Everything should originate from the real dataset.

NOT Gemini.

Task 5 — Import Pipeline

Build an import pipeline.

Requirements:

Dataset

↓

Parser

↓

Cleaner

↓

Validator

↓

Database

↓

Indexed

↓

Ready for retrieval

Everything should be reusable.

Task 6 — Implement Proper RAG

Current chatbot is NOT RAG.

Replace it.

Architecture should become

User Question

↓

Embedding

↓

Retriever

↓

Vector Search

↓

Relevant Medicine Documents

↓

Gemini

↓

Answer

Use a lightweight free vector database.

Choose whichever integrates best.

Examples

FAISS

Chroma

Qdrant local

Choose one.

Explain WHY.

Task 7 — Embeddings

Choose free embeddings.

Prefer

Google embeddings

or

Sentence Transformers

Explain the decision.

No paid APIs.

Task 8 — Upgrade Chatbot

Current chatbot only knows

User prescriptions

Gemini knowledge.

Upgrade it.

Chatbot should answer using

Prescription history

Retrieved medicine knowledge

Medical database

Conversation history

The chatbot should explicitly state

"I found this information from..."

where appropriate.

Task 9 — Medicine Library

Upgrade Medicine Library.

Instead of showing Gemini text,

display

real information

from database.

Include

Uses

Warnings

Interactions

Contraindications

Side Effects

Storage

Strength

Everything available.

Task 10 — Drug Validation

Implement:

Medicine exists?

Strength exists?

Dosage exists?

Brand exists?

Unknown medicine?

Flag suspicious medicines.

Never silently accept hallucinated names.

Task 11 — Chat Safety

Add:

Medical disclaimer

Emergency warning

Unknown medicine handling

Unknown dosage handling

Never invent information.

If unavailable,

say

"I couldn't verify this."

Task 12 — Feature Flags

Add feature flags.

.env

.env.example

config.py

Examples

USE_RAG=True

USE_VECTOR_DB=True

USE_DRUG_DATABASE=True

USE_MEDICINE_LIBRARY=True

USE_EMBEDDINGS=True

USE_FAISS=True

Everything configurable.

USER ACTION REQUIRED

Whenever manual work is required,

STOP.

Give me

exact commands

exact download links

exact folder

exact filenames

exact API key location

exact .env variables

Example

Download dataset from:

Official URL:

Expected size:

Extract here:

Run:

python scripts/import_dataset.py

Add to .env

GOOGLE_API_KEY=

VECTOR_DB_PATH=

MEDICINE_DATASET_PATH=

Everything.

Nothing assumed.

VERIFICATION

After completion I should be able to:

✅ Search medicine

✅ Ask chatbot about medicine

✅ Chatbot retrieves information

✅ Medicine Library uses database

✅ Unknown medicines are flagged

✅ Drug validation works

✅ No Gemini hallucinated medicine facts

COMPLETION REPORT

At the end provide:

1. What was implemented

Files changed

Architecture changes

Database changes

AI changes

2. User Action Required

Exactly what I must download

Where

Why

Commands

API keys

Folder locations

.env variables

Everything.

3. Verification Checklist

Step-by-step tests.

4. Remaining Work

List what belongs to Phase 6.

Do not begin Phase 6 automatically.

Wait for my approval before continuing.