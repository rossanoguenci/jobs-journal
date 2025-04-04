CREATE TABLE IF NOT EXISTS job_events
(
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id        INTEGER NOT NULL,
    date_of_event TEXT    NOT NULL DEFAULT CURRENT_DATE,
    description   TEXT    NOT NULL,
    insert_type   TEXT CHECK (insert_type IN ('automatic', 'manual')),
    insert_date   TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
);
