-- Add `meta` column to job_events if not already there
ALTER TABLE job_events
    ADD COLUMN meta TEXT DEFAULT '{}' NOT NULL;

-- Create a temporary backup of job_events
CREATE TABLE IF NOT EXISTS job_events_backup AS
SELECT *
FROM job_events;

-- Create new jobs_temp table
CREATE TABLE jobs_temp
(
    id               TEXT PRIMARY KEY               NOT NULL,
    insert_date      TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    company          TEXT                           NOT NULL,
    title            TEXT                           NOT NULL,
    application_date TEXT DEFAULT CURRENT_DATE      NOT NULL,
    status           TEXT DEFAULT 'sent'            NOT NULL,
    insert_status    TEXT DEFAULT 'inserted' CHECK (insert_status IN ('inserted', 'archived', 'deleted')),
    last_updated_at  TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    meta             TEXT DEFAULT '{}'              NOT NULL
);

-- Migrate existing data into jobs_temp
INSERT INTO jobs_temp (id, title, company, insert_date, application_date,
                       status, insert_status, last_updated_at, meta)
SELECT id,
       title,
       company,
       insert_date,
       application_date,
       status,
       insert_status,
       last_updated_at,
       json_object(
               'note', COALESCE(note, ''),
               'location', COALESCE(location, ''),
               'link_to_job_posting', COALESCE(link, '')
       )
FROM jobs;

-- Drop old jobs table and rename new one
DROP TABLE jobs;
ALTER TABLE jobs_temp
    RENAME TO jobs;

-- Restore job_events (only if it’s now empty)
INSERT INTO job_events
SELECT *
FROM job_events_backup
WHERE NOT EXISTS (SELECT 1 FROM job_events);

-- Drop backup (optional, or keep it as failsafe)
DROP TABLE job_events_backup;
