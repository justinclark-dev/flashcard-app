# AI Agent System Design
## Study Notes & Flashcard App - Multi-Agent Development System

### Overview
This document defines a multi-agent AI system where specialized agents collaborate to build, test, document, and maintain the Study Notes & Flashcard App.

### Agent Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Senior Developer Agent                    │
│              (Orchestrator & Quality Gatekeeper)             │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐  ┌─────▼──────┐  ┌────▼──────┐
│ Architect    │  │ Frontend   │  │ Backend   │
│ Agent        │  │ Agent      │  │ Agent     │
└───────┬──────┘  └─────┬──────┘  └────┬──────┘
        │               │               │
        └───────┬───────┼───────┬───────┘
                │       │       │
        ┌───────▼───────▼───────▼───────┐
        │    Database Agent              │
        └───────┬───────────────────────┘
                │
        ┌───────▼───────┐
        │  TDD Agent    │
        └───────┬───────┘
                │
        ┌───────▼───────┐
        │ Research Agent│
        └───────┬───────┘
                │
        ┌───────▼───────┐
        │ Librarian     │
        │ Agent         │
        └───────────────┘
```

### Communication Protocol
- **Shared Context File**: `agent_context.json` - All agents read/write to this
- **Task Queue**: `tasks.json` - Tasks assigned to agents
- **Documentation**: `docs/` - All documentation managed by Librarian
- **Logs**: `logs/agent_*.log` - Each agent maintains its own log

---

## Agent Definitions

### 1. Senior Developer Agent
**Role**: Project orchestrator, code reviewer, and quality gatekeeper

**Responsibilities**:
- Review all code changes before implementation
- Coordinate between agents
- Make final decisions on architecture conflicts
- Ensure code quality and best practices
- Approve or reject agent proposals
- Manage the overall development timeline

**Outputs**:
- Code review comments
- Approval/rejection decisions
- Task prioritization
- Quality metrics

**Prompt Template**: See `prompts/senior_developer_agent.md`

---

### 2. Architect Agent
**Role**: System design and technical architecture

**Responsibilities**:
- Design overall system architecture
- Define API contracts between frontend and backend
- Design database schema
- Plan authentication/authorization flow
- Define component structure
- Create technical specifications

**Outputs**:
- Architecture diagrams (text-based)
- API specifications
- Database schema designs
- Component hierarchy
- Technical decision records (TDRs)

**Prompt Template**: See `prompts/architect_agent.md`

---

### 3. Frontend Agent
**Role**: React/TypeScript frontend development

**Responsibilities**:
- Build React components
- Implement UI/UX features
- Handle state management
- Create API integration layer
- Implement routing
- Ensure responsive design
- Dark mode styling

**Outputs**:
- React components
- TypeScript interfaces
- API service files
- CSS/styling files
- Component documentation

**Prompt Template**: See `prompts/frontend_agent.md`

---

### 4. Backend Agent
**Role**: Django REST Framework backend development

**Responsibilities**:
- Build Django models
- Create REST API endpoints
- Implement authentication
- Handle data validation
- Create serializers
- Implement business logic
- Set up middleware

**Outputs**:
- Django models
- ViewSets/APIViews
- Serializers
- URL configurations
- Authentication logic

**Prompt Template**: See `prompts/backend_agent.md`

---

### 5. Database Agent
**Role**: Database design and optimization

**Responsibilities**:
- Design database schema
- Create migrations
- Optimize queries
- Design indexes
- Ensure data integrity
- Plan for scalability

**Outputs**:
- Migration files
- Query optimization suggestions
- Index recommendations
- Database documentation

**Prompt Template**: See `prompts/database_agent.md`

---

### 6. TDD Agent
**Role**: Test-driven development and quality assurance

**Responsibilities**:
- Write unit tests
- Write integration tests
- Write API tests
- Write frontend component tests
- Ensure test coverage
- Run test suites
- Report test results

**Outputs**:
- Test files (pytest, Jest)
- Test reports
- Coverage reports
- Test documentation

**Prompt Template**: See `prompts/tdd_agent.md`

---

### 7. Research Agent
**Role**: Technical research and learning resource integration

**Responsibilities**:
- Research best practices
- Find documentation sources
- Scrape learning sites (w3schools, MDN, etc.)
- Extract relevant information
- Format data for flashcards
- Stay updated on React/Django best practices

**Outputs**:
- Research notes
- Scraped content (structured)
- Best practice recommendations
- Learning resource links

**Prompt Template**: See `prompts/research_agent.md`

---

### 8. Librarian Agent
**Role**: Documentation and knowledge management

**Responsibilities**:
- Document all code changes
- Maintain project history
- Track design decisions
- Create user documentation
- Maintain API documentation
- Keep architecture diagrams updated
- Log all "who, what, where, when, why, how"

**Outputs**:
- Code documentation
- Architecture docs
- API docs
- Change logs
- Decision records
- Project history

**Prompt Template**: See `prompts/librarian_agent.md`

---

## Shared Context Structure

### agent_context.json
```json
{
  "project": {
    "name": "Study Notes & Flashcard App",
    "version": "0.1.0",
    "status": "in_progress"
  },
  "architecture": {
    "frontend": "React + TypeScript",
    "backend": "Django REST Framework",
    "database": "PostgreSQL",
    "auth": "JWT or Session-based (TBD)"
  },
  "current_tasks": [],
  "completed_tasks": [],
  "decisions": [],
  "agents": {
    "senior_developer": {"status": "active", "last_action": ""},
    "architect": {"status": "active", "last_action": ""},
    "frontend": {"status": "active", "last_action": ""},
    "backend": {"status": "active", "last_action": ""},
    "database": {"status": "active", "last_action": ""},
    "tdd": {"status": "active", "last_action": ""},
    "research": {"status": "active", "last_action": ""},
    "librarian": {"status": "active", "last_action": ""}
  },
  "knowledge_base": {
    "design_decisions": [],
    "code_patterns": [],
    "lessons_learned": []
  }
}
```

---

## Workflow

1. **Planning Phase**: Architect + Senior Developer define requirements
2. **Design Phase**: Architect creates specifications
3. **Development Phase**: Frontend/Backend/Database agents build
4. **Testing Phase**: TDD Agent writes and runs tests
5. **Documentation Phase**: Librarian documents everything
6. **Review Phase**: Senior Developer reviews and approves
7. **Iteration**: Repeat as needed

---

## File Structure

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
│   └── agent_context.json
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── decisions/
│   └── history/
├── logs/
└── tasks.json
```

