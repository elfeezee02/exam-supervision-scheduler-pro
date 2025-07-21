import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Venue {
  id: string;
  name: string;
  capacity: number;
  building: string;
  floor?: string;
  type?: 'classroom' | 'hall' | 'lab' | 'auditorium';
  equipment?: string;
  status: 'available' | 'unavailable' | 'maintenance';
  location: string;
  facilities: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useVenues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setVenues((data || []) as Venue[]);
    } catch (error) {
      console.error('Error fetching venues:', error);
      toast({
        title: "Error",
        description: "Failed to fetch venues",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createVenue = async (venueData: Omit<Venue, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .insert([venueData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setVenues(prev => [...prev, data as Venue]);
      toast({
        title: "Success",
        description: "Venue created successfully"
      });
      return data.id;
    } catch (error) {
      console.error('Error creating venue:', error);
      toast({
        title: "Error",
        description: `Failed to create venue: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateVenue = async (id: string, updates: Partial<Venue>) => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setVenues(prev => prev.map(venue => venue.id === id ? data as Venue : venue));
      toast({
        title: "Success",
        description: "Venue updated successfully"
      });
      return true;
    } catch (error) {
      console.error('Error updating venue:', error);
      toast({
        title: "Error",
        description: "Failed to update venue",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteVenue = async (id: string) => {
    try {
      const { error } = await supabase
        .from('venues')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setVenues(prev => prev.filter(venue => venue.id !== id));
      toast({
        title: "Success",
        description: "Venue deleted successfully"
      });
      return true;
    } catch (error) {
      console.error('Error deleting venue:', error);
      toast({
        title: "Error",
        description: "Failed to delete venue",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  return {
    venues,
    loading,
    createVenue,
    updateVenue,
    deleteVenue,
    refetch: fetchVenues
  };
};