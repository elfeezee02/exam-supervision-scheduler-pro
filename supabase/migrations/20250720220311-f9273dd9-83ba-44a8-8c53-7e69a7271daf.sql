-- Create exams table
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_code TEXT NOT NULL,
  course_name TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration INTEGER,
  venue_id UUID,
  expected_students INTEGER,
  supervisors_needed INTEGER NOT NULL DEFAULT 2,
  department TEXT,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')) DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create venues table
CREATE TABLE public.venues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  building TEXT NOT NULL,
  floor TEXT,
  type TEXT CHECK (type IN ('classroom', 'hall', 'lab', 'auditorium')),
  equipment TEXT,
  status TEXT NOT NULL CHECK (status IN ('available', 'unavailable', 'maintenance')) DEFAULT 'available',
  location TEXT NOT NULL,
  facilities TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create schedules table
CREATE TABLE public.schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  supervisor_id UUID NOT NULL REFERENCES public.supervisors(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('assigned', 'confirmed', 'declined', 'completed')) DEFAULT 'assigned',
  is_main_supervisor BOOLEAN NOT NULL DEFAULT false,
  notification_sent BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key for venue_id in exams after venues table is created
ALTER TABLE public.exams ADD CONSTRAINT fk_exams_venue FOREIGN KEY (venue_id) REFERENCES public.venues(id);

-- Enable Row Level Security
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for exams
CREATE POLICY "Users can view all exams" 
ON public.exams 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage exams" 
ON public.exams 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create policies for venues
CREATE POLICY "Users can view all venues" 
ON public.venues 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage venues" 
ON public.venues 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create policies for schedules
CREATE POLICY "Users can view all schedules" 
ON public.schedules 
FOR SELECT 
USING (true);

CREATE POLICY "Supervisors can view their own schedules" 
ON public.schedules 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.supervisors 
    WHERE user_id = auth.uid() AND id = supervisor_id
  )
);

CREATE POLICY "Admins can manage schedules" 
ON public.schedules 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON public.venues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON public.schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_exams_date ON public.exams(date);
CREATE INDEX idx_exams_venue_id ON public.exams(venue_id);
CREATE INDEX idx_schedules_exam_id ON public.schedules(exam_id);
CREATE INDEX idx_schedules_supervisor_id ON public.schedules(supervisor_id);