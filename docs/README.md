# Documentation Index

**Project**: Study Notes & Flashcard App  
**Last Updated**: 2025-01-27  
**Maintained By**: Librarian Agent

---

## Quick Navigation

- [Agent Coordination Guide](./AGENT_COORDINATION.md) - **Start here for understanding the agent system**
- [Development Setup](./setup/development-environment-guide.md) - How to set up and run the project
- [Architecture Overview](./architecture/system-overview.md) - System design and architecture
- [API Documentation](./api/) - All API endpoint documentation
- [Testing Documentation](./testing/) - Test suites and coverage

---

## Documentation by Category

### 🤖 Agent System Documentation

- **[Agent Coordination Guide](./AGENT_COORDINATION.md)** - Comprehensive guide to the multi-agent system
- [Agent System Design](../AGENT_SYSTEM_DESIGN.md) - Original agent system design document
- [Master Agent System](../agents/MASTER_AGENT_SYSTEM.md) - Master prompt for agent coordination

**Agent Prompts** (in `agents/prompts/`):
- [Senior Developer Agent](../agents/prompts/senior_developer_agent.md)
- [Architect Agent](../agents/prompts/architect_agent.md)
- [Frontend Agent](../agents/prompts/frontend_agent.md)
- [Backend Agent](../agents/prompts/backend_agent.md)
- [Database Agent](../agents/prompts/database_agent.md)
- [TDD Agent](../agents/prompts/tdd_agent.md)
- [Research Agent](../agents/prompts/research_agent.md)
- [Librarian Agent](../agents/prompts/librarian_agent.md)

---

### 🏗️ Architecture Documentation

- [System Overview](./architecture/system-overview.md) - High-level system architecture
- [Database Schema](./architecture/database-schema.md) - Database design and models
- [API Design](./architecture/api-design.md) - API specifications and contracts
- [Component Structure](./architecture/component-structure.md) - Frontend component hierarchy
- [Security Specifications](./architecture/security-specifications.md) - Security requirements and implementation
- [API Standards](./architecture/api-standards.md) - API response format standards
- [Performance Optimization](./architecture/performance-optimization.md) - Performance considerations
- [Frontend Implementation Details](./architecture/frontend-implementation-details.md) - Frontend-specific details
- [Database Clarifications](./architecture/database-clarifications.md) - Database design clarifications

---

### 📡 API Documentation

- [Authentication API](./api/authentication.md) - Authentication endpoints
- [Notes API](./api/notes.md) - Notes CRUD operations
- [Flashcards API](./api/flashcards.md) - Flashcard operations
- [Study Sessions API](./api/study-sessions.md) - Study session tracking

---

### 🧪 Testing Documentation

- [Authentication Tests Summary](./testing/authentication-tests-summary.md) - 84 tests (42 backend + 42 frontend)
- [Notes Tests Summary](./testing/notes-tests-summary.md) - 97 tests (67 backend + 30 frontend)
- [Flashcard Tests Summary](./testing/flashcard-tests-summary.md) - 115 tests (65 backend + 50 frontend)

**Test Coverage**:
- Backend: 174/174 tests passing (100%)
- Frontend: Service tests 26/26 passing (100%)
- Integration: 5/5 end-to-end tests passing (100%)

---

### 📋 Decision Records

All technical decisions are documented in `docs/decisions/`:

- [001: Authentication Method](./decisions/001-authentication-method.md) - Django Session Auth
- [002: State Management](./decisions/002-state-management.md) - React Context API
- [003: Styling Approach](./decisions/003-scraping-strategy.md) - CSS Modules
- [004: Architecture Review](./decisions/004-architecture-review.md) - Initial review
- [005: Architecture Final Approval](./decisions/005-architecture-final-approval.md) - Final approval
- [006: Authentication Tests Approval](./decisions/006-authentication-tests-approval.md)
- [007: Next Steps Review](./decisions/007-next-steps-review.md)
- [008: Phase 2 - Notes Feature](./decisions/008-phase-2-notes-feature.md)
- [009: Notes Tests Approval](./decisions/009-notes-tests-approval.md)
- [010: Phase 3 - Flashcard Feature](./decisions/010-phase-3-flashcard-feature.md)
- [011: Flashcard Tests Approval](./decisions/011-flashcard-tests-approval.md)
- [012: Phase 3 Complete](./decisions/012-phase-3-complete.md)

---

### 📚 Project History

- [Changelog](./history/changelog.md) - Version history and changes
- [Development Log](./history/development-log.md) - Development timeline
- [Agent Actions](./history/agent-actions.md) - Log of all agent activities

---

### 🛠️ Setup & Configuration

- [Development Environment Guide](./setup/development-environment-guide.md) - Complete setup instructions
- [Frontend Foundation Complete](./setup/frontend-foundation-complete.md) - Frontend setup details

---

### 📝 Planning Documents

- [All Features Complete](./planning/all-features-complete.md) - Feature completion status
- [Senior Developer Next Steps](./planning/senior-developer-next-steps.md) - Development roadmap

---

### 🔍 Code Reviews

- [Authentication Tests Review](./reviews/authentication-tests-review.md)
- [Notes Tests Review](./reviews/notes-tests-review.md)

---

## Documentation Standards

All documentation follows these standards:

### Code Documentation
- Module-level docstrings explain purpose and key components
- Class-level docstrings explain usage and key methods
- Function-level docstrings document parameters and return values

### API Documentation
- Endpoint URL and HTTP method
- Request/response schemas
- Status codes and error responses
- Example requests/responses

### Decision Records
- Context and problem statement
- Decision and rationale
- Alternatives considered
- Consequences and implementation notes

### Architecture Documentation
- System overview with diagrams
- Component relationships
- Data flow
- Technology choices and design patterns

---

## How to Contribute to Documentation

1. **For Code Changes**: Notify Librarian Agent or update relevant docs
2. **For Architecture Changes**: Update architecture docs and notify Architect Agent
3. **For API Changes**: Update API docs and notify Backend Agent
4. **For Decisions**: Create decision record in `docs/decisions/`
5. **For Setup Changes**: Update setup guides

---

## Documentation Maintenance

- **Primary Maintainer**: Librarian Agent
- **Reviewer**: Senior Developer Agent
- **Update Frequency**: Continuously as project evolves
- **Last Major Update**: 2025-01-27

---

## Related Resources

- [Project README](../README.md) - Main project documentation
- [Quick Start Guide](../QUICK_START.md) - Quick setup instructions
- [Agent Context](../agents/agent_context.json) - Current project state

---

**For questions or updates to this documentation, contact the Librarian Agent.**

