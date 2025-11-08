-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create database if it doesn't exist (docker-entrypoint handles this, but keeping for reference)
-- The database is automatically created by POSTGRES_DB env var

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE microplanner_dev TO microplanner;

-- Optional: Create additional schemas if needed
-- CREATE SCHEMA IF NOT EXISTS analytics;
-- CREATE SCHEMA IF NOT EXISTS ai;
