export type AgentState = 
  | 'idle' 
  | 'understanding' 
  | 'planning' 
  | 'optimizing' 
  | 'ready' 
  | 'replanning'
  | 'needs_approval'
  | 'adapting'
  | 'error';

export interface AgentStatus {
  state: AgentState;
  message: string;
  progress?: number; // 0-100
  details?: string;
}

export interface AgentStateConfig {
  /** short status chip label */
  label: string;
  /** supporting line under the coach line */
  description: string;
  /** the coach speaking — shown as the primary headline */
  coach: string;
  color: 'brand' | 'accent' | 'success' | 'warning' | 'danger';
  icon: string;
}

export const AGENT_STATE_CONFIG: Record<AgentState, AgentStateConfig> = {
  idle: {
    label: 'Standing by',
    description: 'Tell me what you want to protect this week.',
    coach: 'Ready when you are.',
    color: 'brand',
    icon: 'sparkles',
  },
  understanding: {
    label: 'Understanding',
    description: 'Mapping constraints, priorities and recovery time.',
    coach: 'Reading your commitments…',
    color: 'brand',
    icon: 'search',
  },
  planning: {
    label: 'Planning',
    description: 'Assigning focus blocks and recovery windows.',
    coach: "Building your training plan…",
    color: 'accent',
    icon: 'brain',
  },
  optimizing: {
    label: 'Optimizing',
    description: 'Tightening the plan until it holds.',
    coach: 'Balancing goals, focus and recovery…',
    color: 'accent',
    icon: 'sliders-horizontal',
  },
  ready: {
    label: 'Ready',
    description: 'Priorities protected. Nothing double-booked.',
    coach: 'Your week is ready.',
    color: 'success',
    icon: 'check-circle',
  },
  adapting: {
    label: 'Adapting',
    description: 'Updating your plan based on changes.',
    coach: 'Adjusting the plan…',
    color: 'warning',
    icon: 'refresh-cw',
  },
  replanning: {
    label: 'Replanning',
    description: 'Affected blocks are being re-sequenced.',
    coach: 'Your schedule changed. Adaptation in progress…',
    color: 'warning',
    icon: 'refresh-cw',
  },
  needs_approval: {
    label: 'Needs Approval',
    description: 'Review the proposed changes.',
    coach: 'New commitment detected. Your call.',
    color: 'accent',
    icon: 'alert-circle',
  },
  error: {
    label: 'Error',
    description: 'Retry and I will pick it up.',
    coach: 'Something got in the way.',
    color: 'danger',
    icon: 'alert-circle',
  },
};
