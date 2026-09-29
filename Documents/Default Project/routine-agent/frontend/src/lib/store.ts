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
}

const initialState = {
  commitments: [] as Commitment[],
  goals: [] as Goal[],
  recurringTasks: [] as RecurringTask[],
  preferences: defaultPreferences,
  currentRoutine: null,
  agentStatus: {
    status: 'idle' as const,
    message: 'Tell me what you want to accomplish.',
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
      agentStatus: { status: 'understanding', message: 'Understanding your commitments...', progress: 20 },
    });
    await new Promise((r) => setTimeout(r, 500));

    set({
      agentStatus: { status: 'planning', message: 'Balancing your goals and available time...', progress: 50 },
    });
    await new Promise((r) => setTimeout(r, 800));

    set({
      agentStatus: { status: 'optimizing', message: 'Resolving conflicts and improving your schedule...', progress: 80 },
    });
    await new Promise((r) => setTimeout(r, 500));

    const routine = generateWeeklyRoutine(commitments, goals, recurringTasks, preferences);
    set({
      currentRoutine: routine,
      agentStatus: { status: 'ready', message: 'Your personalized week is ready.', progress: 100 },
    });
  },

  triggerReplan: async (commitmentId, newTimeSlot) => {
    const { commitments, currentRoutine, goals, recurringTasks, preferences } = get();
    const commitment = commitments.find((c) => c.id === commitmentId);
    if (!commitment || !currentRoutine) return;

    set({
      agentStatus: { status: 'replanning', message: 'A commitment changed. Updating affected tasks...', progress: 30 },
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
      agentStatus: { status: 'replanning', message: 'Analyzing conflicts and generating new plan...', progress: 60 },
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
      agentStatus: { status: 'needs_approval', message: 'Review the proposed changes', progress: 100 },
    });
  },

  approveProposal: () => {
    const { pendingProposal, proposedRoutine } = get();
    if (!pendingProposal || !proposedRoutine) return;

    set({
      currentRoutine: proposedRoutine,
      pendingProposal: null,
      proposedRoutine: null,
      lastAction: { type: 'approved', message: 'Routine updated successfully', timestamp: Date.now() },
      agentStatus: { status: 'ready', message: 'Changes approved. Routine updated.', progress: 100 },
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
      lastAction: { type: 'rejected', message: 'Changes rejected. Routine unchanged.', timestamp: Date.now() },
      agentStatus: { status: 'ready', message: 'Changes rejected. Routine unchanged.', progress: 100 },
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
      agentStatus: { status: 'idle', message: 'Demo data loaded. Click "Generate My Week" to start.' },
    });
  },

  reset: () => set(initialState),
}));