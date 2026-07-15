MASTER PROMPT — PART 3/4
Complete Implementation Roadmap (Priority-Based)
IMPORTANT IMPLEMENTATION RULES

Do NOT randomly implement features.

Implement strictly phase by phase.

Never skip phases.

Never start a later phase before the previous phase is complete and stable.

At the end of every phase:

Verify all features.
Ensure nothing is broken.
Update the project state.
Summarize completed work.
List remaining tasks.
Wait for approval before moving forward.
PHASE 0 — Repository Audit & Gap Analysis (MANDATORY)

No implementation in this phase.

Tasks:

Deeply inspect the entire repository.
Understand the architecture.
Read actual implementations.
Do not judge based on filenames.
Compare the current project against this roadmap.

Deliverables:

Existing Features
Missing Features
Partially Implemented Features
Bugs
Technical Debt
AI Pipeline Status
Frontend Status
Backend Status
Database Status
API Status
Current Workflow
YOLO Status
Chatbot Status

Mandatory Questions:

YOLO

Explain:

Dataset
Training pipeline
Classes
Metrics
Reproducibility
Chatbot

Explain:

Architecture
Prompting
Memory
Context
Tools
Function Calling
Current limitations

Do not implement anything.

PHASE 1 — Complete MVP & UI Foundation (Highest Priority)

Goal:

Build a polished healthcare application.

Pages

Implement:

Homepage (Landing Page)
About Page (includes Contact section)
Architecture Page (includes "How It Works")

Do NOT create:

FAQ
Privacy Policy
Terms
Separate Contact Page
Homepage

Include:

Hero Section
Problem Statement
Solution
Features
Screenshots
CTA
About Page

Include:

Vision
Mission
Problem Statement
Team
Contact
Architecture Page

Must contain:

High-Level Architecture Diagram
Low-Level Architecture Diagram

Explain:

Why YOLO
Why Gemini
Why Hybrid AI
Why Human Verification
AI Pipeline
Dashboard

Polish the existing dashboard.

Include:

Welcome Card
Today's Medicines
Upcoming Reminder
Missed Medicines
Recent Prescriptions
AI Assistant Shortcut
Medical History
Upload Prescription Button

Dashboard should feel like a real healthcare application.

Upload Experience

Improve UX.

Include:

Preview
Crop
Rotate
Brightness Enhancement
Editable Extraction Workflow

Official flow:

Upload

↓

AI Extraction

↓

Editable Form

↓

Confidence Scores

↓

Human Verification

↓

Submit

↓

Database

Every field must remain editable.

Explainable AI

When clicking a field:

Medicine

↓

Highlight Medicine Bounding Box

Dosage

↓

Highlight Dosage Region

Timing

↓

Highlight Timing Region

Medicine Detail Page

Only show information already available.

Include:

Medicine Name
Dosage
Timing
Duration
Before/After Food
Progress

Do NOT depend on Drug Database.

Medical History

Polish the existing history timeline.

Medicine Detail Integration

Every medicine should include:

Ask AI

Automatically provide:

Medicine
Prescription
Current Schedule

to the chatbot.

No RAG required.

Branding

Keep branding simple but professional.

Healthcare theme.

Professional color palette.

Prescription Status Tracker

Implement:

Uploaded

↓

AI Processing

↓

Waiting for Verification

↓

Schedule Created

↓

Reminder Active

↓

Completed

Connect it to Workflow State.

PHASE 2 — AI Reliability & Production Quality

Goal:

Increase trust.

Confidence Engine

Per-field confidence.

Highlight:

Green

Yellow

Red

Human Verification

Mandatory before saving.

Rule Engine

Implement:

Impossible dosage
Impossible duration
Missing fields
Duplicate medicines
Suspicious frequencies
Duplicate Medicine Detection

Warn user before saving.

Workflow State

Implement:

UPLOADED

↓

PREPROCESSING

↓

YOLO

↓

GEMINI

↓

RULE_ENGINE

↓

WAITING_FOR_VERIFICATION

↓

VERIFIED

↓

SCHEDULE_GENERATED

↓

REMINDERS_ACTIVE

↓

COMPLETED
Error Handling

Implement:

Unreadable Image

↓

Ask for better upload.

YOLO Failure

↓

Gemini Full Image

Gemini Failure

↓

Retry

No Medicines

↓

Ask User

Database Failure

↓

SQLite

Logging

Log:

AI failures
Confidence
User corrections
Rule Engine flags
Reminder failures
Security

Implement:

JWT
Password Hashing
Environment Variables
PHASE 3 — Reminder System & Medication Management

Goal:

Medication adherence.

Reminder Engine

Priority 1

Local Alarm

Prefer Python-based local alarm (pygame if appropriate).

Priority 2

Email Reminder

Do not implement:

WhatsApp
SMS
Push Notifications
Firebase
Schedule Generator

Automatically create:

Morning

Afternoon

Evening

Night

Schedules after verification.

Medication Tracking

Allow:

Taken
Missed
Pending

Track progress.

Dashboard Integration

Show:

Next Medicine
Upcoming Reminder
Missed Medicines
Completion Rate
PHASE 4 — Deployment & Final Polish

Only begin when all previous phases are complete.

Deployment

Deploy:

Frontend

Backend

Database

Environment Variables

Verify production build.

Final Testing

Test:

Upload
Extraction
Human Verification
Dashboard
Reminder
History
AI Chat
Basic Documentation

Create concise documentation for:

Setup
Environment Variables
Running the project
Deployment
Demo Preparation

Prepare:

Stable Demo Account
Sample Prescriptions
Demo Script
Backup Demo Plan
PHASE 5 — Advanced Intelligence (ONLY IF TIME REMAINS)

Lowest Priority

Do NOT start this phase unless all previous phases are complete.

Drug Database

Research and integrate:

OpenFDA
RxNorm
DailyMed
Other free sources
Medicine Library

Create searchable medicine knowledge base.

RAG

Only after Drug Database.

Use Vector Database.

Ground chatbot responses.

Drug Validation

Validate:

Medicine exists
Strength valid
Dosage reasonable
Medicine Encyclopedia

Medicine details.

Educational information.

Contraindication Detection

Future feature.

Allergy Detection

Future feature.

Drug Interaction Detection

Future feature.

Offline AI

Only after architecture is stable.

Support:

Ollama
LLaVA
Llama 3.x

Design already supports this through the Provider Interface.

Implement only if time remains.

PHASE COMPLETION REPORT (MANDATORY)

At the end of every phase, generate:

Completed
---------
✅ Features completed

Partially Complete
------------------
🟡 Features still in progress

Pending
-------
❌ Remaining features

Known Bugs
----------
• ...

Architecture Decisions
----------------------
• ...

Current Workflow State
----------------------
• ...

Next Recommended Phase
----------------------
• ...

Do not proceed automatically.

Wait for approval.

Definition of MVP Success

The MVP is successful only if a user can:

Upload a prescription.
AI extracts structured information.
View confidence scores.
Verify or edit extracted fields.
See explainable AI highlights.
Save verified prescription.
Generate medicine schedule.
Receive reminders.
Track medication progress.
View medical history.
Ask AI questions about medicines already present in the prescription.

Only after all of the above work reliably should Phase 5 be considered.

End of Part 3

This completes the implementation roadmap, freezes the feature priorities, and defines the exact order of development. Part 4 will contain the coding standards, project governance, reporting rules, engineering guidelines, and final instructions that every AI agent working on MediGuide-AI must follow.