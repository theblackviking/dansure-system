-- ============================================================
-- DANSURE ENGINEERING GROUP LIMITED - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CLIENTS TABLE
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INVENTORY TABLE
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  qty INTEGER NOT NULL DEFAULT 0,
  min_qty INTEGER NOT NULL DEFAULT 0,
  cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RECORDS TABLE (sales & services)
CREATE TABLE IF NOT EXISTS records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  type TEXT NOT NULL CHECK (type IN ('sale', 'service')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  subtotal NUMERIC(12,2) DEFAULT 0,
  discount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('paid', 'partial', 'credit')),
  amount_paid NUMERIC(12,2) DEFAULT 0,
  balance NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RECORD ITEMS TABLE
CREATE TABLE IF NOT EXISTS record_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID REFERENCES records(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES inventory(id),
  description TEXT NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0
);

-- EXPENDITURES TABLE
CREATE TABLE IF NOT EXISTS expenditures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) DEFAULT 0,
  transport_cost NUMERIC(12,2) DEFAULT 0,
  supplier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- FUNCTION: decrement inventory qty
CREATE OR REPLACE FUNCTION decrement_inventory(p_id UUID, p_qty INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE inventory SET qty = GREATEST(0, qty - p_qty) WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SEED DEFAULT USERS
-- (passwords: admin=dansure2024, staff=staff123)
-- ============================================================
INSERT INTO users (username, name, password_hash, role) VALUES
  ('admin', 'Admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin'),
  ('staff', 'Staff', '$2a$10$GkCxHGYaxvnHMjxH4y4AaODdIrBNrHj3H0R7P6Hq0I7HhMBe.sFW', 'staff')
ON CONFLICT (username) DO NOTHING;

-- ============================================================
-- SEED SAMPLE INVENTORY
-- ============================================================
INSERT INTO inventory (name, category, qty, min_qty, cost, price) VALUES
  ('6kg DCP Extinguisher', 'Extinguisher', 12, 5, 180, 280),
  ('2kg CO2 Extinguisher', 'Extinguisher', 3, 5, 220, 350),
  ('9L Water Extinguisher', 'Extinguisher', 8, 4, 150, 240),
  ('Fire Extinguisher Head 6kg', 'Service Part', 6, 5, 35, 80),
  ('Safety Helmet', 'Safety Gear', 15, 8, 25, 60),
  ('Fire Exit Sign', 'Signage', 20, 10, 15, 40),
  ('Assembly Point Sign', 'Signage', 4, 10, 12, 35),
  ('Smoke Detector', 'Gadget', 9, 5, 65, 140);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Disable for service role access
-- The app uses the service role key which bypasses RLS
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenditures ENABLE ROW LEVEL SECURITY;
