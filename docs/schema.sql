-- Reference schema (actual tables are auto-created by Sequelize sync)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  public_id VARCHAR(80) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(120) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(120) NOT NULL,
  file_size INTEGER NOT NULL,
  start_time TIMESTAMP NULL,
  end_time TIMESTAMP NULL,
  uploaded_by INTEGER NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL,
  rejection_reason TEXT,
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_slots (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES users(id),
  subject VARCHAR(120) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (teacher_id, subject)
);

CREATE TABLE IF NOT EXISTS content_schedules (
  id SERIAL PRIMARY KEY,
  content_id INTEGER UNIQUE NOT NULL REFERENCES contents(id),
  slot_id INTEGER NOT NULL REFERENCES content_slots(id),
  rotation_order INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS broadcast_logs (
  id SERIAL PRIMARY KEY,
  content_id INTEGER NOT NULL REFERENCES contents(id),
  teacher_id INTEGER NOT NULL REFERENCES users(id),
  subject VARCHAR(120) NOT NULL,
  served_at TIMESTAMP DEFAULT NOW()
);
