I am onboarding onto an existing project and I want you to act as a Senior Staff Software Engineer, AI Architect, Principal Backend Engineer, Principal Frontend Engineer, DevOps Engineer, Product Architect, AI Research Engineer, and Technical Auditor.

IMPORTANT RULES

• Do NOT modify any code.
• Do NOT create, edit, or delete any files.
• Do NOT generate any documentation artifacts, markdown files, diagrams, reports, or README updates.
• Return EVERYTHING only in this chat.
• Perform a READ-ONLY audit of the repository.
• Do NOT assume functionality from filenames, folder names, comments, or README files.
• Never guess.
• Every statement must be backed by actual code inspection.
• If something is not implemented, explicitly say it is not implemented.
• If something appears partially implemented, clearly state what is complete and what is missing.
• If uncertain, inspect deeper before answering.

--------------------------------------------------

STEP 1 — Clone / Sync Repository

Repository:

https://github.com/Rishabhgoyal06/mediguide-ai

I am already a contributor to this repository.

First:

• Pull/download the complete latest repository into my current working directory.
• Fetch all remote branches.
• Fetch all tags.
• Fetch complete git history.

After syncing, begin the audit.

--------------------------------------------------

STEP 2 — Git Repository Audit

Inspect Git completely.

Tell me:

• Current checked-out branch
• Default branch
• Every remote branch
• Local branches
• Which branches are ahead
• Which are behind
• Number of commits ahead/behind
• Recent commits
• Major development history
• Active contributors
• Merge history
• Long-running branches
• Unmerged work
• Stale branches
• Release tags (if any)

Do not summarize only.

Inspect everything.

--------------------------------------------------

STEP 3 — High Level Project Audit

Deeply inspect the actual codebase.

Do NOT judge based on filenames.

Figure out:

• What this project actually does
• Product goal
• Current implementation state
• Major modules
• Current architecture
• Current technology stack
• Build system
• Runtime
• Dependencies
• AI components
• APIs used
• External services
• Databases
• Authentication
• Storage
• Notification systems
• Third-party integrations

--------------------------------------------------

STEP 4 — Backend Audit

Inspect every backend file.

Tell me:

• Framework
• Folder structure
• API architecture
• Route organization
• Middleware
• Authentication
• Database layer
• Models
• Schemas
• Services
• Utilities
• Background tasks
• Exception handling
• Logging
• Configuration
• Environment variables
• Secrets expected
• API keys required
• AI integrations
• LLM integrations
• Vision APIs
• OCR usage
• Scheduler
• Notification service

Then inspect every API endpoint.

For every endpoint explain:

• Route
• Method
• Purpose
• Request body
• Response
• Current implementation status
• Which frontend calls it
• Which database tables it touches
• Which AI models it invokes

--------------------------------------------------

STEP 5 — Frontend Audit

Inspect every frontend component.

Determine:

• Framework
• Routing
• State management
• Folder organization
• UI architecture

Then inspect every page.

For every page explain:

• Purpose
• Current UI
• Components
• User flow
• API calls
• Missing functionality
• Broken functionality
• Placeholder components
• Completed functionality

Inspect:

• Dashboard
• Login
• Signup
• Upload
• Prescription viewer
• Medicine timeline
• Reminder pages
• Settings
• Profile
• History
• Analytics

Only mention pages that actually exist.

--------------------------------------------------

STEP 6 — AI Audit

Inspect all AI code.

Determine:

• AI architecture
• Models used
• APIs used
• Prompt engineering
• Vision models
• OCR
• YOLO
• OpenCV
• Embedding models
• Vector databases
• RAG
• LangGraph
• LangChain
• Agents
• Multi-agent systems
• Graph structures
• Workflows
• Confidence scoring
• Validation layers

If any of these are absent, explicitly say so.

Do not assume.

--------------------------------------------------

STEP 7 — Agent Audit

Inspect whether the project contains:

• AI agents
• Tool calling
• LangGraph
• CrewAI
• AutoGen
• MCP
• Agent workflows
• State machines
• Orchestration
• Prompt templates
• System prompts

Explain exactly how they work.

--------------------------------------------------

STEP 8 — Database Audit

Inspect the entire persistence layer.

Tell me:

• Database engine
• ORM
• Models
• Relationships
• Constraints
• Current schema
• Missing schema
• Migration system
• Indexes
• Foreign keys

Explain the database design.

--------------------------------------------------

STEP 9 — Architecture Audit

Reverse engineer the project.

Explain:

• High-level architecture
• Medium-level architecture
• Low-level architecture
• Data flow
• Request flow
• AI flow
• Backend flow
• Frontend flow
• Database flow

Again:

Return everything only in chat.

Do NOT generate images.

Do NOT create markdown files.

Just explain.

--------------------------------------------------

STEP 10 — Feature Audit

Inspect the actual implementation.

Categorize features into:

Implemented

Partially Implemented

Stubbed

Not Implemented

For every feature explain why you categorized it that way.

--------------------------------------------------

STEP 11 — Code Quality Audit

Review:

• Code organization
• Design patterns
• SOLID principles
• Modularity
• Scalability
• Maintainability
• Security
• Performance
• Technical debt
• Code smells
• Duplicate logic
• Missing abstractions

--------------------------------------------------

STEP 12 — API Keys & Environment Audit

Inspect every environment variable.

Explain:

• Which variables exist
• What each variable is used for
• Which services depend on it

Never expose secret values.

Only explain purpose.

--------------------------------------------------

STEP 13 — Final Technical Summary

Finally provide a comprehensive onboarding summary covering:

• What has already been built
• What is production-ready
• What is incomplete
• Current strengths
• Current weaknesses
• Architectural decisions already made
• Technical debt
• Risks
• Next logical engineering milestones

This summary should be detailed enough that a new senior engineer can understand the project without reading the code first.

Again:

DO NOT CREATE ANY ARTIFACTS.

DO NOT MODIFY CODE.

DO NOT GENERATE DOCUMENTATION FILES.

DO NOT GUESS.

VERIFY EVERYTHING FROM THE ACTUAL SOURCE CODE.

Return everything ONLY in this chat.