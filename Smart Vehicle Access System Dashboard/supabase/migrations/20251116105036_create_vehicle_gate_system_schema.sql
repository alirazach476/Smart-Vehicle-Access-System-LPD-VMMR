/*
  # Smart Vehicle Gate System Database Schema

  1. New Tables
    - vehicles: Stores authorized vehicle information
    - vehicle_events: Logs all gate access events
    - system_settings: Configuration and preferences
    - notifications: System alerts and warnings

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (demo system)

  3. Indexes
    - Fast lookups on plate_number and timestamp
*/

CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plate_number text UNIQUE NOT NULL,
  make text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT '',
  image_url text DEFAULT '',
  is_authorized boolean DEFAULT true,
  owner_name text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicle_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  plate_number text NOT NULL,
  make text DEFAULT '',
  model text DEFAULT '',
  confidence numeric DEFAULT 0,
  image_url text DEFAULT '',
  weather_condition text DEFAULT 'Clear',
  temperature numeric,
  status text NOT NULL CHECK (status IN ('allowed', 'denied')),
  gate_action text NOT NULL CHECK (gate_action IN ('opened', 'closed')),
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('unauthorized', 'weather', 'system')),
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON vehicle_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_events_status ON vehicle_events(status);
CREATE INDEX IF NOT EXISTS idx_events_plate ON vehicle_events(plate_number);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read, created_at DESC);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for vehicles"
  ON vehicles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public insert access for vehicles"
  ON vehicles FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public update access for vehicles"
  ON vehicles FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access for vehicles"
  ON vehicles FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access for vehicle_events"
  ON vehicle_events FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public insert access for vehicle_events"
  ON vehicle_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public read access for system_settings"
  ON system_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public update access for system_settings"
  ON system_settings FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public insert access for system_settings"
  ON system_settings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public read access for notifications"
  ON notifications FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public insert access for notifications"
  ON notifications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public update access for notifications"
  ON notifications FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access for notifications"
  ON notifications FOR DELETE
  TO anon, authenticated
  USING (true);