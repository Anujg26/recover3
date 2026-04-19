-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Roles
CREATE TYPE user_role AS ENUM ('practitioner', 'patient');

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'patient',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Practitioners table
CREATE TABLE IF NOT EXISTS public.practitioners (
    id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    clinic_name TEXT,
    specialization TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    date_of_birth DATE,
    gender TEXT,
    recovery_score_current INTEGER DEFAULT 0,
    recovery_grade TEXT DEFAULT 'F',
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Practitioner-Patient Relationship
CREATE TABLE IF NOT EXISTS public.practitioner_patients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    practitioner_id UUID REFERENCES public.practitioners(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(practitioner_id, patient_id)
);

-- Sessions
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    practitioner_id UUID REFERENCES public.practitioners(id),
    patient_id UUID REFERENCES public.patients(id),
    notes TEXT,
    focus_areas TEXT[],
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Range of Motion Measurements
CREATE TABLE IF NOT EXISTS public.rom_measurements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id),
    joint TEXT NOT NULL, -- e.g., 'shoulder'
    side TEXT NOT NULL, -- 'left', 'right'
    range_of_motion_degrees NUMERIC NOT NULL,
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recovery Tracks (The Plan)
CREATE TABLE IF NOT EXISTS public.recovery_tracks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id),
    practitioner_id UUID REFERENCES public.practitioners(id),
    title TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recovery Tasks
CREATE TABLE IF NOT EXISTS public.recovery_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    track_id UUID REFERENCES public.recovery_tracks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'stretch', 'mobility', 'sauna', etc.
    time_of_day TEXT NOT NULL, -- 'morning', 'pre-workout', 'post-workout', 'evening'
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Completions
CREATE TABLE IF NOT EXISTS public.task_completions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES public.recovery_tasks(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recovery Logs (Manual Logs)
CREATE TABLE IF NOT EXISTS public.recovery_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id),
    activity_type TEXT NOT NULL,
    duration_minutes INTEGER,
    intensity INTEGER, -- 1-10
    notes TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id),
    activity_type TEXT NOT NULL, -- 'lift', 'cardio', 'sport'
    duration_minutes INTEGER,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check-ins
CREATE TABLE IF NOT EXISTS public.checkins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id),
    soreness INTEGER, -- 1-10
    stiffness INTEGER, -- 1-10
    fatigue INTEGER, -- 1-10
    confidence INTEGER, -- 1-10
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adherence Snapshots
CREATE TABLE IF NOT EXISTS public.adherence_snapshots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id),
    date DATE NOT NULL,
    adherence_percentage NUMERIC,
    tasks_completed INTEGER,
    tasks_required INTEGER,
    UNIQUE(patient_id, date)
);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioner_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rom_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adherence_snapshots ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Placeholder - adjust for production)
-- Patients see own data
-- Practitioners see assigned patients' data
