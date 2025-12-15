# Study Notes & Flashcard App
## Multi-Agent AI Development System

A full-stack web application for creating study notes and flashcards with spaced repetition learning, built using a collaborative multi-agent AI system.

## Project Overview

This project demonstrates a novel approach to software development using specialized AI agents that work together to build, test, document, and maintain a complete web application.

### Tech Stack
- **Frontend**: React 18+ with TypeScript
- **Backend**: Django 4.2+ with Django REST Framework
- **Database**: PostgreSQL 16.11
- **Authentication**: Django Session Authentication
- **Deployment**: AWS EC2, Ubuntu 22.04

### Features
- User authentication (register/login)
- Notes CRUD operations
- Flashcard creation from notes
- Study modes:
  - Simple flip cards
  - Spaced repetition algorithm (SM-2)
- Categories/Tags for organization
- Search functionality
- Data scraping from learning sites (w3schools, MDN, React/Django docs)
- Study statistics and progress tracking
- Dark mode UI
- Export/Import functionality

## AI Agent System

This project uses 8 specialized AI agents:

1. **Senior Developer Agent** - Project orchestrator and quality gatekeeper
2. **Architect Agent** - System design and technical architecture
3. **Frontend Agent** - React/TypeScript frontend development
4. **Backend Agent** - Django REST Framework backend development
5. **Database Agent** - Database design and optimization
6. **TDD Agent** - Test-driven development and quality assurance
7. **Research Agent** - Technical research and content scraping
8. **Librarian Agent** - Documentation and knowledge management

### How the Agents Work

Agents collaborate through:
- **Shared Context**: `agents/agent_context.json` - Tracks project state
- **Agent Prompts**: `agents/prompts/` - Defines each agent's role
- **Documentation**: `docs/` - Maintained by Librarian Agent
- **Communication**: Agents coordinate through context and documentation

### Using the Agent System

1. **Read the Master System**: Start with `agents/MASTER_AGENT_SYSTEM.md`
2. **Check Current State**: Read `agents/agent_context.json`
3. **Identify Agent**: Determine which agent should handle your task
4. **Read Agent Prompt**: Review the agent's guidelines in `agents/prompts/`
5. **Execute Task**: Follow the agent's guidelines
6. **Update Context**: Update `agent_context.json` with your actions
7. **Document**: Ensure changes are documented

## Project Structure

```
project/
├── agents/
│   ├── prompts/
│   │   ├── senior_developer_agent.md
│   │   ├── architect_agent.md
│   │   ├── frontend_agent.md
│   │   ├── backend_agent.md
│   │   ├── database_agent.md
│   │   ├── tdd_agent.md
│   │   ├── research_agent.md
│   │   └── librarian_agent.md
│   ├── agent_context.json
│   └── MASTER_AGENT_SYSTEM.md
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── decisions/
│   └── history/
├── backend/          (To be created)
├── frontend/         (To be created)
├── AGENT_SYSTEM_DESIGN.md
└── README.md
```

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js (installed via nvm)
- PostgreSQL 16.11
- pip
- WSL Ubuntu 22.04 (for local development)

### System Check
The system has been checked and found:
- ✅ Python 3.11.0rc1
- ✅ pip 22.0.2 (system and virtual environment)
- ✅ PostgreSQL 16.11 (installed)
- ✅ Node.js v20.19.5 (installed via nvm)
- ✅ npm 10.8.2
- ✅ nvm 0.39.7
- ✅ Ubuntu 22.04.5 LTS (WSL2)
- ✅ Django 5.2.9 (installed in virtual environment)
- ✅ djangorestframework 3.16.1 (installed in virtual environment)
- ✅ django-cors-headers 4.9.0 (installed in virtual environment)

**Note**: Python virtual environment is located at `~/python-venv/` and should be activated with:
```bash
source ~/python-venv/bin/activate
```

### Installation Steps

**Note**: Django and dependencies are already installed in the virtual environment. If you need to reinstall or update:

1. **Activate virtual environment and install Django dependencies**:
   ```bash
   source ~/python-venv/bin/activate
   pip install django djangorestframework django-cors-headers
   ```

2. **Set up PostgreSQL database**:
   ```bash
   # Create database (may require PostgreSQL user configuration)
   createdb study_app
   ```

3. **Set up frontend (when ready)**:
   ```bash
   # Frontend Agent will use Vite to create the React app
   npm create vite@latest
   # Follow prompts: select React and TypeScript
   ```

4. **Follow agent system workflow** to build the application

## Development Workflow

### Phase 1: Planning & Design
- Architect Agent designs system
- Database Agent designs schema
- Senior Developer Agent reviews

### Phase 2: Test-First Development (TDD)
- **TDD Agent writes tests FIRST** based on Architect's specifications
- **Senior Developer Agent reviews and approves tests**
- Tests must be approved before any implementation begins

### Phase 3: Backend Development
- Backend Agent implements Django models and API (to make approved tests pass)
- Database Agent creates migrations
- TDD Agent verifies backend tests pass

### Phase 4: Frontend Development
- **TDD Agent writes frontend tests FIRST** based on Architect's specifications
- **Senior Developer Agent reviews and approves frontend tests**
- Frontend Agent implements React components (to make approved tests pass)
- TDD Agent verifies frontend tests pass
- Integration with backend API

### Phase 5: Integration & Testing
- Connect frontend to backend
- End-to-end testing
- TDD Agent verifies all tests pass
- Bug fixes and refinements

### Phase 6: Documentation & Polish
- Librarian Agent documents everything
- Final code review by Senior Developer Agent
- Deployment preparation

## Learning Resources

This app focuses on learning:
- React, Django, TypeScript
- Cursor AI, Claude AI
- AI Agents
- Coding fundamentals

Content will be scraped from:
- W3Schools
- MDN Web Docs
- React Official Documentation
- Django Official Documentation
- TypeScript Handbook

## Documentation

**📚 [Complete Documentation Index](./docs/README.md)** - Start here for all documentation

### Key Documentation

- **[Agent Coordination Guide](./docs/AGENT_COORDINATION.md)** - Comprehensive guide to the multi-agent system
- **[Development Setup Guide](./docs/setup/development-environment-guide.md)** - How to set up and run the project
- **[System Design](./AGENT_SYSTEM_DESIGN.md)** - Original agent system design
- **[Master Agent System](./agents/MASTER_AGENT_SYSTEM.md)** - Master prompt for agent coordination

### Documentation Categories

- **Architecture**: `docs/architecture/` - System design and architecture
- **API**: `docs/api/` - API endpoint documentation
- **Decisions**: `docs/decisions/` - Technical decision records
- **Testing**: `docs/testing/` - Test suites and coverage
- **History**: `docs/history/` - Project history and changelog
- **Setup**: `docs/setup/` - Setup and configuration guides

## Contributing

This is a learning project. The agent system is designed to:
- Teach full-stack development
- Demonstrate AI-assisted development
- Show collaborative development patterns
- Provide comprehensive documentation

## License

[To be determined]

## Acknowledgments

This project uses a novel multi-agent AI system for collaborative software development, demonstrating how specialized AI agents can work together to build complex applications.

---

**Status**: ✅ Integration Testing Complete - Ready for Production  
**Version**: 0.1.0  
**Test Coverage**: 174/174 backend tests passing (100%), 5/5 integration tests passing (100%)

For detailed project status, see [Agent Coordination Guide](./docs/AGENT_COORDINATION.md#current-project-status)

