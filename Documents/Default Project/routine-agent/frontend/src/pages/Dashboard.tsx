'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Target, Calendar, Brain, CheckCircle, Clock, AlertTriangle, Pencil, X, ArrowRight, Check, Ban, Zap, ShieldCheck, TrendingUp, Activity } from 'lucide-react';
import { usePlannerStore } from '@/lib/store';
import type { WeeklyRoutine, Commitment } from '@/types/planning';
import {
  AgentOrb,
  Button,
  Card,
  Badge,
  ProgressRing,
} from '@/components/ui';
import {
  PageSection,
  CardGrid,
  SectionTitle,
} from '@/components/layout/PageLayout';
import { AGENT_STATE_CONFIG, AgentState } from '@/types/agent';
import { AgentCompanion } from '@/components/brand/AgentCompanion';
import { RoutineOSMark } from '@/components/brand/RoutineOSLogo';
import { cn } from '@/utils/helpers';

const DAY_KEYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const;
const FOCUS_TYPES = new Set(['goal','recurring']);
const PIPES: Record<string, number> = { critical: 3, high: 3, medium: 2, low: 1 };

export function Dashboard() {
  const {
    commitments,
    goals,
    recurringTasks,
    currentRoutine,
    agentStatus,
    pendingProposal,
    lastAction,
    generateRoutine,
    loadDemo,
    isDemoMode,
    triggerReplan,
  } = usePlannerStore();

  const [showChangeModal, setShowChangeModal] = useState(false);

  const hasData = commitments.length > 0 || goals.length > 0 || recurringTasks.length > 0;

  useEffect(() => {
    if (!hasData && !isDemoMode) {
      loadDemo();
    }
  }, [hasData, isDemoMode, loadDemo]);

  const handleGenerate = async () => {
    await generateRoutine();
  };

  const config = AGENT_STATE_CONFIG[agentStatus.status as AgentState];

  const todayKey = DAY_KEYS[(new Date().getDay() + 6) % 7];
  const focusBlocks = (currentRoutine?.blocks || []).filter((b) => FOCUS_TYPES.has(b.type));
  const minutesOn = (day: string) =>
    focusBlocks
      .filter((b) => b.day === day)
      .reduce((sum, b) => sum + (b.end.getTime() - b.start.getTime()) / 60000, 0);
  const todayFocusH = Math.round((minutesOn(todayKey) / 60) * 10) / 10;
  const weekFocusH = Math.round((focusBlocks.reduce((s, b) => s + (b.end.getTime() - b.start.getTime()) / 60000, 0) / 60) * 10) / 10;
  const daysScheduled = new Set(focusBlocks.map((b) => b.day)).size;
  const consistency = currentRoutine ? Math.round((daysScheduled / 7) * 100) : 0;
  const planScore = currentRoutine?.score ?? 0;

  const stats = [
    { label: 'Fixed Commitments', value: commitments.filter((c) => c.type === 'fixed').length, icon: Calendar, color: 'brand' },
    { label: 'Active Goals', value: goals.length, icon: Target, color: 'success' },
    { label: 'Recurring Tasks', value: recurringTasks.length, icon: Brain, color: 'accent' },
    { label: 'Scheduled Blocks', value: currentRoutine?.blocks.length || 0, icon: Clock, color: 'warning' },
  ];

  if (!hasData && !isDemoMode) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <AgentOrb state="idle" size="xl" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-surface-900 dark:text-surface-100 mb-4">
            Welcome to <span className="gradient-text">RoutineOS</span>
          </h1>
          <p className="text-lg text-surface-600 dark:text-surface-400 max-w-xl mx-auto mb-8">
            Your intelligent personal planning agent. Add your commitments, goals, and preferences — then let the agent build your optimal week.
          </p>
          <Button size="lg" onClick={loadDemo} leftIcon={<Sparkles className="w-5 h-5" />}>
            Load Demo &amp; Generate
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-surface-200/70 dark:border-surface-800/70 bg-white/70 dark:bg-surface-900/60 backdrop-blur-xl grain">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-500/12 via-transparent to-accent-500/10" />
        <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 -bottom-16 h-56 w-56 rounded-full bg-ember-500/20 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] items-center px-6 py-8 sm:px-9 sm:py-11">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <RoutineOSMark uid="hero" size={22} />
              <span className="eyebrow text-brand-500">RoutineOS</span>
              <span className="h-3 w-px bg-surface-300 dark:bg-surface-700" />
              <span className="eyebrow text-surface-400 dark:text-surface-500">Your AI life planner</span>
            </div>

            <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight leading-[1.04] text-surface-900 dark:text-white">
              Build consistency.
              <br />
              <span className="gradient-text">Protect your priorities.</span>
              <br />
              Adapt when life changes.
            </h1>

            <div className="mt-6 flex items-start gap-3">
              <span className={cn(
                'mt-2 w-2.5 h-2.5 rounded-full flex-shrink-0',
                agentStatus.status === 'ready' && 'bg-success-500 shadow-[0_0_12px_rgba(34,197,94,0.9)]',
                agentStatus.status === 'idle' && 'bg-surface-400',
                (agentStatus.status === 'planning' || agentStatus.status === 'understanding' || agentStatus.status === 'optimizing') && 'bg-brand-500 animate-pulse shadow-glow',
                agentStatus.status === 'replanning' && 'bg-warning-500 animate-pulse',
                agentStatus.status === 'needs_approval' && 'bg-ember-500 animate-pulse shadow-glow-ember',
              )} />
              <div className="min-w-0">
                <p className="font-display font-semibold text-lg sm:text-xl text-surface-900 dark:text-surface-100 leading-snug">
                  {config?.coach}
                </p>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{agentStatus.message}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <InsightChip icon={Zap} tone="brand">
                {todayFocusH > 0 ? `${todayFocusH}h` : '—'} of focused time available today
              </InsightChip>
              <InsightChip icon={ShieldCheck} tone="ember">
                {goals.length} priorit{goals.length === 1 ? 'y' : 'ies'} protected
              </InsightChip>
              {currentRoutine && (
                <InsightChip icon={TrendingUp} tone="violet">
                  Plan score {planScore}%
                </InsightChip>
              )}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {currentRoutine && !pendingProposal && (
                <Button
                  variant="secondary"
                  onClick={() => setShowChangeModal(true)}
                  leftIcon={<Pencil className="w-4 h-4" />}
                >
                  Change Commitment
                </Button>
              )}
              <Button
                onClick={handleGenerate}
                disabled={agentStatus.status === 'understanding' || agentStatus.status === 'planning' || agentStatus.status === 'optimizing'}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                {agentStatus.status === 'understanding' || agentStatus.status === 'planning' || agentStatus.status === 'optimizing'
                  ? 'Generating...'
                  : 'Generate My Week'}
              </Button>
            </div>
          </div>

          <div className="relative justify-self-center lg:justify-self-end">
            <AgentCompanion
              state={agentStatus.status as AgentState}
              size={250}
              className="scale-[0.72] sm:scale-90 lg:scale-100 origin-center"
            />
          </div>
        </div>
      </section>

      <AnimatePresence>
        {lastAction && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            <div className={cn(
              'flex items-center gap-3 px-5 py-4 rounded-2xl border',
              lastAction.type === 'approved'
                ? 'bg-success-50 dark:bg-success-500/10 border-success-500/30'
                : 'bg-surface-100 dark:bg-surface-800 border-surface-300 dark:border-surface-700'
            )}>
              {lastAction.type === 'approved' ? (
                <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
              ) : (
                <Ban className="w-5 h-5 text-surface-500 flex-shrink-0" />
              )}
              <p className={cn(
                'font-medium',
                lastAction.type === 'approved' ? 'text-success-700 dark:text-success-400' : 'text-surface-600 dark:text-surface-400'
              )}>
                {lastAction.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PROGRESSION ────────────────────────────────────── */}
      <PageSection delay={0.1}>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
          <Card variant="elevated" padding="lg" className="relative overflow-hidden">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/15 blur-3xl" />
            <div className="relative flex items-center gap-5">
              <AgentOrb
                state={agentStatus.status as AgentState}
                size="md"
                showProgress={agentStatus.status !== 'idle' && agentStatus.status !== 'ready'}
                progress={agentStatus.progress ?? 0}
                showLabel={false}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="eyebrow text-surface-400 dark:text-surface-500">Coach status</span>
                  <Badge variant={agentStatus.status === 'ready' ? 'success' : agentStatus.status === 'error' ? 'danger' : 'primary'} size="sm" dot>
                    {config?.label}
                  </Badge>
                </div>
                <p className="font-display font-semibold text-xl text-surface-900 dark:text-surface-100 leading-snug">
                  {config?.coach}
                </p>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{agentStatus.message}</p>
              </div>
            </div>
          </Card>

          <MetricCard
            icon={TrendingUp}
            tone="brand"
            label="Focus hours this week"
            value={currentRoutine ? `${weekFocusH}h` : '—'}
            hint={currentRoutine ? `${focusBlocks.length} focus blocks` : 'Generate to measure'}
          />

          <MetricCard
            icon={Activity}
            tone="violet"
            label="Weekly consistency"
            value={currentRoutine ? `${consistency}%` : '—'}
            hint={currentRoutine ? `${daysScheduled} / 7 days scheduled` : 'No plan yet'}
            bar={consistency}
          />

          <Card variant="elevated" padding="md" className="flex items-center gap-4">
            <ProgressRing progress={planScore} size={68} strokeWidth={6} color="success" />
            <div className="min-w-0">
              <p className="text-xs text-surface-500 dark:text-surface-400">Plan score</p>
              <p className="font-display font-bold text-3xl text-surface-900 dark:text-surface-100 leading-none mt-1">
                {currentRoutine ? planScore : '—'}
              </p>
              <p className="text-xs text-surface-400 dark:text-surface-500 mt-1.5">
                {currentRoutine ? 'Priorities protected' : 'Awaiting plan'}
              </p>
            </div>
          </Card>
        </div>
      </PageSection>

      <PageSection delay={0.15}>
        <SectionTitle>Overview</SectionTitle>
        <CardGrid columns={4} gap={4} className="mt-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Card variant="elevated" padding="md" className="text-center">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3',
                  stat.color === 'brand' && 'bg-brand-100 dark:bg-brand-900/30',
                  stat.color === 'success' && 'bg-success-100 dark:bg-success-500/20',
                  stat.color === 'accent' && 'bg-accent-100 dark:bg-accent-900/30',
                  stat.color === 'warning' && 'bg-warning-100 dark:bg-warning-500/20',
                )}>
                  <stat.icon className={cn(
                    'w-6 h-6',
                    stat.color === 'brand' && 'text-brand-600 dark:text-brand-400',
                    stat.color === 'success' && 'text-success-600 dark:text-success-400',
                    stat.color === 'accent' && 'text-accent-600 dark:text-accent-400',
                    stat.color === 'warning' && 'text-warning-600 dark:text-warning-400',
                  )} />
                </div>
                <p className="font-display font-bold text-3xl text-surface-900 dark:text-surface-100">{stat.value}</p>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </CardGrid>
      </PageSection>

      {pendingProposal && (
        <PageSection delay={0.18}>
          <ReplanPreview />
        </PageSection>
      )}

      {currentRoutine && (
        <PageSection delay={0.2}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <SectionTitle>This Week&rsquo;s Routine</SectionTitle>
              <span className="eyebrow text-surface-400 dark:text-surface-500 hidden sm:inline">Training plan</span>
            </div>
            <Badge variant="success" dot>Ready</Badge>
          </div>
          <WeeklyTimelinePreview routine={currentRoutine} />
        </PageSection>
      )}

      {!currentRoutine && hasData && (
        <PageSection delay={0.2}>
          <Card variant="outlined" padding="lg" className="text-center py-12">
            <Sparkles className="w-12 h-12 mx-auto text-brand-500 mb-4" />
            <h3 className="font-display font-semibold text-xl text-surface-900 dark:text-surface-100 mb-2">Ready to Plan</h3>
            <p className="text-surface-600 dark:text-surface-400 mb-6 max-w-md mx-auto">
              Your context is set. Click "Generate My Week" to let the agent create your personalized routine.
            </p>
            <Button size="lg" onClick={handleGenerate} leftIcon={<Sparkles className="w-5 h-5" />}>
              Generate My Week
            </Button>
          </Card>
        </PageSection>
      )}

      <PageSection delay={0.25}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ContextCard title="Fixed Commitments" count={commitments.length} icon={Calendar} color="brand" items={commitments.slice(0, 3)} emptyMsg="No commitments added" />
          <ContextCard title="Goals" count={goals.length} icon={Target} color="success" items={goals.slice(0, 3)} emptyMsg="No goals set" />
          <ContextCard title="Recurring Tasks" count={recurringTasks.length} icon={Brain} color="accent" items={recurringTasks.slice(0, 3)} emptyMsg="No recurring tasks" />
        </div>
      </PageSection>

      <ChangeCommitmentModal
        open={showChangeModal}
        onClose={() => setShowChangeModal(false)}
        commitments={commitments}
        onSave={async (id, start, end) => {
          setShowChangeModal(false);
          await triggerReplan(id, { start, end });
        }}
      />
    </div>
  );
}

