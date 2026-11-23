ALTER TABLE deletion_jobs ADD COLUMN school_id uuid REFERENCES schools(id);
UPDATE deletion_jobs j SET school_id=u.school_id FROM users u WHERE u.id=j.target_id;
CREATE INDEX deletion_jobs_school ON deletion_jobs(school_id,requested_at DESC);
