-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  department TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'supervisor')) DEFAULT 'supervisor',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supervisors table for supervisor-specific data
CREATE TABLE public.supervisors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  max_assignments INTEGER DEFAULT 5,
  max_daily_assignments INTEGER DEFAULT 2,
  total_assignments INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  specializations TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supervisors ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create policies for supervisors
CREATE POLICY "Users can view all supervisors" 
ON public.supervisors 
FOR SELECT 
USING (true);

CREATE POLICY "Supervisors can update their own data" 
ON public.supervisors 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage supervisors" 
ON public.supervisors 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supervisors_updated_at
  BEFORE UPDATE ON public.supervisors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, department, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'department', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'supervisor')
  );
  
  -- If the user is a supervisor, create supervisor record
  IF COALESCE(NEW.raw_user_meta_data ->> 'role', 'supervisor') = 'supervisor' THEN
    INSERT INTO public.supervisors (
      user_id, 
      profile_id, 
      max_assignments, 
      max_daily_assignments,
      specializations
    )
    VALUES (
      NEW.id,
      (SELECT id FROM public.profiles WHERE user_id = NEW.id),
      COALESCE((NEW.raw_user_meta_data ->> 'max_assignments')::integer, 5),
      COALESCE((NEW.raw_user_meta_data ->> 'max_daily_assignments')::integer, 2),
      COALESCE(
        ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data -> 'specializations')),
        '{}'::text[]
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();