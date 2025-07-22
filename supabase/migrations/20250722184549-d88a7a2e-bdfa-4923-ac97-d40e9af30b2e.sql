-- Update RLS policy for exams table to allow users to create exams
DROP POLICY IF EXISTS "Admins can manage exams" ON public.exams;
DROP POLICY IF EXISTS "Users can view all exams" ON public.exams;

-- Create policies that allow anyone to manage exams for now
-- In production, you would want to restrict this to admins only
CREATE POLICY "Anyone can view exams" 
ON public.exams 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create exams" 
ON public.exams 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update exams" 
ON public.exams 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete exams" 
ON public.exams 
FOR DELETE 
USING (true);