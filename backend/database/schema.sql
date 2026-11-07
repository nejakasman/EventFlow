
CREATE TABLE IF NOT EXISTS users (
    keycloak_id VARCHAR(36) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organizations (
    keycloak_id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    max_participants INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    organization_keycloak_id VARCHAR(36) NOT NULL,
    category_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_event_organization
        FOREIGN KEY (organization_keycloak_id)
        REFERENCES organizations(keycloak_id),

    CONSTRAINT fk_event_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id),

    CONSTRAINT chk_event_dates
        CHECK (end_date > start_date),

    CONSTRAINT chk_registration_deadline
        CHECK (registration_deadline < start_date),

    CONSTRAINT chk_max_participants
        CHECK (max_participants > 0),

    CONSTRAINT chk_event_status
        CHECK (status IN ('DRAFT', 'PUBLISHED', 'CANCELLED'))
);

CREATE INDEX IF NOT EXISTS idx_events_organization
ON events(organization_keycloak_id);

CREATE INDEX IF NOT EXISTS idx_events_category
ON events(category_id);

CREATE INDEX IF NOT EXISTS idx_events_status_start_date
ON events(status, start_date);