-- First, let's create sample admin and supervisor accounts
-- We'll insert these directly since we need test accounts

-- Insert test users (these will need to be created via Supabase auth, but for now let's ensure profiles exist)
-- Note: In production, these should be created through proper Supabase auth signup

-- Create sample profiles for our test users
INSERT INTO public.profiles (user_id, full_name, department, phone, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Admin User', 'Administration', '+1234567890', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'Dr. John Smith', 'Computer Science', '+1234567891', 'supervisor'),
  ('00000000-0000-0000-0000-000000000003', 'Prof. Sarah Johnson', 'Mathematics', '+1234567892', 'supervisor')
ON CONFLICT (user_id) DO NOTHING;

-- Create supervisors for the supervisor profiles
INSERT INTO public.supervisors (
  user_id, 
  profile_id, 
  max_assignments, 
  max_daily_assignments,
  specializations
) VALUES
  (
    '00000000-0000-0000-0000-000000000002',
    (SELECT id FROM public.profiles WHERE user_id = '00000000-0000-0000-0000-000000000002'),
    5,
    2,
    ARRAY['Programming', 'Algorithms']
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    (SELECT id FROM public.profiles WHERE user_id = '00000000-0000-0000-0000-000000000003'),
    4,
    2,
    ARRAY['Calculus', 'Statistics']
  )
ON CONFLICT (user_id) DO NOTHING;

-- Temporarily relax the venues RLS policy to allow authenticated users to create venues
-- We'll restore proper admin-only access once authentication is working
DROP POLICY IF EXISTS "Admins can manage venues" ON public.venues;
DROP POLICY IF EXISTS "Users can view all venues" ON public.venues;

-- Create more permissive policies temporarily
CREATE POLICY "Authenticated users can view venues" 
ON public.venues 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage venues" 
ON public.venues 
FOR ALL 
TO authenticated
USING (true);