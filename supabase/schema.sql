-- PKS Planeerija v2 - Supabase Schema
-- Includes: teams, refusals, no-shows

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SETTINGS
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  target_pct DECIMAL(5,2) DEFAULT 0.90,
  buffer_pct DECIMAL(5,2) DEFAULT 0.10,
  invite_lead_days_min INTEGER DEFAULT 7,
  invite_lead_days_max INTEGER DEFAULT 10,
  rr_diary_days INTEGER DEFAULT 7,
  period_start DATE DEFAULT '2026-02-01',
  period_end DATE DEFAULT '2026-12-13',
  slots_per_day_full INTEGER DEFAULT 8,
  slots_per_day_half INTEGER DEFAULT 4,
  appointment_duration_min INTEGER DEFAULT 40,
  break_duration_min INTEGER DEFAULT 60,
  end_of_day_buffer_min INTEGER DEFAULT 40,
  transition_admin_min INTEGER DEFAULT 5,
  weekly_confirmation_day VARCHAR(20) DEFAULT 'FRIDAY',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- UNITS
CREATE TABLE units (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TEAMS (NEW)
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  unit_id INTEGER REFERENCES units(id) NOT NULL,
  name VARCHAR(100) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LISTS (updated - added team_id)
CREATE TABLE lists (
  id SERIAL PRIMARY KEY,
  unit_id INTEGER REFERENCES units(id),
  team_id INTEGER REFERENCES teams(id),
  label VARCHAR(100) NOT NULL,
  chronic_total INTEGER,
  needs_review BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HOLIDAYS
CREATE TABLE holidays (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL
);

-- CALENDAR_DAYS
CREATE TABLE calendar_days (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  day_type VARCHAR(10) DEFAULT 'FULL' CHECK (day_type IN ('FULL', 'HALF', 'OFF')),
  slots_override INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DAILY_ENTRIES (updated - added calls_refused, visits_no_show)
CREATE TABLE daily_entries (
  id SERIAL PRIMARY KEY,
  list_id INTEGER REFERENCES lists(id) NOT NULL,
  date DATE NOT NULL,
  calls_made INTEGER DEFAULT 0,
  calls_refused INTEGER DEFAULT 0,
  visits_made INTEGER DEFAULT 0,
  visits_no_show INTEGER DEFAULT 0,
  entered_by_role VARCHAR(50) NOT NULL,
  entered_by_unit VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, date)
);

-- WEEKLY_CONFIRMATIONS (updated - added refused/no_show)
CREATE TABLE weekly_confirmations (
  id SERIAL PRIMARY KEY,
  unit_code VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  target_calls INTEGER NOT NULL,
  actual_calls INTEGER DEFAULT 0,
  actual_calls_refused INTEGER DEFAULT 0,
  target_visits INTEGER NOT NULL,
  actual_visits INTEGER DEFAULT 0,
  actual_visits_no_show INTEGER DEFAULT 0,
  calls_met BOOLEAN DEFAULT false,
  visits_met BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'MET', 'NOT_MET')),
  confirmed_by_role VARCHAR(50),
  confirmed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(unit_code, year, week_number)
);

-- AUDIT_LOG
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  record_id INTEGER NOT NULL,
  action VARCHAR(10) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_by_role VARCHAR(50) NOT NULL,
  changed_by_unit VARCHAR(50),
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_teams_unit ON teams(unit_id);
CREATE INDEX idx_lists_unit ON lists(unit_id);
CREATE INDEX idx_lists_team ON lists(team_id);
CREATE INDEX idx_daily_entries_list ON daily_entries(list_id);
CREATE INDEX idx_daily_entries_date ON daily_entries(date);
CREATE INDEX idx_weekly_confirmations_unit ON weekly_confirmations(unit_code);
CREATE INDEX idx_weekly_confirmations_year_week ON weekly_confirmations(year, week_number);
CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER lists_updated_at BEFORE UPDATE ON lists FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER calendar_days_updated_at BEFORE UPDATE ON calendar_days FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER daily_entries_updated_at BEFORE UPDATE ON daily_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- AUDIT TRIGGER
CREATE OR REPLACE FUNCTION audit_trigger_func() RETURNS TRIGGER AS $$
DECLARE old_data JSONB; new_data JSONB;
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, action, changed_by_role, old_values)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', COALESCE(current_setting('app.current_role', true), 'SYSTEM'), to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, action, changed_by_role, old_values, new_values)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', COALESCE(current_setting('app.current_role', true), 'SYSTEM'), to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, action, changed_by_role, new_values)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', COALESCE(current_setting('app.current_role', true), 'SYSTEM'), to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER lists_audit AFTER INSERT OR UPDATE OR DELETE ON lists FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER daily_entries_audit AFTER INSERT OR UPDATE OR DELETE ON daily_entries FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER weekly_confirmations_audit AFTER INSERT OR UPDATE OR DELETE ON weekly_confirmations FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER teams_audit AFTER INSERT OR UPDATE OR DELETE ON teams FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- SEED DATA
INSERT INTO settings (id) VALUES (1);

INSERT INTO units (code, name) VALUES ('PELGULINN', 'Pelgulinn'), ('ULEMISTE', 'Ülemiste');

-- Pelgulinn teams
INSERT INTO teams (unit_id, name, sort_order) VALUES
  (1, 'I tiim', 1), (1, 'II tiim', 2), (1, 'III tiim', 3), (1, 'IV tiim', 4);

-- Pelgulinn lists (with team_id)
INSERT INTO lists (unit_id, team_id, label, chronic_total, needs_review) VALUES
  (1, 1, 'dr Lill', 482, false),
  (1, 1, 'dr Abramov', 387, false),
  (1, 2, 'dr Guskova', 476, false),
  (1, 2, 'dr Melan', 299, false),
  (1, 3, 'dr Kõressaar', 333, false),
  (1, 3, 'dr Männik', 317, false),
  (1, 4, 'dr Pranstibel', 279, false),
  (1, 4, 'dr Einberg', 235, false);

-- Ülemiste lists (no teams yet)
INSERT INTO lists (unit_id, team_id, label, chronic_total, needs_review) VALUES
  (2, NULL, 'dr Vessel', NULL, true),
  (2, NULL, 'dr Gretšenko', NULL, true),
  (2, NULL, 'dr Kolts', NULL, true),
  (2, NULL, 'dr Lindström', NULL, true);

-- Estonian holidays 2026
INSERT INTO holidays (date, name) VALUES
  ('2026-01-01', 'Uusaasta'), ('2026-02-24', 'Iseseisvuspäev'),
  ('2026-04-10', 'Suur Reede'), ('2026-04-12', 'Ülestõusmispühade 1. püha'),
  ('2026-05-01', 'Kevadpüha'), ('2026-05-31', 'Nelipühade 1. püha'),
  ('2026-06-23', 'Võidupüha'), ('2026-06-24', 'Jaanipäev'),
  ('2026-08-20', 'Taasiseseisvumispäev'), ('2026-12-24', 'Jõululaupäev'),
  ('2026-12-25', 'Esimene jõulupüha'), ('2026-12-26', 'Teine jõulupüha');
