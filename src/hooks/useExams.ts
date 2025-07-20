import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Exam {
  id: string;
  course_code: string;
  course_name: string;
  date: string;
  start_time: string;
  end_time: string;
  duration?: number;
  venue_id?: string;
  expected_students?: number;
  supervisors_needed: number;
  department?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export const useExams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchExams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setExams((data || []) as Exam[]);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast({
        title: "Error",
        description: "Failed to fetch exams",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createExam = async (examData: Omit<Exam, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .insert([examData])
        .select()
        .single();

      if (error) throw error;

      setExams(prev => [...prev, data as Exam]);
      toast({
        title: "Success",
        description: "Exam created successfully"
      });
      return data.id;
    } catch (error) {
      console.error('Error creating exam:', error);
      toast({
        title: "Error",
        description: "Failed to create exam",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateExam = async (id: string, updates: Partial<Exam>) => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setExams(prev => prev.map(exam => exam.id === id ? data as Exam : exam));
      toast({
        title: "Success",
        description: "Exam updated successfully"
      });
      return true;
    } catch (error) {
      console.error('Error updating exam:', error);
      toast({
        title: "Error",
        description: "Failed to update exam",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteExam = async (id: string) => {
    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setExams(prev => prev.filter(exam => exam.id !== id));
      toast({
        title: "Success",
        description: "Exam deleted successfully"
      });
      return true;
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast({
        title: "Error",
        description: "Failed to delete exam",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  return {
    exams,
    loading,
    createExam,
    updateExam,
    deleteExam,
    refetch: fetchExams
  };
};