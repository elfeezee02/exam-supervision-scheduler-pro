import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface SupervisorData {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  department: string;
  phone?: string;
  max_assignments: number;
  max_daily_assignments: number;
  total_assignments: number;
  status: 'active' | 'inactive';
  specializations: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateSupervisorData {
  full_name: string;
  email: string;
  password: string;
  department: string;
  phone?: string;
  max_assignments: number;
  max_daily_assignments: number;
  specializations: string[];
}

export function useSupervisors() {
  const [supervisors, setSupervisors] = useState<SupervisorData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSupervisors = async () => {
    try {
      const { data, error } = await supabase
        .from('supervisors')
        .select(`
          *,
          profiles!inner(
            user_id,
            full_name,
            department,
            phone,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user emails from auth metadata
      const supervisorsWithEmails = await Promise.all(
        data.map(async (supervisor) => {
          const { data: authUser } = await supabase.auth.admin.getUserById(
            supervisor.user_id
          );
          
          return {
            id: supervisor.id,
            user_id: supervisor.user_id,
            full_name: supervisor.profiles.full_name,
            email: authUser?.user?.email || '',
            department: supervisor.profiles.department,
            phone: supervisor.profiles.phone,
            max_assignments: supervisor.max_assignments,
            max_daily_assignments: supervisor.max_daily_assignments,
            total_assignments: supervisor.total_assignments,
            status: supervisor.status as 'active' | 'inactive',
            specializations: supervisor.specializations,
            created_at: supervisor.created_at,
            updated_at: supervisor.updated_at,
          };
        })
      );

      setSupervisors(supervisorsWithEmails);
    } catch (error) {
      console.error('Error fetching supervisors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch supervisors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSupervisor = async (data: CreateSupervisorData) => {
    try {
      // Create auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            department: data.department,
            phone: data.phone,
            role: 'supervisor',
            max_assignments: data.max_assignments,
            max_daily_assignments: data.max_daily_assignments,
            specializations: data.specializations,
          },
        },
      });

      if (authError) throw authError;

      toast({
        title: "Success",
        description: "Supervisor created successfully",
      });

      // Refresh supervisors list
      fetchSupervisors();
      
      return { success: true };
    } catch (error: any) {
      console.error('Error creating supervisor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create supervisor",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const updateSupervisor = async (id: string, updateData: Partial<CreateSupervisorData>) => {
    try {
      const supervisor = supervisors.find(s => s.id === id);
      if (!supervisor) throw new Error('Supervisor not found');

      // Update profile if needed
      if (updateData.full_name || updateData.department || updateData.phone) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: updateData.full_name,
            department: updateData.department,
            phone: updateData.phone,
          })
          .eq('user_id', supervisor.user_id);

        if (profileError) throw profileError;
      }

      // Update supervisor data
      const { error: supervisorError } = await supabase
        .from('supervisors')
        .update({
          max_assignments: updateData.max_assignments,
          max_daily_assignments: updateData.max_daily_assignments,
          specializations: updateData.specializations,
        })
        .eq('id', id);

      if (supervisorError) throw supervisorError;

      toast({
        title: "Success",
        description: "Supervisor updated successfully",
      });

      // Refresh supervisors list
      fetchSupervisors();
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating supervisor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update supervisor",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const deleteSupervisor = async (id: string) => {
    try {
      const supervisor = supervisors.find(s => s.id === id);
      if (!supervisor) throw new Error('Supervisor not found');

      // Delete the auth user (this will cascade to profiles and supervisors)
      const { error: authError } = await supabase.auth.admin.deleteUser(
        supervisor.user_id
      );

      if (authError) throw authError;

      toast({
        title: "Success",
        description: "Supervisor deleted successfully",
      });

      // Refresh supervisors list
      fetchSupervisors();
      
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting supervisor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete supervisor",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetchSupervisors();
  }, []);

  return {
    supervisors,
    loading,
    createSupervisor,
    updateSupervisor,
    deleteSupervisor,
    refetch: fetchSupervisors,
  };
}