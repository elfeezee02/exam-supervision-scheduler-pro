// Core data types for the ESSS (Examination Supervision Scheduling System)

export interface User {
  id: string;
  username: string;
  email: string;
  department: string;
  role: 'admin' | 'supervisor';
  createdAt: Date;
}

export interface Supervisor extends User {
  role: 'supervisor';
  fullName: string;
  phone?: string;
  maxAssignments?: number;
  status?: 'active' | 'inactive';
  specializations: string[];
  maxDailyAssignments: number;
  totalAssignments: number;
}

export interface Venue {
  id: string;
  name: string;
  capacity: number;
  building: string;
  floor?: string;
  type?: 'classroom' | 'hall' | 'lab' | 'auditorium';
  equipment?: string;
  status?: 'available' | 'unavailable' | 'maintenance';
  location: string;
  facilities: string[];
  isActive: boolean;
}

export interface Exam {
  id: string;
  courseCode: string;
  courseName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration?: number; // in minutes
  venueId: string;
  venue?: Venue;
  expectedStudents?: number;
  supervisorsNeeded: number;
  supervisorsRequired?: number;
  department?: string;
  status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Availability {
  id: string;
  supervisorId: string;
  date: Date;
  timeSlots: TimeSlot[];
  isAvailable: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface SupervisionSchedule {
  id: string;
  examId: string;
  exam?: Exam;
  supervisorId: string;
  supervisor?: Supervisor;
  assignedAt: Date;
  status: 'assigned' | 'confirmed' | 'declined' | 'completed';
  isMainSupervisor: boolean;
  notificationSent: boolean;
  notes?: string;
}

// Alias for backward compatibility
export type Schedule = SupervisionSchedule;

export interface SchedulingConflict {
  type: 'time_conflict' | 'venue_conflict' | 'supervisor_overload';
  message: string;
  examIds: string[];
  supervisorIds?: string[];
  venueIds?: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface DashboardStats {
  totalExams: number;
  totalSupervisors: number;
  totalVenues: number;
  scheduledExams: number;
  assignedSupervisors: number;
  availableSupervisors: number;
  conflicts: number;
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  userId: string;
  userName: string;
  timestamp: Date;
  type: 'create' | 'update' | 'delete' | 'assign' | 'notification';
}

export interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  reminderDays: number;
  reminderHours: number;
}

export interface SchedulingAlgorithmOptions {
  prioritizeFairDistribution: boolean;
  considerSpecialization: boolean;
  allowOvertime: boolean;
  maxConsecutiveAssignments: number;
  minimumBreakBetweenAssignments: number; // in minutes
}