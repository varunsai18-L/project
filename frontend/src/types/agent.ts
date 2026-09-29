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

export const AGENT_STATE_CONFIG: Record<AgentState, { 
  label: string; 
  description: string;
  color: string;
  icon: string;
}> = {
  idle: {
    label: 'Ready',
    description: 'Tell me what you want to accomplish',
    color: 'brand',
    icon: 'sparkles',
  },
  understanding: {
    label: 'Understanding',
    description: 'Analyzing your goals, constraints & context',
    color: 'brand',
    icon: 'search',
  },
  planning: {
    label: 'Planning',
    description: 'Building your personalized routine',
    color: 'accent',
    icon: 'brain',
  },
  optimizing: {
    label: 'Optimizing',
    description: 'Balancing focus, energy & constraints',
    color: 'accent',
    icon: 'sliders-horizontal',
  },
  ready: {
    label: 'Ready',
    description: 'Your routine is ready to review',
    color: 'success',
    icon: 'check-circle',
  },
  adapting: {
    label: 'Adapting',
    description: 'Updating your plan based on changes',
    color: 'warning',
    icon: 'refresh-cw',
  },
  replanning: {
    label: 'Replanning',
    description: 'A commitment changed. Updating affected tasks...',
    color: 'warning',
    icon: 'refresh-cw',
  },
  needs_approval: {
    label: 'Needs Approval',
    description: 'Review the proposed changes',
    color: 'accent',
    icon: 'alert-circle',
  },
  error: {
    label: 'Error',
    description: 'Something went wrong',
    color: 'danger',
    icon: 'alert-circle',
  },
};