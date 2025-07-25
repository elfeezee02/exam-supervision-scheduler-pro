import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Supervisor, Exam, Venue, Availability, SupervisionSchedule, Schedule, DashboardStats, ActivityLog, SchedulingConflict } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ESSContextType {
  currentUser: User | null;
  users: User[];
  supervisors: Supervisor[];
  exams: Exam[];
  venues: Venue[];
  availabilities: Availability[];
  schedules: SupervisionSchedule[];
  conflicts: SchedulingConflict[];
  activityLog: ActivityLog[];
  dashboardStats: DashboardStats;
  loading: boolean;

  login: (username: string, password: string) => Promise<boolean>;
  loginAdmin: (username: string, password: string) => Promise<boolean>;
  loginSupervisor: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: Partial<User>) => Promise<boolean>;
  addExam: (exam: Partial<Exam>) => Promise<string>;
  updateExam: (id: string, updates: Partial<Exam>) => Promise<boolean>;
  deleteExam: (id: string) => Promise<boolean>;
  addSupervisor: (supervisor: Partial<Supervisor>) => Promise<string>;
  updateSupervisor: (id: string, updates: Partial<Supervisor>) => Promise<boolean>;
  deleteSupervisor: (id: string) => Promise<boolean>;
  addVenue: (venue: Partial<Venue>) => Promise<string>;
  updateVenue: (id: string, updates: Partial<Venue>) => Promise<boolean>;
  deleteVenue: (id: string) => Promise<boolean>;
  generateSchedule: () => Promise<void>;
  setAvailability: (supervisorId: string, availability: Partial<Availability>) => Promise<boolean>;
  autoAssignSupervisors: (examId: string) => Promise<boolean>;
  manualAssignSupervisor: (examId: string, supervisorId: string) => Promise<boolean>;
  removeAssignment: (scheduleId: string) => Promise<boolean>;
  sendNotifications: (scheduleIds: string[]) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const ESSContext = createContext<ESSContextType | null>(null);

export const useESSS = () => {
  const context = useContext(ESSContext);
  if (!context) {
    throw new Error('useESSS must be used within an ESSProvider');
  }
  return context;
};

const STORAGE_KEYS = {
  USERS: 'esss_users',
  EXAMS: 'esss_exams',
  VENUES: 'esss_venues',
  AVAILABILITIES: 'esss_availabilities',
  SCHEDULES: 'esss_schedules',
  CURRENT_USER: 'esss_current_user',
  ACTIVITY_LOG: 'esss_activity_log'
};

const saveToStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const loadFromStorage = (key: string, defaultValue: any) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export const ESSProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => 
    loadFromStorage(STORAGE_KEYS.CURRENT_USER, null)
  );
  const [users, setUsers] = useState<User[]>(() => 
    loadFromStorage(STORAGE_KEYS.USERS, [])
  );
  const [exams, setExams] = useState<Exam[]>(() => 
    loadFromStorage(STORAGE_KEYS.EXAMS, [])
  );
  const [venues, setVenues] = useState<Venue[]>(() => 
    loadFromStorage(STORAGE_KEYS.VENUES, [])
  );
  const [availabilities, setAvailabilities] = useState<Availability[]>(() => 
    loadFromStorage(STORAGE_KEYS.AVAILABILITIES, [])
  );
  const [schedules, setSchedules] = useState<SupervisionSchedule[]>(() => 
    loadFromStorage(STORAGE_KEYS.SCHEDULES, [])
  );
  const [activityLog, setActivityLog] = useState<ActivityLog[]>(() => 
    loadFromStorage(STORAGE_KEYS.ACTIVITY_LOG, [])
  );
  const [conflicts, setConflicts] = useState<SchedulingConflict[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const supervisors = users.filter(user => user.role === 'supervisor') as Supervisor[];
  
  const dashboardStats: DashboardStats = {
    totalExams: exams.length,
    totalSupervisors: supervisors.length,
    totalVenues: venues.length,
    scheduledExams: exams.filter(e => e.status === 'scheduled').length,
    assignedSupervisors: new Set(schedules.map(s => s.supervisorId)).size,
    availableSupervisors: supervisors.filter(s => 
      availabilities.some(a => a.supervisorId === s.id && a.isAvailable)
    ).length,
    conflicts: conflicts.length,
    recentActivity: activityLog.slice(-10).reverse()
  };

  useEffect(() => {
    const storedUsers = loadFromStorage(STORAGE_KEYS.USERS, []);
    if (storedUsers.length === 0) {
      initializeSampleData();
    } else {
      // Data is already loaded from local storage in initial state
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!initialized) return;
    saveToStorage(STORAGE_KEYS.USERS, users);
  }, [users, initialized]);
  useEffect(() => {
    if (!initialized) return;
    saveToStorage(STORAGE_KEYS.EXAMS, exams);
  }, [exams, initialized]);
  useEffect(() => {
    if (!initialized) return;
    saveToStorage(STORAGE_KEYS.VENUES, venues);
  }, [venues, initialized]);
  useEffect(() => {
    if (!initialized) return;
    saveToStorage(STORAGE_KEYS.AVAILABILITIES, availabilities);
  }, [availabilities, initialized]);
  useEffect(() => {
    if (!initialized) return;
    saveToStorage(STORAGE_KEYS.SCHEDULES, schedules);
  }, [schedules, initialized]);
  useEffect(() => {
    if (!initialized) return;
    saveToStorage(STORAGE_KEYS.ACTIVITY_LOG, activityLog);
  }, [activityLog, initialized]);
  useEffect(() => {
    if (!initialized) return;
    saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
  }, [currentUser, initialized]);

  const initializeSampleData = () => {
    const sampleAdmin: User = {
      id: 'admin1',
      username: 'admin',
      email: 'admin@university.edu',
      department: 'Administration',
      role: 'admin',
      createdAt: new Date()
    };

    const sampleSupervisors: Supervisor[] = [
      {
        id: 'sup1',
        username: 'dr.smith',
        email: 'smith@university.edu',
        department: 'Computer Science',
        role: 'supervisor',
        fullName: 'Dr. John Smith',
        phone: '+1234567890',
        maxAssignments: 4,
        status: 'active',
        specializations: ['Programming', 'Algorithms'],
        maxDailyAssignments: 4,
        totalAssignments: 0,
        createdAt: new Date()
      },
      {
        id: 'sup2',
        username: 'prof.johnson',
        email: 'johnson@university.edu',
        department: 'Mathematics',
        role: 'supervisor',
        fullName: 'Prof. Sarah Johnson',
        phone: '+1234567891',
        maxAssignments: 3,
        status: 'active',
        specializations: ['Calculus', 'Statistics'],
        maxDailyAssignments: 3,
        totalAssignments: 0,
        createdAt: new Date()
      },
      {
        id: 'sup3',
        username: 'dr.williams',
        email: 'williams@university.edu',
        department: 'Physics',
        role: 'supervisor',
        fullName: 'Dr. Michael Williams',
        phone: '+1234567892',
        maxAssignments: 3,
        status: 'active',
        specializations: ['Mechanics', 'Thermodynamics'],
        maxDailyAssignments: 3,
        totalAssignments: 0,
        createdAt: new Date()
      }
    ];

    const sampleVenues: Venue[] = [
      {
        id: 'venue1',
        name: 'Main Lecture Hall A',
        capacity: 200,
        building: 'Building A',
        floor: 'Floor 1',
        type: 'hall',
        equipment: 'Projector, Air Conditioning, Sound System',
        status: 'available',
        location: 'Building A, Floor 1',
        facilities: ['Projector', 'Air Conditioning', 'Sound System'],
        isActive: true
      },
      {
        id: 'venue2',
        name: 'Computer Lab 1',
        capacity: 50,
        building: 'Building B',
        floor: 'Floor 2',
        type: 'lab',
        equipment: 'Computers, Internet, Air Conditioning',
        status: 'available',
        location: 'Building B, Floor 2',
        facilities: ['Computers', 'Internet', 'Air Conditioning'],
        isActive: true
      },
      {
        id: 'venue3',
        name: 'Seminar Room C',
        capacity: 80,
        building: 'Building C',
        floor: 'Floor 1',
        type: 'classroom',
        equipment: 'Whiteboard, Air Conditioning',
        status: 'available',
        location: 'Building C, Floor 1',
        facilities: ['Whiteboard', 'Air Conditioning'],
        isActive: true
      }
    ];

    const allUsers = [sampleAdmin, ...sampleSupervisors];
    setUsers(allUsers);
    setVenues(sampleVenues);
    setInitialized(true);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const sampleAvailabilities: Availability[] = sampleSupervisors.map(supervisor => ({
      id: generateId(),
      supervisorId: supervisor.id,
      date: tomorrow,
      timeSlots: [
        { startTime: '08:00', endTime: '12:00', isAvailable: true },
        { startTime: '13:00', endTime: '17:00', isAvailable: true }
      ],
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    setAvailabilities(sampleAvailabilities);
  };

  const addActivityLog = (action: string, description: string, type: ActivityLog['type'] = 'update') => {
    const log: ActivityLog = {
      id: generateId(),
      action,
      description,
      userId: currentUser?.id || 'system',
      userName: currentUser?.username || 'System',
      timestamp: new Date(),
      type
    };
    setActivityLog(prev => [log, ...prev].slice(0, 100));
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Try to sign in with Supabase auth (using email as username for supervisors)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });

      if (error) {
        // If Supabase auth fails, check hardcoded admin account for backward compatibility
        const adminUser = users.find(u => u.username === username && u.role === 'admin');
        
        if (adminUser && password === 'password') {
          setCurrentUser(adminUser);
          addActivityLog('Login', `Admin ${username} logged in`, 'update');
          toast({ title: "Login Successful", description: `Welcome back, ${adminUser.username}!` });
          setLoading(false);
          return true;
        }

        throw error;
      }

      if (data.user) {
        // Fetch user profile from Supabase
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (profileError) throw profileError;

        // Create user object compatible with existing system
        const user: User = {
          id: data.user.id,
          username: data.user.email || username,
          email: data.user.email || '',
          department: profile.department,
          role: profile.role as 'admin' | 'supervisor',
          createdAt: new Date(data.user.created_at)
        };

        setCurrentUser(user);
        addActivityLog('Login', `User ${username} logged in`, 'update');
        toast({ title: "Login Successful", description: `Welcome back, ${profile.full_name || username}!` });
        setLoading(false);
        return true;
      }

      throw new Error('Authentication failed');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({ 
        title: "Login Failed", 
        description: error.message || "Invalid username or password", 
        variant: "destructive" 
      });
      setLoading(false);
      return false;
    }
  };

  const loginAdmin = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Check hardcoded admin account first
      const adminUser = users.find(u => u.username === username && u.role === 'admin');
      
      if (adminUser && password === 'password') {
        setCurrentUser(adminUser);
        addActivityLog('Login', `Admin ${username} logged in`, 'update');
        toast({ title: "Login Successful", description: `Welcome back, ${adminUser.username}!` });
        setLoading(false);
        return true;
      }

      toast({ 
        title: "Login Failed", 
        description: "Invalid admin credentials", 
        variant: "destructive" 
      });
      setLoading(false);
      return false;
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast({ 
        title: "Login Failed", 
        description: error.message || "Invalid username or password", 
        variant: "destructive" 
      });
      setLoading(false);
      return false;
    }
  };

  const loginSupervisor = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Try to sign in with Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Fetch user profile from Supabase
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (profileError) throw profileError;

        // Ensure this is a supervisor
        if (profile.role !== 'supervisor') {
          await supabase.auth.signOut();
          throw new Error('This account is not a supervisor account');
        }

        // Create user object compatible with existing system
        const user: User = {
          id: data.user.id,
          username: data.user.email || email,
          email: data.user.email || '',
          department: profile.department,
          role: profile.role as 'admin' | 'supervisor',
          createdAt: new Date(data.user.created_at)
        };

        setCurrentUser(user);
        addActivityLog('Login', `Supervisor ${email} logged in`, 'update');
        toast({ title: "Login Successful", description: `Welcome back, ${profile.full_name || email}!` });
        setLoading(false);
        return true;
      }

      throw new Error('Authentication failed');
    } catch (error: any) {
      console.error('Supervisor login error:', error);
      toast({ 
        title: "Login Failed", 
        description: error.message || "Invalid email or password", 
        variant: "destructive" 
      });
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    if (currentUser) {
      addActivityLog('Logout', `User ${currentUser.username} logged out`, 'update');
    }
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    setCurrentUser(null);
    toast({ title: "Logged Out", description: "You have been successfully logged out" });
  };

  const register = async (userData: Partial<User>): Promise<boolean> => {
    if (!userData.username || !userData.email || !userData.department) {
      toast({ title: "Registration Failed", description: "Please fill in all required fields", variant: "destructive" });
      return false;
    }

    const existingUser = users.find(u => u.username === userData.username || u.email === userData.email);
    if (existingUser) {
      toast({ title: "Registration Failed", description: "Username or email already exists", variant: "destructive" });
      return false;
    }

    const newUser: User = {
      id: generateId(),
      username: userData.username,
      email: userData.email,
      department: userData.department,
      role: userData.role || 'supervisor',
      createdAt: new Date()
    };

    setUsers(prev => [...prev, newUser]);
    addActivityLog('Register', `New user ${newUser.username} registered`, 'create');
    toast({ title: "Registration Successful", description: "Account created successfully" });
    return true;
  };

  const addExam = async (examData: Partial<Exam>): Promise<string> => {
    if (!examData.courseCode || !examData.date || !examData.startTime || !examData.venueId) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      throw new Error("Missing required fields");
    }

    const venue = venues.find(v => v.id === examData.venueId);
    
    const newExam: Exam = {
      id: generateId(),
      courseCode: examData.courseCode,
      courseName: examData.courseName || '',
      date: examData.date,
      startTime: examData.startTime,
      endTime: examData.endTime || '',
      venueId: examData.venueId,
      supervisorsNeeded: examData.supervisorsNeeded || 2
    };

    setExams(prev => [...prev, newExam]);
    addActivityLog('Create Exam', `Exam ${newExam.courseCode} created`, 'create');
    toast({ title: "Exam Created", description: `Exam for ${newExam.courseCode} has been scheduled` });
    return newExam.id;
  };


  const autoAssignSupervisors = async (examId: string): Promise<boolean> => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return false;

    const availableSupervisors = supervisors.slice(0, exam.supervisorsNeeded || 2);
    
    if (availableSupervisors.length < (exam.supervisorsNeeded || 2)) {
      toast({
        title: "Assignment Failed",
        description: `Only ${availableSupervisors.length} of ${exam.supervisorsNeeded || 2} supervisors available`,
        variant: "destructive"
      });
      return false;
    }

    const newSchedules: SupervisionSchedule[] = availableSupervisors.map((supervisor, index) => ({
      id: generateId(),
      examId,
      exam,
      supervisorId: supervisor.id,
      supervisor,
      assignedAt: new Date(),
      status: 'assigned',
      isMainSupervisor: index === 0,
      notificationSent: false
    }));

    setSchedules(prev => [...prev, ...newSchedules]);
    addActivityLog('Auto Assign', `${availableSupervisors.length} supervisors assigned to ${exam.courseCode}`, 'assign');
    toast({ title: "Assignment Successful", description: `${availableSupervisors.length} supervisors assigned to ${exam.courseCode}` });
    return true;
  };

  // Simplified implementations for demo
  const updateExam = async (id: string, updates: Partial<Exam>): Promise<boolean> => {
    setExams(prev => prev.map(exam => exam.id === id ? { ...exam, ...updates, updatedAt: new Date() } : exam));
    return true;
  };

  const deleteExam = async (id: string): Promise<boolean> => {
    setExams(prev => prev.filter(exam => exam.id !== id));
    setSchedules(prev => prev.filter(schedule => schedule.examId !== id));
    return true;
  };

  const addVenue = async (venueData: Partial<Venue>): Promise<string> => {
    const newVenue: Venue = {
      id: generateId(),
      name: venueData.name || '',
      capacity: venueData.capacity || 0,
      building: venueData.building || '',
      floor: venueData.floor,
      type: venueData.type,
      equipment: venueData.equipment,
      status: venueData.status || 'available',
      location: venueData.location || '',
      facilities: venueData.facilities || [],
      isActive: true
    };
    setVenues(prev => [...prev, newVenue]);
    return newVenue.id;
  };


  const deleteVenue = async (id: string): Promise<boolean> => {
    setVenues(prev => prev.filter(venue => venue.id !== id));
    return true;
  };

  const updateVenue = async (id: string, updates: Partial<Venue>): Promise<boolean> => {
    setVenues(prev => prev.map(venue => venue.id === id ? { ...venue, ...updates } : venue));
    return true;
  };

  const setAvailability = async (supervisorId: string, availabilityData: Partial<Availability>): Promise<boolean> => {
    const newAvailability: Availability = {
      id: generateId(),
      supervisorId,
      date: availabilityData.date || new Date(),
      timeSlots: availabilityData.timeSlots || [],
      isAvailable: availabilityData.isAvailable || false,
      notes: availabilityData.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setAvailabilities(prev => [...prev, newAvailability]);
    return true;
  };

  const manualAssignSupervisor = async (examId: string, supervisorId: string): Promise<boolean> => {
    const exam = exams.find(e => e.id === examId);
    const supervisor = supervisors.find(s => s.id === supervisorId);
    if (!exam || !supervisor) return false;

    const newSchedule: SupervisionSchedule = {
      id: generateId(),
      examId,
      exam,
      supervisorId,
      supervisor,
      assignedAt: new Date(),
      status: 'assigned',
      isMainSupervisor: false,
      notificationSent: false
    };

    setSchedules(prev => [...prev, newSchedule]);
    return true;
  };

  const removeAssignment = async (scheduleId: string): Promise<boolean> => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
    return true;
  };

  const sendNotifications = async (scheduleIds: string[]): Promise<boolean> => {
    setSchedules(prev => prev.map(schedule => 
      scheduleIds.includes(schedule.id) ? { ...schedule, notificationSent: true } : schedule
    ));
    toast({ title: "Notifications Sent", description: `${scheduleIds.length} supervisors notified` });
    return true;
  };

  const refreshData = async (): Promise<void> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const addSupervisor = async (supervisorData: Partial<Supervisor>): Promise<string> => {
    const newSupervisor: Supervisor = {
      id: generateId(),
      username: supervisorData.username || '',
      email: supervisorData.email || '',
      department: supervisorData.department || '',
      role: 'supervisor',
      fullName: supervisorData.fullName || '',
      phone: supervisorData.phone,
      maxAssignments: supervisorData.maxAssignments || 5,
      status: supervisorData.status || 'active',
      specializations: supervisorData.specializations || [],
      maxDailyAssignments: supervisorData.maxDailyAssignments || 5,
      totalAssignments: 0,
      createdAt: new Date()
    };
    setUsers(prev => [...prev, newSupervisor]);
    return newSupervisor.id;
  };

  const updateSupervisor = async (id: string, updates: Partial<Supervisor>): Promise<boolean> => {
    setUsers(prev => prev.map(user => user.id === id ? { ...user, ...updates } : user));
    return true;
  };

  const deleteSupervisor = async (id: string): Promise<boolean> => {
    setUsers(prev => prev.filter(user => user.id !== id));
    return true;
  };

  const generateSchedule = async (): Promise<void> => {
    // Simple auto-assignment logic
    const unassignedExams = exams.filter(exam => 
      !schedules.some(schedule => schedule.examId === exam.id)
    );

    for (const exam of unassignedExams) {
      await autoAssignSupervisors(exam.id);
    }
  };

  const contextValue: ESSContextType = {
    currentUser, users, supervisors, exams, venues, availabilities, schedules, 
    conflicts, activityLog, dashboardStats, loading,
    login, loginAdmin, loginSupervisor, logout, register, addExam, updateExam, deleteExam, addSupervisor, updateSupervisor, deleteSupervisor,
    addVenue, updateVenue, deleteVenue, generateSchedule,
    setAvailability, autoAssignSupervisors, manualAssignSupervisor, removeAssignment,
    sendNotifications, refreshData
  };

  return (
    <ESSContext.Provider value={contextValue}>
      {children}
    </ESSContext.Provider>
  );
};