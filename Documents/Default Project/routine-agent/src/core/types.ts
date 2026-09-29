export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface TimeSlot {
  start: string; // HH:mm format
  end: string;
  day: DayOfWeek;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  interval: number;
  daysOfWeek?: DayOfWeek[];
  endDate?: Date;
  count?: number;
}

export interface Commitment {
  id: string;
  title: string;
  description?: string;
  timeSlot: TimeSlot;
  recurrence?: RecurrenceRule;
  isFixed: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  source: 'calendar' | 'manual' | 'generated';
  metadata?: Record<string, unknown>;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetHoursPerWeek: number;
  preferredDays?: DayOfWeek[];
  preferredTimeRanges?: TimeRange[];
  minSessionDuration: number; // minutes
  maxSessionDuration: number; // minutes
  progress: number; // 0-100
  category: 'health' | 'learning' | 'work' | 'personal' | 'social' | 'other';
}

export interface RecurringTask {
  id: string;
  title: string;
  description?: string;
  duration: number; // minutes
  recurrence: RecurrenceRule;
  preferredTimeRanges?: TimeRange[];
  preferredDays?: DayOfWeek[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  isFlexible: boolean;
  estimatedEnergy: 'low' | 'medium' | 'high';
}

export interface WorkingHours {
  day: DayOfWeek;
  start: string; // HH:mm
  end: string;
  isWorkingDay: boolean;
}

export interface UserPreferences {
  workingHours: WorkingHours[];
  sleepSchedule: { start: string; end: string };
  breakDuration: number; // minutes
  maxContinuousWork: number; // minutes
  preferredBreakTimes: TimeRange[];
  timezone: string;
  energyPeaks: { day: DayOfWeek; start: string; end: string }[];
}

export interface ScheduledBlock {
  id: string;
  type: 'commitment' | 'goal' | 'task' | 'break' | 'buffer';
  title: string;
  start: Date;
  end: Date;
  sourceId: string;
  metadata?: Record<string, unknown>;
}

export interface WeeklyRoutine {
  weekStart: Date;
  blocks: ScheduledBlock[];
  goalsProgress: Map<string, number>;
  unscheduledTasks: RecurringTask[];
  conflicts: Conflict[];
  score: number;
}

export interface Conflict {
  id: string;
  type: 'overlap' | 'overwork' | 'insufficient_break' | 'goal_missed' | 'preference_violation';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  affectedBlocks: string[];
  suggestedResolution?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  recurrence?: RecurrenceRule;
  calendarId: string;
}

export interface CalendarProvider {
  id: string;
  name: 'google' | 'outlook' | 'apple' | 'custom';
  authToken?: string;
  refreshToken?: string;
  calendarIds: string[];
  isConnected: boolean;
}

export interface ReplanTrigger {
  type: 'new_commitment' | 'cancelled_commitment' | 'rescheduled_commitment' | 'goal_changed' | 'preference_changed' | 'manual';
  timestamp: Date;
  affectedItems: string[];
  reason: string;
}

export interface AgentState {
  userId: string;
  preferences: UserPreferences;
  commitments: Commitment[];
  goals: Goal[];
  recurringTasks: RecurringTask[];
  currentRoutine: WeeklyRoutine | null;
  calendarProviders: CalendarProvider[];
  lastSync: Date | null;
  replanHistory: ReplanTrigger[];
}