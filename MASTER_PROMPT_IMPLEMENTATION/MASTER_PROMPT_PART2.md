Complete Technical Architecture & System Design
Architecture Philosophy

MediGuide-AI is NOT an OCR application.

OCR is only one component.

The actual product is an AI-powered Medication Management Platform.

The architecture must always prioritize:

Reliability
Transparency
Human Verification
Explainability
Maintainability
Scalability

The AI assists users.

It never blindly makes medical decisions.

High-Level System Architecture
                React Frontend
                       │
                       ▼
                 FastAPI Backend
                       │
               AI Orchestrator
                       │
      ┌──────────┬───────────┬───────────┐
      ▼          ▼           ▼           ▼
 Image      YOLO Detection  Gemini   Rule Engine
Processing                  Vision
      │          │           │
      └──────────┴───────────┘
               │
       Confidence Engine
               │
               ▼
 Human Verification Layer
               │
               ▼
     Schedule Generator
               │
               ▼
     Reminder Generator
               │
               ▼
        PostgreSQL Database
               │
               ▼
 Dashboard / Medical History / Chat
Low-Level AI Pipeline

The official AI pipeline is:

Prescription Upload

↓

Image Enhancement

↓

YOLO Detection

↓

Crop Individual Regions

↓

Gemini Vision Extraction

↓

Structured JSON

↓

Rule Engine Validation

↓

Confidence Calculation

↓

Human Verification

↓

Workflow State Update

↓

Database Storage

↓

Schedule Generation

↓

Reminder Generation

↓

Dashboard Update

This architecture is now frozen.

Do not bypass any step unless absolutely necessary.

Backend Architecture

Use a layered architecture.

Frontend

↓

API Routes

↓

Service Layer

↓

AI Layer

↓

Validation Layer

↓

Repository Layer

↓

Database

Responsibilities:

API Layer

Only:

Receive requests
Validate inputs
Return responses

Never place business logic here.

Service Layer

Contains:

Prescription logic
Reminder logic
Dashboard logic
Chat logic
AI Layer

Contains:

YOLO
Gemini
Image Processing
Confidence Calculation
Explainable AI
OCR helpers (if needed)
Validation Layer

Contains:

Rule Engine
Duplicate Detection
Confidence Threshold
Human Verification Logic
Repository Layer

Only communicates with PostgreSQL/SQLite.

AI Orchestrator

The frontend should never call Gemini or YOLO directly.

Everything goes through one orchestrator.

Upload

↓

AI Orchestrator

↓

Image Enhancement

↓

YOLO

↓

Gemini

↓

Rule Engine

↓

Confidence Engine

↓

Workflow State

↓

Schedule

↓

Reminder

↓

Database

The AI Orchestrator becomes the heart of the backend.

Provider Interface

The orchestrator should not depend directly on Gemini.

Instead:

Vision Provider

↓

Gemini Provider

or

Future GPT Vision

or

Future Ollama LLaVA

or

Any Vision Model

This allows future migration without changing the rest of the application.

Do NOT implement Ollama yet.

Simply design the architecture to support it later.

Human Verification Philosophy

AI never directly saves extracted data.

Workflow:

Upload

↓

AI Extraction

↓

Editable Form

↓

Human Verification

↓

Submit

↓

Database

Every extracted field must be editable.

Confidence Engine

Calculate confidence per field, not per prescription.

Example:

Field	Confidence
Medicine	96%
Dosage	72%
Timing	98%
Duration	61%

Low-confidence fields should be highlighted.

Confidence Threshold

Fields below the threshold:

Yellow
Red

Require human confirmation.

Fields above threshold can simply be reviewed.

Explainable AI

Every extracted value should know where it came from.

Clicking:

Medicine

↓

Highlights medicine bounding box.

Clicking:

Dosage

↓

Highlights dosage location.

Clicking:

Duration

↓

Highlights duration.

Explainability is a core product feature.

Rule Engine

The Rule Engine runs before human verification.

Examples:

Impossible dosage
Impossible duration
Missing medicine
Missing timing
Duplicate medicines

Flag suspicious results.

Never silently accept them.

Duplicate Medicine Detection

Implement now.

Detect:

Same medicine appearing twice.
Multiple identical entries.

Warn the user before saving.

Workflow State

Every prescription must have a workflow state.

Example:

UPLOADED

↓

PREPROCESSING

↓

YOLO_PROCESSING

↓

GEMINI_EXTRACTION

↓

RULE_ENGINE_VALIDATION

↓

WAITING_FOR_USER_VERIFICATION

↓

VERIFIED

↓

SCHEDULE_GENERATED

↓

REMINDERS_ACTIVE

↓

COMPLETED

The dashboard should use this workflow state to show progress.

Reminder Architecture

Current implementation priority:

Priority 1

Local Alarm

Prefer Python-based local alarm (e.g., pygame if appropriate).

Priority 2

Email Reminder

Implement free email reminders.

Do NOT implement:

Firebase
SMS
WhatsApp
Push notifications

Those belong to later phases.

Reminder Generation

After user verification:

Prescription

↓

Schedule

↓

Reminder Events

↓

Dashboard

↓

History

Everything should happen automatically.

Database Strategy

Primary

PostgreSQL

Fallback

SQLite

SQLite should only be used when PostgreSQL is unavailable.

Environment Variables

Never hardcode anything.

Everything belongs inside:

.env

Also maintain:

.env.example

Include configuration for:

Gemini
Database
JWT
Email
Storage
Future AI providers
Feature Flags

Implement feature flags.

Example:

USE_GEMINI=true
USE_YOLO=true
USE_RULE_ENGINE=true
USE_EXPLAINABLE_AI=true
USE_EMAIL_REMINDERS=true
USE_LOCAL_ALARM=true

The system should support enabling/disabling features without code changes.

Logging

Log:

AI failures
YOLO failures
Gemini failures
Confidence scores
User corrections
Rule Engine flags
Reminder failures

Avoid logging sensitive patient information where possible.

Error Handling

Implement graceful handling for:

Unreadable image

↓

Ask user to upload a clearer image.

YOLO failure

↓

Fallback to Gemini full-image extraction.

Gemini failure

↓

Retry.

No medicines detected

↓

Ask user to confirm.

Database unavailable

↓

Use SQLite fallback.

Security

Implement:

JWT Authentication
Password Hashing
Environment Variables
Secure API Design

Keep security practical for the hackathon.

Scalability Principles

Every module must be replaceable.

Future changes should require minimal modifications.

Examples:

Gemini

↓

GPT Vision

YOLO

↓

YOLOv12

Reminder Service

↓

Firebase

Database

↓

Cloud SQL

without changing business logic.

Official Product Philosophy

MediGuide-AI should never behave like:

"AI knows everything."

Instead:

"AI extracts information, explains itself, asks for confirmation when uncertain, and always keeps the human in control."

This philosophy is mandatory throughout the codebase.

End of Part 2

This part freezes the technical architecture, backend design, AI pipeline, workflow state, orchestrator, rule engine, confidence engine, feature flags, and system engineering principles.

Part 3 will define the complete phased implementation roadmap, including every feature, every page, MVP priorities, deferred features, and implementation order.