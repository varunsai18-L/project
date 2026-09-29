export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface TimeSlot {
  start: string;
  end: string;
  day: DayOfWeek;
}

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type ActivityType = 'fixed' | 'goal' | 'recurring' | 'break' | 'sleep' | 'buffer';

export interface Commitment {
  id: string;
  title: string;
  description?: string;
  timeSlot: TimeSlot;
  isRecurring: boolean;
  recurrenceDays?: DayOfWeek[];
  priority: Priority;
  type: 'fixed';
  source: 'manual' | 'calendar';
  color?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetHoursPerWeek: number;
  preferredDays?: DayOfWeek[];
  preferredTimeRanges?: { start: string; end: string }[];
  minSessionDuration: number;
  maxSessionDuration: number;
  category: 'learning' | 'health' | 'work' | 'personal' | 'social' | 'other';
  priority: Priority;
  progress: number;
  color?: string;
}

export interface RecurringTask {
  id: string;
  title: string;
  description?: string;
  duration: number;
  days: DayOfWeek[];
  preferredTimeRanges?: { start: string; end: string }[];
  priority: Priority;
  isFlexible: boolean;
  estimatedEnergy: 'low' | 'medium' | 'high';
  type: 'recurring';
  color?: string;
}

export interface WorkingHours {
  day: DayOfWeek;
  start: string;
  end: string;
  isWorkingDay: boolean;
}

export interface SleepSchedule {
  start: string;
  end: string;
}

export interface UserPreferences {
  workingHours: WorkingHours[];
  sleepSchedule: SleepSchedule;
  breakDuration: number;
  maxContinuousWork: number;
  preferredBreakTimes: { start: string; end: string }[];
  timezone: string;
  energyPeaks: { day: DayOfWeek; start: string; end: string }[];
}

export interface ScheduledBlock {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  day: DayOfWeek;
  sourceId: string;
  priority: Priority;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface WeeklyRoutine {
  weekStart: Date;
  blocks: ScheduledBlock[];
  goalsProgress: Record<string, number>;
  unscheduledTasks: RecurringTask[];
  conflicts: Conflict[];
  score: number;
  generatedAt: Date;
}

export interface Conflict {
  id: string;
  type: 'overlap' | 'overwork' | 'insufficient_break' | 'goal_missed' | 'preference_violation' | 'sleep_violation';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  affectedBlockIds: string[];
  suggestedResolution?: string;
}

export interface ReplanProposal {
  id: string;
  trigger: 'commitment_changed' | 'commitment_added' | 'commitment_removed' | 'goal_changed' | 'manual';
  timestamp: Date;
  changes: ReplanChange[];
  reasoning: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ReplanChange {
  type: 'move' | 'resize' | 'remove' | 'add' | 'split';
  blockId: string;
  from?: { start: Date; end: Date };
  to?: { start: Date; end: Date };
  reason: string;
}

export interface AgentStateType {
  status: 'idle' | 'understanding' | 'planning' | 'optimizing' | 'ready' | 'replanning' | 'needs_approval' | 'error';
  message: string;
  progress?: number;
  details?: string[];
}

export const DAYS_ORDER: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

export const DAY_FULL_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function parseTimeSlot(slot: TimeSlot): { startMin: number; endMin: number } {
  return {
    startMin: timeToMinutes(slot.start),
    endMin: timeToMinutes(slot.end),
  };
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekEnd(date: Date = new Date()): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}