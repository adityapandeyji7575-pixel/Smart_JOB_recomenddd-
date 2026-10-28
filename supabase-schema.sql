-- ==========================================
-- SMART HIRE DATABASE SCHEMA FOR SUPABASE
-- ==========================================

-- 1. Create PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    qualification TEXT,
    skills TEXT,
    experience TEXT,
    preferred_location TEXT,
    preferred_role TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create JOBS Table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    salary TEXT NOT NULL,
    skills TEXT NOT NULL,
    qualification TEXT NOT NULL,
    experience TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create APPLICATIONS Table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'Applied',
    UNIQUE(user_id, job_id)
);

-- Row Level Security (RLS) Configuration
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public jobs viewable by everyone" ON public.jobs;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can view own applications" ON public.applications;

-- Create Policies
CREATE POLICY "Public jobs viewable by everyone" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own applications" ON public.applications FOR SELECT USING (auth.uid() = user_id);

-- Create a view to inspect all registered users with profile details
CREATE VIEW IF NOT EXISTS public.registered_users AS
SELECT
    auth.users.id AS user_id,
    auth.users.email,
    auth.users.created_at AS auth_created_at,
    auth.users.confirmed_at,
    auth.users.last_sign_in_at,
    public.profiles.full_name,
    public.profiles.qualification,
    public.profiles.skills,
    public.profiles.experience,
    public.profiles.preferred_location,
    public.profiles.preferred_role,
    public.profiles.created_at AS profile_created_at
FROM auth.users
LEFT JOIN public.profiles ON auth.users.id = public.profiles.user_id;

-- Clean old jobs before re-inserting sample jobs
TRUNCATE TABLE public.jobs RESTART IDENTITY CASCADE;

-- Insert 10 Sample Jobs required by user
INSERT INTO public.jobs (title, company, location, salary, skills, qualification, experience, description) VALUES
('Python Developer', 'ABC Technologies', 'Noida', '4–6 LPA', 'Python, Flask, SQL, HTML, CSS', 'B.Tech / BCA', 'Fresher', 'We are looking for an enthusiastic Python Developer to build dynamic backend services and manage database queries for our tech products.'),
('Frontend Developer', 'WebCraft Studio', 'Delhi / Remote', '3.5–5 LPA', 'HTML, CSS, JavaScript, React', 'B.Tech / BCA / BSc', 'Fresher', 'Responsible for building sleek visual web elements, maintaining responsive web design, and delivering seamless user experience.'),
('Backend Developer', 'DataCore Systems', 'Gurugram', '5–7 LPA', 'Node.js, Express, SQL, MongoDB', 'B.Tech / MCA', '0–1 Years', 'Develop reliable RESTful APIs, manage server-side security, and build microservice architectures for high-traffic platforms.'),
('Data Analyst', 'Insight Analytics', 'Noida', '4.5–6.5 LPA', 'Python, SQL, Excel, PowerBI', 'B.Tech / BSc Stats', 'Fresher', 'Extract business insights from raw data, create analytical reports, and maintain SQL dashboards for enterprise clients.'),
('Java Developer', 'Apex Solutions', 'Bengaluru / Remote', '5–8 LPA', 'Java, Spring Boot, MySQL, Git', 'B.Tech / MCA', '0–2 Years', 'Build robust, scalable Java enterprise applications using Spring Boot microservices and object-oriented principles.'),
('Web Developer', 'Digital Creations', 'Delhi', '3–4.5 LPA', 'HTML, CSS, JavaScript, PHP, MySQL', 'BCA / Diploma', 'Fresher', 'Create client websites, integrate front-end design mockups, maintain dynamic forms, and optimize cross-browser performance.'),
('Software Engineer', 'InnovateX Labs', 'Gurugram', '6–9 LPA', 'Python, C++, SQL, Algorithms', 'B.Tech CS/IT', 'Fresher', 'Work directly with core product development teams to design core software architecture and optimize system speed.'),
('Database Developer', 'CloudData Inc', 'Noida', '4.5–6 LPA', 'SQL, PostgreSQL, Database Optimization, Python', 'B.Tech / MCA', '1 Year', 'Architect SQL databases, construct stored procedures, fine-tune query performance, and ensure automated database backups.'),
('UI/UX Designer', 'Creative Hub', 'Remote', '4–6 LPA', 'Figma, Wireframing, Prototyping, HTML, CSS', 'Graduation / Design Degree', 'Fresher', 'Design modern user interfaces, conduct user research, build interactive wireframes, and collaborate closely with developers.'),
('Full Stack Developer', 'Nexus Tech Solutions', 'Noida', '6–8.5 LPA', 'HTML, CSS, JavaScript, Node.js, Python, SQL', 'B.Tech / MCA', '0–1 Years', 'Oversee end-to-end web engineering, from crafting responsive frontends to building efficient server-side database handlers.');
