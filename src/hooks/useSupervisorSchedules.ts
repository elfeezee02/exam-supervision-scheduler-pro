import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

export interface SupervisorSchedule {
  id: string;
  exam_id: string;
  supervisor_id: string;
  assigned_at: string;
  status: 'assigned' | 'confirmed' | 'declined' | 'completed';
  is_main_supervisor: boolean;
  notification_sent: boolean;
  notes?: string;
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
    venue?: {
      id: string;
      name: string;
      building: string;
      location: string;
    };
  };
}

export const useSupervisorSchedules = () => {
  const [schedules, setSchedules] = useState<SupervisorSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { authUser } = useAuth();

  const fetchSchedules = async () => {
    if (!authUser?.id) return;

    try {
      setLoading(true);
      
      // First get supervisor ID from profiles/supervisors table
      const { data: supervisorData, error: supervisorError } = await supabase
        .from('supervisors')
        .select('id')
        .eq('user_id', authUser.id)
        .single();

      if (supervisorError) throw supervisorError;

      // Then fetch schedules for this supervisor
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
          )
        `)
        .eq('supervisor_id', supervisorData.id)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      
      // Flatten the venue data from exam.venue to exam level
      const processedData = data?.map(schedule => ({
        ...schedule,
        exam: {
          ...schedule.exam,
          venue: schedule.exam?.venue || null
        }
      })) || [];
      
      setSchedules(processedData as SupervisorSchedule[]);
    } catch (error) {
      console.error('Error fetching supervisor schedules:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your schedules",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateScheduleStatus = async (scheduleId: string, status: SupervisorSchedule['status'], notes?: string) => {
    try {
      const updates: any = { status };
      if (notes !== undefined) {
        updates.notes = notes;
      }

      const { error } = await supabase
        .from('schedules')
        .update(updates)
        .eq('id', scheduleId);

      if (error) throw error;

      // Update local state
      setSchedules(prev => prev.map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, status, notes: notes || schedule.notes }
          : schedule
      ));

      toast({
        title: "Success",
        description: "Schedule status updated successfully"
      });
      return true;
    } catch (error) {
      console.error('Error updating schedule status:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule status",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (authUser?.id) {
      fetchSchedules();
    }
  }, [authUser?.id]);

  return {
    schedules,
    loading,
    updateScheduleStatus,
    refetch: fetchSchedules
  };
};