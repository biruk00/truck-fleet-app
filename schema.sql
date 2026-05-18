-- ==========================================================
-- GS TRADING FLEET MANAGEMENT DATABASE MIGRATION SYSTEM
-- ==========================================================
-- This SQL script defines the complete tables, functions, triggers,
-- and Row Level Security (RLS) policies required for Fleet Management.
-- You can run this directly in the Supabase SQL Editor.
-- ==========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER ROLES & PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    assigned_plate TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'driver')) DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FLEET TRUCKS TABLE
CREATE TABLE IF NOT EXISTS public.trucks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_no TEXT UNIQUE NOT NULL,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'Available',
    from_location TEXT,
    destination TEXT,
    current_location TEXT,
    note TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for high-performance sorting and searches
CREATE INDEX IF NOT EXISTS idx_trucks_plate_no ON public.trucks(plate_no);
CREATE INDEX IF NOT EXISTS idx_trucks_category ON public.trucks(category);
CREATE INDEX IF NOT EXISTS idx_trucks_status ON public.trucks(status);

-- 4. FLEET TRUCKS HISTORY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.trucks_history (
    history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_no TEXT NOT NULL,
    category TEXT,
    status TEXT NOT NULL,
    from_location TEXT,
    destination TEXT,
    current_location TEXT,
    note TEXT,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trucks_history_plate_no ON public.trucks_history(plate_no);
CREATE INDEX IF NOT EXISTS idx_trucks_history_changed_at ON public.trucks_history(changed_at);

-- 5. AUTOMATED HISTORY TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.record_truck_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log history if critical status, locations or remarks changed
    IF (TG_OP = 'INSERT') OR 
       (NEW.status IS DISTINCT FROM OLD.status) OR 
       (NEW.current_location IS DISTINCT FROM OLD.current_location) OR 
       (NEW.note IS DISTINCT FROM OLD.note) OR
       (NEW.from_location IS DISTINCT FROM OLD.from_location) OR
       (NEW.destination IS DISTINCT FROM OLD.destination) THEN
       
        INSERT INTO public.trucks_history (
            plate_no,
            category,
            status,
            from_location,
            destination,
            current_location,
            note,
            changed_at
        ) VALUES (
            NEW.plate_no,
            NEW.category,
            NEW.status,
            NEW.from_location,
            NEW.destination,
            NEW.current_location,
            NEW.note,
            NOW()
        );
    END IF;
    
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to Trucks Table
DROP TRIGGER IF EXISTS trg_trucks_history ON public.trucks;
CREATE TRIGGER trg_trucks_history
AFTER INSERT OR UPDATE ON public.trucks
FOR EACH ROW
EXECUTE FUNCTION public.record_truck_history();

-- 6. PROFILE SYNC TRIGGER FROM AUTH.USERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. ENABLE ROW-LEVEL SECURITY (RLS)
ALTER TABLE public.trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trucks_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 8. SECURITY POLICIES (RLS Policies)

-- A. USER_ROLES POLICIES
CREATE POLICY "Allow users to read roles" 
ON public.user_roles FOR SELECT 
USING (true);

CREATE POLICY "Allow only admins to manage roles" 
ON public.user_roles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  )
);

-- B. TRUCKS POLICIES
CREATE POLICY "Allow public read access to active fleet" 
ON public.trucks FOR SELECT 
USING (true);

CREATE POLICY "Allow authorized editors and admins to edit trucks" 
ON public.trucks FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() AND user_roles.role IN ('admin', 'user')
  )
);

-- C. TRUCKS HISTORY POLICIES
CREATE POLICY "Allow public read access to logs" 
ON public.trucks_history FOR SELECT 
USING (true);

CREATE POLICY "Allow admins to delete history logs" 
ON public.trucks_history FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  )
);
