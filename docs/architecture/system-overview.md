# System Architecture Overview
**Date**: 2025-01-27
**Created By**: Architect Agent
**Status**: Final

## Overview

The Study Notes & Flashcard App is a full-stack web application designed for creating, organizing, and studying educational content using spaced repetition algorithms. The system follows a three-tier architecture with clear separation between presentation, business logic, and data layers.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │    Auth    │  │   Notes    │  │ Flashcards  │            │
│  │ Components │  │ Components │  │ Components  │            │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘            │
│        │               │                │                     │
│        └───────────────┼────────────────┘                     │
│                        │                                       │
│                 ┌──────▼──────┐                                │
│                 │ API Service │                                │
│                 │   Layer     │                                │
│                 └──────┬──────┘                                │
└────────────────────────┼──────────────────────────────────────┘
                         │ HTTP/REST (Session Auth)
┌────────────────────────▼──────────────────────────────────────┐
│              Django REST Framework Backend                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│  │   Auth     │  │   Notes   │  │ Flashcards  │              │
│  │  Views     │  │  Views    │  │   Views    │              │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘              │
│        │               │                │                       │
│        └───────────────┼────────────────┘                       │
│                        │                                         │
│                 ┌──────▼──────┐                                  │
│                 │ Serializers │                                  │
│                 │   & Models  │                                  │
│                 └──────┬──────┘                                  │
└────────────────────────┼────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                  PostgreSQL Database                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│  │   Users    │  │   Notes    │  │ Flashcards  │              │
│  │ Categories │  │    Tags    │  │Study Sessions│              │
│  └────────────┘  └────────────┘  └────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (created with `npm create vite@latest`)
- **Routing**: React Router v6
- **State Management**: React Context API + useState/useReducer
- **Styling**: CSS Modules + CSS Variables (dark mode support)
- **HTTP Client**: Fetch API (native)

### Backend
- **Framework**: Django 4.2+ with Django REST Framework
- **Database**: PostgreSQL 16.11
- **Authentication**: Django Session Authentication
- **Additional Packages**: django-cors-headers

### Infrastructure
- **Development**: WSL2 Ubuntu 22.04
- **Deployment**: AWS EC2, Ubuntu 22.04
- **Database**: PostgreSQL 16.11

## Architecture Principles

1. **Separation of Concerns**: Clear boundaries between frontend, backend, and database
2. **RESTful API**: Standard REST endpoints for all operations
3. **Session-Based Auth**: Secure, same-origin authentication
4. **Test-Driven Development**: Tests written before implementation
5. **Component-Based UI**: Reusable React components
6. **Type Safety**: TypeScript throughout frontend
7. **Dark Mode First**: UI designed with dark mode as default

## Data Flow

### Authentication Flow
1. User submits credentials via LoginForm
2. Frontend API service sends POST to `/api/auth/login/`
3. Django authenticates and creates session
4. Session cookie returned to frontend
5. Subsequent requests include session cookie automatically

### Note Creation Flow
1. User creates note in NoteEditor component
2. Frontend validates form data
3. API service sends POST to `/api/notes/`
4. Django validates, creates Note model instance
5. Serializer converts to JSON response
6. Frontend updates state and displays new note

### Flashcard Study Flow
1. User selects flashcard set and study mode
2. Frontend requests cards from `/api/flashcard-sets/{id}/cards/`
3. User studies cards (simple flip or spaced repetition)
4. Frontend sends review data to `/api/cards/{id}/review/`
5. Backend updates card with SM-2 algorithm
6. Frontend displays next card based on algorithm

## Security Considerations

1. **CSRF Protection**: Django's built-in CSRF protection for all POST/PUT/DELETE requests
2. **Session Security**: Secure, HttpOnly session cookies
3. **Input Validation**: All inputs validated on both frontend and backend
4. **SQL Injection Prevention**: Django ORM prevents SQL injection
5. **XSS Prevention**: React automatically escapes content
6. **Authentication Required**: All API endpoints (except auth) require authentication

## Scalability Considerations

1. **Database Indexing**: Strategic indexes on frequently queried fields
2. **Pagination**: API endpoints support pagination for large datasets
3. **Caching**: Session data cached in Django
4. **Future**: Can add Redis for session storage if needed
5. **Future**: Can add CDN for static assets if needed

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│         AWS EC2 Instance                │
│  ┌──────────────────────────────────┐  │
│  │     Nginx (Reverse Proxy)        │  │
│  └──────────────┬───────────────────┘  │
│                 │                        │
│  ┌──────────────▼───────────────────┐  │
│  │   Django + Gunicorn (Backend)    │  │
│  │   Port: 8000                     │  │
│  └──────────────┬───────────────────┘  │
│                 │                        │
│  ┌──────────────▼───────────────────┐  │
│  │   Vite Build (Static Frontend)   │  │
│  │   Served by Nginx                │  │
│  └───────────────────────────────────┘  │
│                 │                        │
│  ┌──────────────▼───────────────────┐  │
│  │   PostgreSQL Database             │  │
│  │   Port: 5432                      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Next Steps

1. **Database Agent**: Create detailed database schema
2. **TDD Agent**: Write tests based on this architecture
3. **Backend Agent**: Implement Django models and API
4. **Frontend Agent**: Implement React components
5. **Senior Developer**: Review and approve all implementations

---

**Status**: Architecture design complete. Ready for Senior Developer review and TDD test creation.