function ChangeCommitmentModal({ open, onClose, commitments, onSave }: {
  open: boolean;
  onClose: () => void;
  commitments: Commitment[];
  onSave: (id: string, start: string, end: string) => void;
}) {
  const fixed = commitments.filter((c) => c.type === 'fixed');
  const [selectedId, setSelectedId] = useState(fixed[0]?.id || '');
  const [start, setStart] = useState('19:30');
  const [end, setEnd] = useState('20:30');

  const selected = fixed.find((c) => c.id === selectedId);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const c = fixed.find((f) => f.id === id);
    if (c) {
      setStart(c.timeSlot.start);
      setEnd(c.timeSlot.end);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white dark:bg-surface-900 rounded-3xl shadow-strong border border-surface-200 dark:border-surface-800 w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Pencil className="w-4 h-4 text-brand-500" />
                <h2 className="font-display font-semibold text-lg text-surface-900 dark:text-surface-100">Change Commitment</h2>
              </div>
              <p className="text-sm text-surface-500 dark:text-surface-400">Modify a fixed commitment time</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" aria-label="Close">
              <X className="w-5 h-5 text-surface-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Commitment</label>
              <div className="space-y-2">
                {fixed.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(c.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                      selectedId === c.id
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-sm'
                        : 'border-surface-200 dark:border-surface-800 hover:border-surface-300 dark:hover:border-surface-700'
                    )}
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-surface-900 dark:text-surface-100">{c.title}</p>
                      <p className="text-xs text-surface-500 dark:text-surface-400 font-mono">
                        {c.timeSlot.start} – {c.timeSlot.end}
                        {c.recurrenceDays && ` · ${c.recurrenceDays.length} days`}
                      </p>
                    </div>
                    {selectedId === c.id && <Check className="w-4 h-4 text-brand-500 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">New Start</label>
                <input
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="input font-mono"
                />
              </div>
              <div>
                <label className="label">New End</label>
                <input
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="input font-mono"
                />
              </div>
            </div>

            {selected && (
              <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800">
                <p className="text-xs text-surface-500 dark:text-surface-400 mb-1">Before</p>
                <p className="text-sm font-mono text-surface-700 dark:text-surface-300">
                  {selected.timeSlot.start} – {selected.timeSlot.end} · {selected.title}
                </p>
                <div className="flex items-center gap-1 my-1.5 text-brand-500">
                  <ArrowRight className="w-3 h-3" />
                </div>
                <p className="text-xs text-surface-500 dark:text-surface-400 mb-1">After</p>
                <p className="text-sm font-mono text-surface-700 dark:text-surface-300">
                  {start} – {end} · {selected.title}
                </p>
              </div>
            )}

            <Button
              fullWidth
              onClick={() => onSave(selectedId, start, end)}
              leftIcon={<AlertTriangle className="w-4 h-4" />}
            >
              Save &amp; Detect Conflicts
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ReplanPreview() {
  const { pendingProposal, approveProposal, rejectProposal } = usePlannerStore();
  if (!pendingProposal) return null;

  const affectedTitles = Array.from(
    new Set(
      pendingProposal.conflicts
        .flatMap((c) => c.affectedBlockIds)
        .map((id) => pendingProposal.originalRoutine?.blocks.find((b) => b.id === id)?.title)
        .filter((t): t is string => Boolean(t))
    )
  );

  return (
    <Card variant="elevated" padding="lg" className="relative overflow-hidden border-2 border-ember-500/40 shadow-glow-ember">
      <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-ember-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-24 h-56 w-56 rounded-full bg-brand-500/15 blur-3xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-start gap-4 justify-between mb-6">
        <div className="flex items-start gap-4 min-w-0">
          <AgentOrb state="replanning" size="sm" showLabel={false} className="flex-shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-display font-semibold text-lg text-surface-900 dark:text-surface-100">
                Commitment changed.
              </h3>
              <Badge variant="warning" dot>Needs Approval</Badge>
            </div>
            <p className="text-sm text-surface-600 dark:text-surface-400">{pendingProposal.reasoning}</p>
          </div>
        </div>
      </div>

      {/* CONFLICT DETECTED */}
      {pendingProposal.conflicts.length > 0 && (
        <div className="relative mb-6 p-4 rounded-2xl bg-white/70 dark:bg-surface-900/70 border border-danger-500/40">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-danger-500" />
            <span className="eyebrow text-danger-600 dark:text-danger-400">
              Conflict detected · {pendingProposal.conflicts.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(affectedTitles.length
              ? affectedTitles
              : pendingProposal.conflicts.map((c) => c.description)
            ).slice(0, 6).map((title) => (
              <span
                key={title}
                className="inline-flex items-center gap-2 rounded-lg border border-danger-500/35 bg-white dark:bg-surface-900 px-2.5 py-1.5 text-xs font-medium text-surface-800 dark:text-surface-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-danger-500" />
                {title}
              </span>
            ))}
          </div>
          <p className="text-xs text-danger-600/80 dark:text-danger-400/80 mt-3">
            {pendingProposal.conflicts[0]?.description}
          </p>
        </div>
      )}

      {/* CURRENT PLAN → ADAPTING → UPDATED PLAN */}
      <div className="relative mb-6">
        <div className="grid grid-cols-3 gap-2 items-center">
          <StepNode label="Current plan" state="done" />
          <StepNode label="Adapting" state="active" />
          <StepNode label="Updated plan" state="next" />
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800">
            <p className="eyebrow text-surface-400 dark:text-surface-500 mb-2.5">Before</p>
            {pendingProposal.changes.slice(0, 4).map((change, i) => (
              <p key={i} className="text-xs font-mono text-surface-600 dark:text-surface-400 mb-1.5">
                {change.from?.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}{' – '}
                {change.from?.end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
            ))}
          </div>
          <div className="p-4 rounded-2xl border border-brand-500/40 bg-brand-500/10 dark:bg-brand-900/20">
            <p className="eyebrow text-brand-500 mb-2.5">After</p>
            {pendingProposal.changes.slice(0, 4).map((change, i) => (
              <p key={i} className="text-xs font-mono text-surface-700 dark:text-surface-300 mb-1.5">
                {change.to?.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}{' – '}
                {change.to?.end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                {change.type === 'move' && <span className="text-brand-500 ml-1.5">← moved</span>}
                {change.type === 'remove' && <span className="text-danger-500 ml-1.5">← removed</span>}
                {change.type === 'add' && <span className="text-success-500 ml-1.5">← added</span>}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="relative space-y-2 mb-6">
        {pendingProposal.changes.slice(0, 5).map((change, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800"
          >
            <Badge variant={change.type === 'move' ? 'warning' : change.type === 'add' ? 'success' : 'neutral'} size="sm">
              {change.type.toUpperCase()}
            </Badge>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                {change.from?.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                {' → '}
                {change.to?.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400 truncate">{change.reason}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="relative text-sm text-surface-600 dark:text-surface-300 mb-5">
        Your priorities are protected. I re-sequenced the affected blocks and kept your recovery time intact.
      </p>

      <div className="relative flex flex-wrap items-center gap-3">
        <Button onClick={approveProposal} leftIcon={<CheckCircle className="w-4 h-4" />}>
          Approve New Plan
        </Button>
        <Button variant="secondary" onClick={rejectProposal} leftIcon={<Ban className="w-4 h-4" />}>
          Reject
        </Button>
      </div>
    </Card>
  );
}

function StepNode({ label, state }: { label: string; state: 'done' | 'active' | 'next' }) {
  return (
    <div className="flex flex-col items-center text-center gap-2">
      <div
        className={cn(
          'w-full h-1.5 rounded-full',
          state === 'done' && 'bg-brand-500/70',
          state === 'active' && 'bg-gradient-to-r from-brand-400 via-ember-400 to-accent-500 animate-pulse shadow-glow-ember',
          state === 'next' && 'bg-surface-300 dark:bg-surface-700'
        )}
      />
      <span
        className={cn(
          'eyebrow',
          state === 'done' && 'text-brand-500',
          state === 'active' && 'text-ember-500',
          state === 'next' && 'text-surface-400 dark:text-surface-500'
        )}
      >
        {state === 'active' && '▼ '}
        {label}
      </span>
    </div>
  );
}

function WeeklyTimelinePreview({ routine }: { routine: WeeklyRoutine }) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
  const timeSlots = ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00'];

  return (
    <Card variant="elevated" padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200 dark:border-surface-800">
              <th className="w-20 py-3.5 px-4 text-left font-semibold text-xs uppercase tracking-wider text-surface-400 dark:text-surface-500">Time</th>
              {days.map((day) => {
                const isToday = day === DAY_KEYS[(new Date().getDay() + 6) % 7];
                return (
                  <th
                    key={day}
                    className={cn(
                      'py-3.5 px-2 text-center font-semibold text-xs uppercase tracking-wider',
                      isToday
                        ? 'text-brand-500'
                        : 'text-surface-500 dark:text-surface-400'
                    )}
                  >
                    <span className={cn('inline-flex flex-col items-center gap-1', isToday && 'animate-rise')}>
                      {day.slice(0, 3)}
                      <span
                        className={cn(
                          'h-0.5 w-6 rounded-full',
                          isToday ? 'bg-gradient-to-r from-brand-400 to-accent-500 shadow-[0_0_8px_rgba(6,189,255,0.8)]' : 'bg-transparent'
                        )}
                      />
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time) => {
              const timeMin = parseInt(time.split(':')[0]) * 60;
              const isEvening = timeMin >= 18 * 60;
              const isMorning = timeMin < 12 * 60;
              return (
                <tr
                  key={time}
                  className={cn(
                    'border-b border-surface-100/70 dark:border-surface-800/40 transition-colors',
                    isEvening ? 'bg-surface-50/50 dark:bg-surface-900/50' : isMorning ? 'bg-white dark:bg-surface-950' : ''
                  )}
                >
                  <td className={cn(
                    'py-2.5 px-4 font-mono text-xs tabular-nums',
                    isEvening ? 'text-accent-500/70' : isMorning ? 'text-brand-500/70' : 'text-surface-400 dark:text-surface-500'
                  )}>
                    {time}
                  </td>
                  {days.map((day) => {
                    const block = routine.blocks.find((b) => {
                      if (b.day !== day) return false;
                      const startMin = b.start.getHours() * 60 + b.start.getMinutes();
                      const endMin = b.end.getHours() * 60 + b.end.getMinutes();
                      return startMin <= timeMin && timeMin < endMin;
                    });
                    return (
                      <td key={day} className="py-1 px-1">
                        {block && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.22 }}
                            className="group relative h-9 rounded-lg overflow-hidden px-1.5 flex flex-col justify-center cursor-default transition-all hover:scale-[1.04] hover:shadow-md"
                            style={{
                              backgroundColor: (block.color || '#06bdff') + '1f',
                              border: `1px solid ${(block.color || '#06bdff')}45`,
                              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 4px ${(block.color || '#06bdff')}18`,
                            }}
                            title={`${block.title} · ${block.priority} priority · ${block.type} · ${block.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} – ${block.end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                          >
                            <span
                              className="absolute left-0 top-0 h-full w-[3px]"
                              style={{ backgroundColor: block.color || '#06bdff' }}
                            />
                            <span
                              className="truncate text-[11px] font-semibold leading-tight"
                              style={{ color: block.color || '#06bdff' }}
                            >
                              {block.title}
                            </span>
                            <span className="flex items-center gap-[3px] mt-1">
                              {[0, 1, 2].map((p) => (
                                <span
                                  key={p}
                                  className="h-[3px] w-3 rounded-full"
                                  style={{
                                    backgroundColor:
                                      p < PIPES[block.priority]
                                        ? block.color || '#06bdff'
                                        : 'rgba(128,128,128,0.28)',
                                  }}
                                />
                              ))}
                              <span className="text-[9px] uppercase tracking-wider text-surface-400 dark:text-surface-500 ml-0.5">
                                {block.type === 'fixed' ? 'fixed' : block.type === 'sleep' ? 'rest' : block.type}
                              </span>
                            </span>
                          </motion.div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-surface-200/70 dark:border-surface-800/50 flex flex-wrap items-center gap-4 bg-surface-50/50 dark:bg-surface-800/30">
        {[
          { label: 'Fixed', color: '#06bdff' },
          { label: 'Goal', color: '#7c56ff' },
          { label: 'Recurring', color: '#22c55e' },
          { label: 'Rest', color: '#6366f1' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color + '30', border: `1px solid ${item.color}50` }} />
            <span className="text-xs text-surface-500 dark:text-surface-400">{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ContextCard({ title, count, icon: Icon, color, items, emptyMsg }: {
  title: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  items: { id: string; title: string; color?: string; priority?: string }[];
  emptyMsg: string;
}) {
  return (
    <Card variant="elevated" padding="md">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center',
          color === 'brand' && 'bg-brand-100 dark:bg-brand-900/30',
          color === 'success' && 'bg-success-100 dark:bg-success-500/20',
          color === 'accent' && 'bg-accent-100 dark:bg-accent-900/30',
        )}>
          <Icon className={cn(
            'w-5 h-5',
            color === 'brand' && 'text-brand-600 dark:text-brand-400',
            color === 'success' && 'text-success-600 dark:text-success-400',
            color === 'accent' && 'text-accent-600 dark:text-accent-400',
          )} />
        </div>
        <div>
          <p className="font-medium text-surface-900 dark:text-surface-100">{title}</p>
          <p className="text-sm text-surface-500 dark:text-surface-400">{count} items</p>
        </div>
      </div>
      <div className="space-y-2">
        {items.length > 0 ? (
          items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color || '#06bdff' }} />
              <span className="text-sm text-surface-700 dark:text-surface-300 truncate flex-1">{item.title}</span>
              {item.priority && <Badge variant="neutral" size="sm">{item.priority}</Badge>}
            </motion.div>
          ))
        ) : (
          <p className="text-sm text-surface-500 dark:text-surface-400 text-center py-4">{emptyMsg}</p>
        )}
      </div>
    </Card>
  );
}

type Tone = 'brand' | 'violet' | 'ember';

const TONE: Record<Tone, { wrap: string; icon: string }> = {
  brand: {
    wrap: 'border-brand-500/35 bg-brand-500/10 text-brand-700 dark:text-brand-300',
    icon: 'text-brand-500',
  },
  violet: {
    wrap: 'border-accent-500/35 bg-accent-500/10 text-accent-700 dark:text-accent-300',
    icon: 'text-accent-500',
  },
  ember: {
    wrap: 'border-ember-500/40 bg-ember-500/10 text-ember-700 dark:text-ember-300',
    icon: 'text-ember-500',
  },
};

function InsightChip({
  icon: Icon,
  tone,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: Tone;
  children: React.ReactNode;
}) {
  return (
    <span className={cn('hud-chip border', TONE[tone].wrap)}>
      <Icon className={cn('w-3.5 h-3.5', TONE[tone].icon)} />
      {children}
    </span>
  );
}

function MetricCard({
  icon: Icon,
  tone,
  label,
  value,
  hint,
  bar,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: Tone;
  label: string;
  value: string;
  hint?: string;
  bar?: number;
}) {
  return (
    <Card variant="elevated" padding="md" className="flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-surface-500 dark:text-surface-400 leading-snug">{label}</p>
        <span className={cn('w-7 h-7 rounded-lg grid place-items-center border', TONE[tone].wrap)}>
          <Icon className={cn('w-4 h-4', TONE[tone].icon)} />
        </span>
      </div>
      <div className="mt-4">
        <p className="font-display font-bold text-3xl leading-none text-surface-900 dark:text-surface-100">
          {value}
        </p>
        {typeof bar === 'number' && bar > 0 && (
          <div className="mt-3 h-1.5 rounded-full bg-surface-200 dark:bg-surface-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-accent-500 transition-all duration-700"
              style={{ width: `${bar}%` }}
            />
          </div>
        )}
        {hint && <p className="text-xs text-surface-400 dark:text-surface-500 mt-2">{hint}</p>}
      </div>
    </Card>
  );
}
