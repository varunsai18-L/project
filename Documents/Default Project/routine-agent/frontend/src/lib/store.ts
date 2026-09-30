import { create } from 'zustand';
import {
  Commitment,
  Goal,
  RecurringTask,
  UserPreferences,
  WeeklyRoutine,
  ScheduledBlock,
  Conflict,
  DayOfWeek,
} from '@/types/planning';
import { demoCommitments, demoGoals, demoRecurringTasks, defaultPreferences } from './demoData';
import { generateWeeklyRoutine, detectConflicts, proposeReplan } from './planner';

interface PlannerState {
  commitments: Commitment[];
  goals: Goal[];
  recurringTasks: RecurringTask[];
  preferences: UserPreferences;
  currentRoutine: WeeklyRoutine | null;
  agentStatus: {
    status: 'idle' | 'understanding' | 'planning' | 'optimizing' | 'ready' | 'replanning' | 'needs_approval' | 'error';
    message: string;
    progress?: number;
    details?: string[];
  };
  pendingProposal: {
    changes: { type: 'move' | 'resize' | 'remove' | 'add'; blockId: string; from: { start: Date; end: Date }; to: { start: Date; end: Date }; reason: string }[];
    reasoning: string;
    affectedBlocks: ScheduledBlock[];
    conflicts: Conflict[];
    originalRoutine: WeeklyRoutine;
    originalCommitments: Commitment[];
    changedCommitmentId: string;
  } | null;
  proposedRoutine: WeeklyRoutine | null;
  lastAction: { type: 'approved' | 'rejected'; message: string; timestamp: number } | null;
  isDemoMode: boolean;

  setCommitments: (commitments: Commitment[]) => void;
  addCommitment: (commitment: Commitment) => void;
  updateCommitment: (id: string, commitment: Partial<Commitment>) => void;
  removeCommitment: (id: string) => void;
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  setRecurringTasks: (tasks: RecurringTask[]) => void;
  addRecurringTask: (task: RecurringTask) => void;
  updateRecurringTask: (id: string, task: Partial<RecurringTask>) => void;
  removeRecurringTask: (id: string) => void;
  setPreferences: (preferences: UserPreferences) => void;
  generateRoutine: () => Promise<void>;
  triggerReplan: (commitmentId: string, newTimeSlot: { start: string; end: string; day?: DayOfWeek }) => Promise<void>;
  approveProposal: () => void;
  rejectProposal: () => void;
  loadDemo: () => void;
  reset: () => void;
  importCalendarCommitments: (calendarCommitments: Commitment[]) => Conflict[];
}

const initialState = {
  commitments: [] as Commitment[],
  goals: [] as Goal[],
  recurringTasks: [] as RecurringTask[],
  preferences: defaultPreferences,
  currentRoutine: null,
  agentStatus: {
    status: 'idle' as const,
    message: 'Ready when you are.',
  },
  pendingProposal: null,
  proposedRoutine: null,
  lastAction: null,
  isDemoMode: false,
};

