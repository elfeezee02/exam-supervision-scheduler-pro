import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Schedule {
  id: string;
  exam_id: string;
  supervisor_id: string;
  assigned_at: string;
  status: 'assigned' | 'confirmed' | 'declined' | 'completed';
  is_main_supervisor: boolean;
  notification_sent: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  // Populated fields from joins
  exam?: {
    id: string;
    course_code: string;
    course_name: string;
    date: string;
    start_time: string;
    end_time: string;
    venue_id?: string;
    supervisors_needed: number;
    status: string;
  };
  supervisor?: {
    id: string;
    profile_id: string;
    max_assignments?: number;
    status: string;
    profile?: {
      full_name: string;
      department: string;
    };
  };
  venue?: {
    id: string;
    name: string;
    building: string;
    location: string;
  };
}

export const useSchedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          exam:exams(
            id,
            course_code,
            course_name,
            date,
            start_time,
            end_time,
            venue_id,
            supervisors_needed,
            status,
            venue:venues(
              id,
              name,
              building,
              location
            )
          ),
          supervisor:supervisors(
            id,
            profile_id,
            max_assignments,
            status,
            profile:profiles(
              full_name,
              department
            )
          )
        `)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      
      // Flatten the venue data from exam.venue to exam level
      const processedData = data?.map(schedule => ({
        ...schedule,
        venue: schedule.exam?.venue || null
      })) || [];
      
      setSchedules(processedData as Schedule[]);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast({
        title: "Error",
        description: "Failed to fetch schedules",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async (scheduleData: Omit<Schedule, 'id' | 'assigned_at' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .insert([scheduleData])
        .select()
        .single();

      if (error) throw error;

      await fetchSchedules(); // Refetch to get joined data
      toast({
        title: "Success",
        description: "Schedule created successfully"
      });
      return data.id;
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create schedule",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateSchedule = async (id: string, updates: Partial<Schedule>) => {
    try {
      const { error } = await supabase
        .from('schedules')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchSchedules(); // Refetch to get updated joined data
      toast({
        title: "Success",
        description: "Schedule updated successfully"
      });
      return true;
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSchedules(prev => prev.filter(schedule => schedule.id !== id));
      toast({
        title: "Success",
        description: "Schedule deleted successfully"
      });
      return true;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive"
      });
      return false;
    }
  };

  const generateSchedule = async () => {
    try {
      setLoading(true);
      
      // Fetch exams that need scheduling
      const { data: examsData, error: examsError } = await supabase
        .from('exams')
        .select('*')
        .eq('status', 'scheduled');

      if (examsError) throw examsError;

      // Fetch available supervisors
      const { data: supervisorsData, error: supervisorsError } = await supabase
        .from('supervisors')
        .select('*')
        .eq('status', 'active');

      if (supervisorsError) throw supervisorsError;

      // Simple scheduling algorithm - assign first available supervisors
      const newSchedules = [];
      for (const exam of examsData || []) {
        const availableSupervisors = supervisorsData?.slice(0, exam.supervisors_needed) || [];
        
        for (let i = 0; i < availableSupervisors.length; i++) {
          const supervisor = availableSupervisors[i];
          newSchedules.push({
            exam_id: exam.id,
            supervisor_id: supervisor.id,
            status: 'assigned' as const,
            is_main_supervisor: i === 0,
            notification_sent: false
          });
        }
      }

      if (newSchedules.length > 0) {
        const { error } = await supabase
          .from('schedules')
          .insert(newSchedules);

        if (error) throw error;

        await fetchSchedules();
        toast({
          title: "Success",
          description: `Generated ${newSchedules.length} schedule assignments`
        });
      } else {
        toast({
          title: "Info",
          description: "No exams need scheduling"
        });
      }
    } catch (error) {
      console.error('Error generating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to generate schedule",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return {
    schedules,
    loading,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    generateSchedule,
    refetch: fetchSchedules
  };
};