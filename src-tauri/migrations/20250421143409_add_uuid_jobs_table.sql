-- Disable foreign keys temporarily
PRAGMA foreign_keys = OFF;

-- Create new jobs table
CREATE TABLE jobs_new
(
    id               TEXT PRIMARY KEY               NOT NULL,
    insert_date      TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    company          TEXT                           NOT NULL,
    title            TEXT                           NOT NULL,
    link             TEXT,
    application_date TEXT DEFAULT CURRENT_DATE      NOT NULL,
    status           TEXT DEFAULT 'sent'            NOT NULL,
    insert_status    TEXT DEFAULT 'inserted' CHECK (insert_status IN ('inserted', 'archived', 'restored', 'deleted')),
    location         TEXT,
    last_updated_at  TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create mapping table
CREATE TABLE jobs_id_map
(
    old_id INTEGER,
    new_id TEXT
);

-- Copy data into jobs_new and build mapping
INSERT INTO jobs_new (id, insert_date, company, title, link, application_date, status, insert_status, location)
SELECT LOWER(HEX(RANDOMBLOB(16))),
       insert_date,
       company,
       title,
       link,
       application_date,
       status,
       insert_status,
       location
FROM jobs;

INSERT INTO jobs_id_map (old_id, new_id)
SELECT old.id, new.id
FROM jobs AS old
         JOIN jobs_new AS new ON old.company = new.company AND old.title = new.title;

-- Create new job_events table
CREATE TABLE job_events_new
(
    id              TEXT PRIMARY KEY                                    NOT NULL,
    job_id          TEXT                                                NOT NULL,
    date_of_event   TEXT                                                NOT NULL DEFAULT CURRENT_DATE,
    description     TEXT                                                NOT NULL,
    insert_type     TEXT CHECK (insert_type IN ('automatic', 'manual')) NOT NULL DEFAULT 'manual',
    insert_date     TEXT                                                NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TEXT                                                         DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (job_id) REFERENCES jobs_new (id) ON DELETE CASCADE
);

-- Copy data into job_events_new using mapping
INSERT INTO job_events_new (id, job_id, date_of_event, description, insert_type, insert_date)
SELECT LOWER(HEX(RANDOMBLOB(16))),
       m.new_id,
       e.date_of_event,
       e.description,
       e.insert_type,
       e.insert_date
FROM job_events e
         JOIN jobs_id_map m ON e.job_id = m.old_id;

-- Drop old tables
DROP TABLE job_events;
DROP TABLE jobs;

-- Rename new tables
ALTER TABLE jobs_new
    RENAME TO jobs;
ALTER TABLE job_events_new
    RENAME TO job_events;

-- Drop mapping table
DROP TABLE jobs_id_map;

-- Re-enable foreign keys
PRAGMA foreign_keys = ON;
