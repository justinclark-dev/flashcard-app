# API Standards & Conventions
**Date**: 2025-01-27
**Created By**: Architect Agent
**Status**: Final
**Reviewed By**: Senior Developer Agent

## Overview

This document defines standards and conventions for the REST API to ensure consistency, maintainability, and ease of integration.

## Response Format Standardization

### Success Response Format

**Standard Format** (for all endpoints):
```json
{
  "data": { ... },
  "status": "success"
}
```

**Pagination Format** (for list endpoints):
```json
{
  "count": 100,
  "next": "http://api/notes/?page=2",
  "previous": null,
  "results": [
    { ... },
    { ... }
  ],
  "status": "success"
}
```

**Single Object Response**:
```json
{
  "data": {
    "id": 1,
    "title": "Example",
    ...
  },
  "status": "success"
}
```

### Error Response Format

**Standard Error Format**:
```json
{
  "error": "Error message",
  "details": {
    "field_name": ["Error message for field"]
  },
  "status": "error",
  "code": "ERROR_CODE"
}
```

**Validation Error Format**:
```json
{
  "error": "Validation failed",
  "details": {
    "title": ["This field is required."],
    "email": ["Enter a valid email address."]
  },
  "status": "error",
  "code": "VALIDATION_ERROR"
}
```

**Authentication Error**:
```json
{
  "error": "Authentication required",
  "status": "error",
  "code": "AUTHENTICATION_REQUIRED"
}
```

**Authorization Error**:
```json
{
  "error": "You do not have permission to perform this action",
  "status": "error",
  "code": "PERMISSION_DENIED"
}
```

**Rate Limit Error**:
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retry_after": 60,
  "status": "error",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

**Not Found Error**:
```json
{
  "error": "Resource not found",
  "status": "error",
  "code": "NOT_FOUND"
}
```

### Error Codes

**Standard Error Codes**:
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_REQUIRED`: User not authenticated
- `PERMISSION_DENIED`: User lacks permission
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded
- `NOT_FOUND`: Resource not found
- `SERVER_ERROR`: Internal server error
- `BAD_REQUEST`: Invalid request format

## HTTP Status Codes

**Standard Usage**:
- `200 OK`: Successful GET, PUT, PATCH
- `201 Created`: Successful POST (resource created)
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Validation errors, malformed request
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Authenticated but not authorized
- `404 Not Found`: Resource doesn't exist
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Pagination Standards

### Pagination Parameters

**Query Parameters**:
- `page` (int): Page number (default: 1, min: 1)
- `page_size` (int): Items per page (default: 20, min: 1, max: 100)

**Enforcement**:
- Backend must enforce `page_size` maximum of 100
- Backend must validate `page` is positive integer
- Invalid values return 400 Bad Request

**Response Format**:
```json
{
  "count": 250,
  "next": "http://api/notes/?page=3&page_size=20",
  "previous": "http://api/notes/?page=1&page_size=20",
  "results": [ ... ],
  "status": "success"
}
```

**Edge Cases**:
- Empty results: `results: []`, `count: 0`
- Page beyond range: Return empty results, not error
- Negative page: Return 400 Bad Request

## Request/Response Validation

### Request Timeout

**Settings**:
- Frontend timeout: 30 seconds
- Backend timeout: 25 seconds (before frontend timeout)
- Scraping endpoint: 60 seconds (longer for external requests)

### Request Body Size

**Limits**:
- Maximum request body: 10MB
- Note content: Recommended max 1MB per note
- File uploads: Not supported in MVP (future feature)

### Response Compression

**Implementation**:
- Enable gzip compression for all responses
- Compress JSON responses > 1KB
- Configure in Nginx or Django middleware

## API Versioning

### Versioning Strategy

**Current Approach**: No versioning for MVP (v1 implicit)

**Future Strategy**: URL prefix versioning
- Format: `/api/v1/`, `/api/v2/`, etc.
- Default: Latest version if not specified
- Deprecation: Announce 6 months before removal

**Version Header** (Alternative for future):
- Header: `API-Version: 1`
- Fallback to URL if header not present

### Backward Compatibility

**Policy**:
- Breaking changes require new version
- Non-breaking changes can be added to existing version
- Document all changes in changelog

## Filtering & Sorting

### Filtering Standards

**Query Parameter Format**:
- Single value: `?category=1`
- Multiple values: `?tags=1&tags=2` or `?tags=1,2`
- Range: `?created_after=2025-01-01&created_before=2025-01-31`

**Common Filters**:
- `category` (int): Filter by category ID
- `search` (string): Full-text search
- `tags` (int[]): Filter by tag IDs
- `created_after` (date): Filter by creation date
- `created_before` (date): Filter by creation date

### Sorting Standards

**Query Parameter**: `ordering`

**Format**:
- Single field: `?ordering=created_at`
- Descending: `?ordering=-created_at`
- Multiple fields: `?ordering=category,-created_at`

**Allowed Fields**: Documented per endpoint
- Default: Usually `-created_at` (newest first)

## Search Standards

### Search Implementation

**Endpoints with Search**:
- `/api/notes/?search=query`
- `/api/flashcard-sets/?search=query`

**Search Behavior**:
- Case-insensitive
- Searches in title and content (for notes)
- Searches in name and description (for sets)
- Returns results ordered by relevance (if possible) or date

**Search Limitations**:
- Minimum query length: 2 characters
- Maximum query length: 100 characters
- Special characters: Escaped for safety

## Date/Time Format

### Standard Format

**ISO 8601 Format**: `YYYY-MM-DDTHH:MM:SSZ` or `YYYY-MM-DDTHH:MM:SS+00:00`

**Examples**:
- `2025-01-27T10:30:00Z`
- `2025-01-27T10:30:00+00:00`

**Timezone**:
- All datetimes in UTC
- Frontend converts to user's local timezone for display

## Field Naming Conventions

### Standard Conventions

- Use `snake_case` for all field names
- Use descriptive names
- Use `id` for primary keys
- Use `_id` suffix for foreign keys in requests
- Use full object in responses (not just ID)

**Examples**:
- Request: `{"category_id": 1, "tag_ids": [1, 2]}`
- Response: `{"category": {"id": 1, "name": "Python"}, "tags": [{"id": 1, "name": "basics"}]}`

## Content-Type

### Request Content-Type

- `application/json` for all POST, PUT, PATCH requests
- `multipart/form-data` not used in MVP

### Response Content-Type

- `application/json` for all responses
- `text/html` only for error pages (if any)

## CORS Configuration

### Settings

```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',  # Development
    'https://your-domain.com',  # Production
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
CORS_ALLOW_HEADERS = [
    'Content-Type',
    'X-CSRFToken',
    'Authorization',  # For future JWT if needed
]
```

## API Documentation

### Documentation Requirements

- All endpoints documented
- Request/response examples provided
- Error responses documented
- Authentication requirements specified
- Rate limits documented

### Documentation Format

- Use OpenAPI/Swagger format (future)
- Maintain in `docs/api/` directory
- Keep examples up to date

## Testing Standards

### API Testing Requirements

- All endpoints must have tests
- Test success cases
- Test error cases
- Test authentication/authorization
- Test rate limiting
- Test validation
- Test pagination

---

**Status**: API standards complete. Ready for Backend Agent implementation.

