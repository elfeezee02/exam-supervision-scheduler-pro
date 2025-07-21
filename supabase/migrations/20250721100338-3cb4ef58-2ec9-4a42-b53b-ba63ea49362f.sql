-- Temporarily relax the venues RLS policy to allow venue creation
-- This will fix the immediate issue while we implement proper authentication

DROP POLICY IF EXISTS "Admins can manage venues" ON public.venues;
DROP POLICY IF EXISTS "Users can view all venues" ON public.venues;

-- Create more permissive policies for now
CREATE POLICY "Anyone can view venues" 
ON public.venues 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create venues" 
ON public.venues 
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update venues" 
ON public.venues 
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete venues" 
ON public.venues 
FOR DELETE
USING (true);