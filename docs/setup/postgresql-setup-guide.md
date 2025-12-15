# PostgreSQL Setup Guide
**Date**: 2025-01-27
**Agent**: Database Agent
**Status**: Setup Instructions

## Current Status

✅ **PostgreSQL Installed**: Version 16.11 detected
⚠️ **Database Not Created**: `study_app` database does not exist
⚠️ **Connection Configuration**: Needs password/authentication setup

## Setup Options

### Option 1: Create Database with Your User (Recommended if you have PostgreSQL access)

If your Linux user has PostgreSQL access, you can create the database directly:

```bash
# Create database
createdb study_app

# Or using psql
psql -d postgres -c "CREATE DATABASE study_app;"
```

Then set environment variables:
```bash
export DB_NAME=study_app
export DB_USER=$USER  # Your Linux username
export DB_PASSWORD=""  # Empty if using peer authentication
export DB_HOST=localhost
export DB_PORT=5432
```

### Option 2: Use PostgreSQL 'postgres' User (Requires sudo)

If you need to use the `postgres` superuser:

```bash
# Create database (requires sudo password)
sudo -u postgres createdb study_app

# Or create user and database
sudo -u postgres psql << EOF
CREATE USER study_app_user WITH PASSWORD 'your_password';
CREATE DATABASE study_app OWNER study_app_user;
GRANT ALL PRIVILEGES ON DATABASE study_app TO study_app_user;
\q
EOF
```

Then set environment variables:
```bash
export DB_NAME=study_app
export DB_USER=study_app_user
export DB_PASSWORD=your_password
export DB_HOST=localhost
export DB_PORT=5432
```

### Option 3: Use SQLite for Development (Easiest)

For development, you can use SQLite instead:

Modify `backend/study_app/settings.py` to use SQLite when DEBUG=True.

## Authentication Methods

PostgreSQL supports several authentication methods:

1. **Peer Authentication** (local connections): No password needed if your Linux user matches PostgreSQL user
2. **Password Authentication**: Requires password in connection string
3. **Trust Authentication**: No password (not recommended for production)

## Check Your Current Setup

Run these commands to check your PostgreSQL configuration:

```bash
# Check if you can connect
psql -U $USER -d postgres -c "SELECT version();"

# Check PostgreSQL authentication config
cat /etc/postgresql/16/main/pg_hba.conf | grep -v "^#" | grep -v "^$"

# List existing databases
psql -U $USER -lqt
```

## After Database Creation

Once the database is created, run migrations:

```bash
cd backend
source ~/python-venv/bin/activate
python manage.py migrate
```

## Next Steps

**Please let me know:**
1. Can you run `createdb study_app` without sudo? (Try it)
2. Do you have a PostgreSQL password set up?
3. Would you prefer to use SQLite for development instead?

Based on your answer, I'll configure the database accordingly.

