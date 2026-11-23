ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS academic_options jsonb NOT NULL DEFAULT '{"grades":["XI","XII"],"semesters":[1,2]}'::jsonb;

ALTER TABLE student_profiles
  DROP CONSTRAINT IF EXISTS student_profiles_grade_check,
  DROP CONSTRAINT IF EXISTS student_profiles_semester_check;

ALTER TABLE student_profiles
  ADD CONSTRAINT student_profiles_grade_check CHECK (char_length(trim(grade)) BETWEEN 1 AND 40),
  ADD CONSTRAINT student_profiles_semester_check CHECK (semester BETWEEN 1 AND 6);