export const usePlannerStore = create<PlannerState>((set, get) => ({
  ...initialState,

  setCommitments: (commitments) => set({ commitments }),
  addCommitment: (commitment) => set((state) => ({ commitments: [...state.commitments, commitment] })),
  updateCommitment: (id, commitment) =>
    set((state) => ({
      commitments: state.commitments.map((c) => (c.id === id ? { ...c, ...commitment } : c)),
    })),
  removeCommitment: (id) =>
    set((state) => ({
      commitments: state.commitments.filter((c) => c.id !== id),
    })),

  setGoals: (goals) => set({ goals }),
  addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
  updateGoal: (id, goal) =>
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...goal } : g)),
    })),
  removeGoal: (id) =>
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
    })),

  setRecurringTasks: (tasks) => set({ recurringTasks: tasks }),
  addRecurringTask: (task) => set((state) => ({ recurringTasks: [...state.recurringTasks, task] })),
  updateRecurringTask: (id, task) =>
    set((state) => ({
      recurringTasks: state.recurringTasks.map((t) => (t.id === id ? { ...t, ...task } : t)),
    })),
  removeRecurringTask: (id) =>
    set((state) => ({
      recurringTasks: state.recurringTasks.filter((t) => t.id !== id),
    })),

  setPreferences: (preferences) => set({ preferences }),

  generateRoutine: async () => {
    const { commitments, goals, recurringTasks, preferences } = get();
    set({
      agentStatus: { status: 'understanding', message: 'Reading your commitments...', progress: 20 },
    });
    await new Promise((r) => setTimeout(r, 500));

    set({
      agentStatus: { status: 'planning', message: 'Assigning focus blocks and recovery windows...', progress: 50 },
    });
    await new Promise((r) => setTimeout(r, 800));

    set({
      agentStatus: { status: 'optimizing', message: 'Balancing goals, focus and recovery...', progress: 80 },
    });
    await new Promise((r) => setTimeout(r, 500));

    const routine = generateWeeklyRoutine(commitments, goals, recurringTasks, preferences);
    set({
      currentRoutine: routine,
      agentStatus: { status: 'ready', message: 'Plan locked in. Nothing double-booked.', progress: 100 },
    });
  },

  triggerReplan: async (commitmentId, newTimeSlot) => {
    const { commitments, currentRoutine, goals, recurringTasks, preferences } = get();
    const commitment = commitments.find((c) => c.id === commitmentId);
    if (!commitment || !currentRoutine) return;

    set({
      agentStatus: { status: 'replanning', message: 'Commitment changed. Adapting in progress...', progress: 30 },
    });
    await new Promise((r) => setTimeout(r, 400));

    const updatedCommitments = commitments.map((c) =>
      c.id === commitmentId ? { ...c, timeSlot: { ...c.timeSlot, ...newTimeSlot } } : c
    );

    const { conflicts, affectedBlocks } = detectConflicts(
      { ...commitment, timeSlot: { ...commitment.timeSlot, ...newTimeSlot } },
      currentRoutine,
      preferences
    );

    set({
      agentStatus: { status: 'replanning', message: 'Conflicts found. Rebuilding the affected blocks...', progress: 60 },
    });
    await new Promise((r) => setTimeout(r, 500));

    const { proposal, newRoutine } = proposeReplan(
      { ...commitment, timeSlot: { ...commitment.timeSlot, ...newTimeSlot } },
      currentRoutine,
      preferences,
      updatedCommitments,
      goals,
      recurringTasks
    );

    set({
      pendingProposal: {
        ...proposal,
        affectedBlocks,
        conflicts,
        originalRoutine: currentRoutine,
        originalCommitments: commitments,
        changedCommitmentId: commitmentId,
      },
      commitments: updatedCommitments,
      proposedRoutine: newRoutine,
      agentStatus: { status: 'needs_approval', message: 'I protected your priorities. Review the new plan.', progress: 100 },
    });
  },

  approveProposal: () => {
    const { pendingProposal, proposedRoutine } = get();
    if (!pendingProposal || !proposedRoutine) return;

    set({
      currentRoutine: proposedRoutine,
      pendingProposal: null,
      proposedRoutine: null,
      lastAction: { type: 'approved', message: 'Adaptation complete \u2726 Your priorities are protected.', timestamp: Date.now() },
      agentStatus: { status: 'ready', message: 'Adaptation complete \u2726 Routine updated.', progress: 100 },
    });
    setTimeout(() => set({ lastAction: null }), 4000);
  },

  rejectProposal: () => {
    const { pendingProposal, currentRoutine } = get();
    if (!pendingProposal || !currentRoutine) return;

    set({
      currentRoutine: pendingProposal.originalRoutine,
      commitments: pendingProposal.originalCommitments,
      pendingProposal: null,
      proposedRoutine: null,
      lastAction: { type: 'rejected', message: 'Rejection noted. Your original plan is back in place.', timestamp: Date.now() },
      agentStatus: { status: 'ready', message: 'Original plan restored. Nothing changed.', progress: 100 },
    });
    setTimeout(() => set({ lastAction: null }), 4000);
  },

  loadDemo: () => {
    set({
      commitments: [...demoCommitments],
      goals: [...demoGoals],
      recurringTasks: [...demoRecurringTasks],
      preferences: { ...defaultPreferences },
      isDemoMode: true,
      agentStatus: { status: 'idle', message: 'Demo context loaded. Let us build your week.' },
    });
  },

  importCalendarCommitments: (calendarCommitments) => {
    const { commitments, currentRoutine, preferences } = get();

    const manualCommitments = commitments.filter((c) => c.source !== 'calendar');
    const nextCommitments = [...manualCommitments, ...calendarCommitments];
    set({ commitments: nextCommitments });

    if (!currentRoutine) return [];

    const conflicts: Conflict[] = [];
    for (const cal of calendarCommitments) {
      const days = cal.isRecurring && cal.recurrenceDays ? cal.recurrenceDays : [cal.timeSlot.day];
      for (const day of days) {
        const candidate: Commitment = {
          ...cal,
          timeSlot: { ...cal.timeSlot, day },
        };
        const detected = detectConflicts(candidate, currentRoutine, preferences);
        conflicts.push(...detected.conflicts);
      }
    }

    return conflicts;
  },

  reset: () => set(initialState),
}));