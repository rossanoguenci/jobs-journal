-- Add migration script here
ALTER TABLE jobs ADD COLUMN insert_status TEXT DEFAULT 'inserted';
UPDATE jobs SET insert_status = 'inserted' WHERE insert_status IS NULL;
