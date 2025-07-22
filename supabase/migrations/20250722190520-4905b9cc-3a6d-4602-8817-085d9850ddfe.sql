-- Update RLS policy for schedules table to allow schedule creation
DROP POLICY IF EXISTS "Admins can manage schedules" ON public.schedules;
DROP POLICY IF EXISTS "Supervisors can view their own schedules" ON public.schedules;
DROP POLICY IF EXISTS "Users can view all schedules" ON public.schedules;

-- Create policies that allow anyone to manage schedules for now
CREATE POLICY "Anyone can view schedules" 
ON public.schedules 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create schedules" 
ON public.schedules 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update schedules" 
ON public.schedules 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete schedules" 
ON public.schedules 
FOR DELETE 
USING (true);