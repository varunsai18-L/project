import {
  Commitment,
  Goal,
  RecurringTask,
  UserPreferences,
} from '@/types/planning';

export const defaultPreferences: UserPreferences = {
  workingHours: [
    { day: 'monday', start: '07:00', end: '22:00', isWorkingDay: true },
    { day: 'tuesday', start: '07:00', end: '22:00', isWorkingDay: true },
    { day: 'wednesday', start: '07:00', end: '22:00', isWorkingDay: true },
    { day: 'thursday', start: '07:00', end: '22:00', isWorkingDay: true },
    { day: 'friday', start: '07:00', end: '22:00', isWorkingDay: true },
    { day: 'saturday', start: '08:00', end: '20:00', isWorkingDay: true },
    { day: 'sunday', start: '08:00', end: '20:00', isWorkingDay: false },
  ],
  sleepSchedule: { start: '23:00', end: '07:00' },
  breakDuration: 15,
  maxContinuousWork: 90,
  preferredBreakTimes: [
    { start: '10:00', end: '10:15' },
    { start: '13:00', end: '13:30' },
    { start: '15:30', end: '15:45' },
  ],
  timezone: 'America/Los_Angeles',
  energyPeaks: [
    { day: 'monday', start: '07:00', end: '10:00' },
    { day: 'tuesday', start: '07:00', end: '10:00' },
    { day: 'wednesday', start: '07:00', end: '10:00' },
    { day: 'thursday', start: '07:00', end: '10:00' },
    { day: 'friday', start: '07:00', end: '10:00' },
  ],
};

export const demoCommitments: Commitment[] = [
  {
    id: 'commit-college',
    title: 'College',
    description: 'Classes and lectures',
    timeSlot: { start: '10:00', end: '17:20', day: 'monday' },
    isRecurring: true,
    recurrenceDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    priority: 'critical',
    type: 'fixed',
    source: 'manual',
    color: '#3b82f6',
  },
  {
    id: 'commit-gym',
    title: 'Gym',
    description: 'Strength training',
    timeSlot: { start: '18:30', end: '19:30', day: 'monday' },
    isRecurring: true,
    recurrenceDays: ['monday', 'wednesday', 'friday'],
    priority: 'high',
    type: 'fixed',
    source: 'manual',
    color: '#22c55e',
  },
  {
    id: 'commit-internship',
    title: 'Internship',
    description: 'Remote work session',
    timeSlot: { start: '20:30', end: '21:30', day: 'tuesday' },
    isRecurring: true,
    recurrenceDays: ['tuesday', 'thursday'],
    priority: 'high',
    type: 'fixed',
    source: 'manual',
    color: '#f59e0b',
  },
];

export const demoGoals: Goal[] = [
  {
    id: 'goal-react',
    title: 'Learn React Fundamentals',
    description: 'Complete React course and build projects',
    targetHoursPerWeek: 8,
    preferredDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    preferredTimeRanges: [
      { start: '07:00', end: '09:30' },
      { start: '19:30', end: '22:00' },
    ],
    minSessionDuration: 60,
    maxSessionDuration: 120,
    category: 'learning',
    priority: 'high',
    progress: 0,
    color: '#61dafb',
  },
  {
    id: 'goal-dsa',
    title: 'Practice DSA',
    description: 'LeetCode problems and algorithm study',
    targetHoursPerWeek: 5,
    preferredDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    preferredTimeRanges: [
      { start: '07:00', end: '09:00' },
      { start: '19:30', end: '21:30' },
    ],
    minSessionDuration: 45,
    maxSessionDuration: 90,
    category: 'learning',
    priority: 'high',
    progress: 0,
    color: '#ff6b6b',
  },
  {
    id: 'goal-hackathon',
    title: 'Hackathon Prep',
    description: 'Build portfolio project for upcoming hackathon',
    targetHoursPerWeek: 6,
    preferredDays: ['friday', 'saturday', 'sunday'],
    preferredTimeRanges: [
      { start: '10:00', end: '14:00' },
      { start: '15:00', end: '19:00' },
    ],
    minSessionDuration: 90,
    maxSessionDuration: 180,
    category: 'work',
    priority: 'medium',
    progress: 0,
    color: '#a855f7',
  },
];

export const demoRecurringTasks: RecurringTask[] = [
  {
    id: 'task-dsa-daily',
    title: 'DSA Practice',
    description: 'Solve 2-3 LeetCode problems',
    duration: 60,
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    preferredTimeRanges: [
      { start: '07:00', end: '08:30' },
      { start: '20:00', end: '21:30' },
    ],
    priority: 'high',
    isFlexible: true,
    estimatedEnergy: 'high',
    type: 'recurring',
    color: '#ff6b6b',
  },
  {
    id: 'task-exercise',
    title: 'Evening Walk',
    description: '30 min walk for health',
    duration: 30,
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    preferredTimeRanges: [
      { start: '19:00', end: '19:30' },
    ],
    priority: 'medium',
    isFlexible: true,
    estimatedEnergy: 'low',
    type: 'recurring',
    color: '#22c55e',
  },
  {
    id: 'task-revision',
    title: 'Daily Revision',
    description: 'Review notes and flashcards',
    duration: 30,
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    preferredTimeRanges: [
      { start: '21:30', end: '22:00' },
    ],
    priority: 'medium',
    isFlexible: true,
    estimatedEnergy: 'low',
    type: 'recurring',
    color: '#3b82f6',
  },
];

export function createDemoRoutine() {
  return {
    commitments: [...demoCommitments],
    goals: [...demoGoals],
    recurringTasks: [...demoRecurringTasks],
    preferences: { ...defaultPreferences },
  };
}

export function createModifiedCommitment(): Commitment {
  return {
    ...demoCommitments[1],
    timeSlot: { start: '19:30', end: '20:30', day: 'monday' },
  };
}