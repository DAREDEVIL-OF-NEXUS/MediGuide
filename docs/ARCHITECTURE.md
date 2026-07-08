# MediGuide-AI — Architecture Documentation

## System Overview

MediGuide-AI follows a **modular monorepo** architecture with clear separation between frontend, backend, and AI components.

## Core Design Principles

1. **Separation of Concerns**: Each module (auth, prescriptions, AI, scheduling) is self-contained
2. **Service Layer Pattern**: Routers → Services → Models (no business logic in routers)
3. **Async-First**: All I/O operations use async/await for concurrency
4. **Schema Validation**: Pydantic schemas validate all input/output at API boundaries
5. **Environment-Driven Config**: Zero hardcoded secrets or configuration

## Backend Architecture

```
Request → Router → Service → Model/AI → Database
                      ↓
                  Validation (Pydantic)
```

### Layers
- **Routers**: HTTP endpoint definitions, request parsing, response formatting
- **Services**: Business logic, orchestration, transaction management
- **Models**: SQLAlchemy ORM models, database schema
- **Core**: Cross-cutting concerns (auth, logging, exceptions)
- **AI**: ML pipeline components (preprocessing, extraction, validation)

## AI Pipeline Architecture

```
Raw Image
  ↓
[OpenCV Preprocessing]
  ├── Grayscale conversion
  ├── Adaptive thresholding
  ├── Noise removal
  ├── Deskew correction
  └── Contrast enhancement (CLAHE)
  ↓
[YOLO Layout Detection] (Phase 2)
  ├── Doctor info region
  ├── Patient info region
  ├── Medicine block region
  ├── Date region
  └── Diagnosis region
  ↓
[Gemini Vision Extraction]
  ├── Structured prompt with JSON schema
  ├── Few-shot examples
  └── Confidence scoring
  ↓
[Validation Layer]
  ├── Required field checks
  ├── Dosage range validation
  ├── Medicine name normalization
  └── Drug interaction flags
  ↓
[Medication Intelligence Engine] (Phase 2)
  ├── Plain-language drug explanations
  ├── Side effects & interactions
  └── Dosage schedule generation
```

## Database Design Philosophy

- **UUID primary keys**: Prevent enumeration attacks, safe for distributed systems
- **Shared medicine knowledge base**: Grows organically from prescriptions
- **JSON fields for semi-structured data**: Allergies, side effects, interactions
- **Soft relationships**: medicine_name stored alongside medicine_id (FK) for resilience
- **Audit timestamps**: created_at/updated_at on all tables

## Security Architecture

- JWT access tokens (15min) + refresh tokens (7 days)
- bcrypt password hashing (12+ salt rounds)
- Row-level security (users can only access their own data)
- Rate limiting on auth endpoints
- File upload validation (MIME type, size limits)
- CORS whitelist
- SQL injection prevention via ORM
