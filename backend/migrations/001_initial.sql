CREATE TABLE schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, public_registration boolean NOT NULL DEFAULT false,
  timezone text NOT NULL DEFAULT 'Asia/Jakarta', service_settings jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE cohorts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), school_id uuid NOT NULL REFERENCES schools(id), label text NOT NULL, graduation_at date, deletion_at timestamptz);
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), school_id uuid NOT NULL REFERENCES schools(id),
  username text NOT NULL UNIQUE CHECK (username = lower(username)), password_hash text NOT NULL,
  recovery_hash text, nickname text NOT NULL CHECK(length(nickname) BETWEEN 2 AND 40),
  role text NOT NULL CHECK (role IN ('superadmin','bk','siswa')),
  status text NOT NULL CHECK (status IN ('pending_approval','approved','rejected','suspended')),
  deletion_requested_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  CHECK (role='siswa' OR status IN ('approved','suspended'))
);
CREATE INDEX users_school_status ON users(school_id,status,created_at);
CREATE TABLE student_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, grade text NOT NULL CHECK(grade IN ('XI','XII')),
  semester integer NOT NULL CHECK(semester IN (1,2)), age_band text NOT NULL CHECK(age_band IN ('under18','adult')),
  cohort_id uuid REFERENCES cohorts(id)
);
CREATE TABLE consents (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, notice_version text NOT NULL, student_agreed_at timestamptz NOT NULL,
  guardian_status text NOT NULL CHECK(guardian_status IN ('pending','verified','not_required')),
  verified_by uuid REFERENCES users(id) ON DELETE SET NULL, verified_at timestamptz, external_reference text
);
CREATE TABLE registration_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), student_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES users(id) ON DELETE SET NULL, decision text NOT NULL CHECK(decision IN ('approved','rejected')),
  reason text, created_at timestamptz NOT NULL DEFAULT now(), CHECK(decision <> 'rejected' OR length(reason) BETWEEN 5 AND 500)
);
CREATE TABLE sessions (sid varchar PRIMARY KEY, sess json NOT NULL, expire timestamp(6) NOT NULL);
CREATE INDEX sessions_expire_idx ON sessions(expire);
CREATE TABLE audit_logs (
  id bigserial PRIMARY KEY, actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  event text NOT NULL, target_id uuid, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE student_documents (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK(kind IN ('reflection','comparison','plan')), data jsonb NOT NULL DEFAULT '{}',
  version integer NOT NULL DEFAULT 0, updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,kind)
);
CREATE TABLE progress_states (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, reflection boolean NOT NULL DEFAULT false,
  exploration boolean NOT NULL DEFAULT false, comparison boolean NOT NULL DEFAULT false, plan boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE journals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_date date NOT NULL DEFAULT CURRENT_DATE, answers jsonb NOT NULL, version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX journals_owner ON journals(user_id,entry_date DESC);
CREATE TABLE content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), school_id uuid NOT NULL REFERENCES schools(id), slug text NOT NULL UNIQUE,
  title text NOT NULL, kind text NOT NULL CHECK(kind IN ('pathway','profession','story','worksheet')),
  category text NOT NULL CHECK(category IN ('Kuliah','Kerja','Kuliah + Kerja','Usaha')),
  riasec text CHECK(riasec IN ('R','I','A','S','E','C')), summary text NOT NULL, body text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','review','published','archived')),
  sources jsonb NOT NULL DEFAULT '[]', reviewer text, reviewed_at date, valid_until date,
  demo boolean NOT NULL DEFAULT false, version integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK(status <> 'published' OR (reviewer IS NOT NULL AND reviewed_at IS NOT NULL AND valid_until IS NOT NULL AND jsonb_array_length(sources)>0))
);
CREATE TABLE content_revisions (id bigserial PRIMARY KEY, content_id uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE, actor_id uuid REFERENCES users(id) ON DELETE SET NULL, version integer NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(content_id,version));
CREATE TABLE consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), request_number bigserial UNIQUE,
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, teacher_id uuid NOT NULL REFERENCES users(id), school_id uuid NOT NULL REFERENCES schools(id),
  topic text NOT NULL CHECK(topic IN ('Kenali diri','Pilihan jalur','Biaya dan dukungan','Rencana langkah','Diskusi lainnya')),
  availability text NOT NULL, note text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted','scheduled','reschedule','completed','cancelled','closed')),
  confirmed_time timestamptz, location text, operational_reason text,
  idempotency_key uuid NOT NULL, request_hash text NOT NULL, version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(student_id,idempotency_key)
);
CREATE INDEX consultations_teacher ON consultations(teacher_id,school_id,status,created_at);
CREATE TABLE shared_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), request_id uuid NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  section text NOT NULL CHECK(section IN ('reflection','comparison','plan')), content_copy jsonb,
  source_version integer NOT NULL, consent_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now()+interval '30 days', revoked_at timestamptz,
  UNIQUE(request_id,section)
);
CREATE TABLE deletion_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), target_id uuid NOT NULL, requested_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','completed','failed')), retry_count integer NOT NULL DEFAULT 0,
  completed_at timestamptz, failure_code text
);
CREATE UNIQUE INDEX deletion_jobs_target_pending ON deletion_jobs(target_id) WHERE status IN ('pending','failed');
