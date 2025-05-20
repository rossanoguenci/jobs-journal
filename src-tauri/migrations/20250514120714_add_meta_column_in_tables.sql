-- Add migration script here
-- 1. Add `meta` column to the job_events table
ALTER TABLE job_events
    ADD COLUMN meta TEXT DEFAULT '{}' NOT NULL;

-- 2. Create new `jobs_temp` table with `meta` instead of note/location/link
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

-- 3. Copy data from `jobs` into `jobs_temp`, building meta JSON
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
               'note', COALESCE(j.note, ''),
               'location', COALESCE(j.location, ''),
               'link_to_job_posting', COALESCE(j.link, '')
       )
FROM jobs j;

-- 4. Drop old `jobs` table
DROP TABLE jobs;

-- 5. Rename `jobs_temp` to `jobs`
ALTER TABLE jobs_temp
    RENAME TO jobs;

