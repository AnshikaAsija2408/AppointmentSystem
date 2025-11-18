// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CLIENT' | 'TBB_STAFF' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface TBBStaffMember extends User {
  role: 'TBB_STAFF';
  department?: string;
  googleCalendarId?: string;
  workingHours: WorkingHours;
  isAvailableForBooking: boolean;
}

export interface ClientUser extends User {
  role: 'CLIENT';
  company?: string;
  invitedBy: string; // TBB staff member ID
  invitedAt: Date;
  lastLogin?: Date;
}

// Meeting/Appointment Types
export interface Meeting {
  id: string;
  clientId: string;
  staffId: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  duration: number; // in minutes
  meetingLink?: string; // Google Meet link
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkingHours {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string; // "09:00"
  end: string;   // "17:00"
}

// Q&A System Types
export interface Question {
  id: string;
  clientId: string;
  title: string;
  content: string;
  status: 'NEW' | 'IN_PROGRESS' | 'ANSWERED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category?: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string; // TBB staff member ID
}

export interface Answer {
  id: string;
  questionId: string;
  staffId: string;
  content: string;
  isInternal: boolean; // true for internal notes, false for client-visible
  createdAt: Date;
  updatedAt: Date;
}

// Invitation Types
export interface ClientInvitation {
  id: string;
  email: string;
  invitedBy: string; // TBB staff member ID
  invitedAt: Date;
  expiresAt: Date;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  token: string;
}

// Dashboard Data Types
export interface ClientDashboardData {
  upcomingMeetings: Meeting[];
  recentQuestions: Question[];
  totalMeetings: number;
  pendingQuestions: number;
}

export interface AdminDashboardData {
  newQuestions: Question[];
  upcomingMeetings: Meeting[];
  totalClients: number;
  pendingInvitations: number;
  staffUtilization: StaffUtilization[];
}

export interface StaffUtilization {
  staffId: string;
  staffName: string;
  meetingsThisWeek: number;
  questionsAssigned: number;
  availability: number; // percentage
}

// Form Types
export interface BookMeetingForm {
  staffId: string;
  date: string;
  time: string;
  duration: number;
  title: string;
  description?: string;
}

export interface QuestionForm {
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category?: string;
}

export interface InviteClientForm {
  email: string;
  name: string;
  company?: string;
  message?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'MEETING_BOOKED' | 'QUESTION_ANSWERED' | 'MEETING_REMINDER' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// Calendar Integration Types
export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: {
    email: string;
    displayName?: string;
  }[];
  conferenceData?: {
    entryPoints: {
      entryPointType: string;
      uri: string;
    }[];
  };
}

// Global type augmentation for mongoose caching
declare global {
  var mongoose: {
    conn: typeof import('mongoose') | null;
    promise: Promise<typeof import('mongoose')> | null;
  } | undefined;
}
