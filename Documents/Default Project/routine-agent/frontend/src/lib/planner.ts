import {
  Commitment,
  Goal,
  RecurringTask,
  UserPreferences,
  ScheduledBlock,
  WeeklyRoutine,
  Conflict,
  DayOfWeek,
  DAYS_ORDER,
  timeToMinutes,
  minutesToTime,
  getWeekStart,
  generateId,
  Priority,
} from '@/types/planning';

interface TimeBlock {
  day: DayOfWeek;
  startMin: number;
  endMin: number;
  type: 'fixed' | 'goal' | 'recurring' | 'break' | 'sleep' | 'buffer';
  title: string;
  sourceId: string;
  priority: Priority;
  color?: string;
}

const PRIORITY_WEIGHT: Record<Priority, number> = {
  critical: 100,
  high: 75,
  medium: 50,
  low: 25,
};

function createDateFromMinutes(day: DayOfWeek, minutes: number, weekStart: Date): Date {
  const dayIndex = DAYS_ORDER.indexOf(day);
  const date = new Date(weekStart);
  date.setDate(date.getDate() + dayIndex);
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return date;
}

function getAvailableSlots(
  day: DayOfWeek,
  preferences: UserPreferences,
  existingBlocks: TimeBlock[],
  _weekStart: Date
): { start: number; end: number }[] {
  const workHours = preferences.workingHours.find(w => w.day === day);
  if (!workHours || !workHours.isWorkingDay) return [];

  const workStart = timeToMinutes(workHours.start);
  const workEnd = timeToMinutes(workHours.end);
  const sleepStart = timeToMinutes(preferences.sleepSchedule.start);
  const sleepEnd = timeToMinutes(preferences.sleepSchedule.end);

  const occupied: { start: number; end: number }[] = [
    ...existingBlocks.map(b => ({ start: b.startMin, end: b.endMin })),
  ];

  if (sleepStart > sleepEnd) {
    occupied.push({ start: 0, end: sleepEnd });
    occupied.push({ start: sleepStart, end: 24 * 60 });
  } else {
    occupied.push({ start: sleepStart, end: sleepEnd });
  }

  occupied.sort((a, b) => a.start - b.start);

  const merged: { start: number; end: number }[] = [];
  for (const slot of occupied) {
    if (merged.length === 0 || slot.start > merged[merged.length - 1].end) {
      merged.push({ ...slot });
    } else {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, slot.end);
    }
  }

  const available: { start: number; end: number }[] = [];
  let current = workStart;
  for (const occupied of merged) {
    if (current < occupied.start) {
      available.push({ start: current, end: Math.min(occupied.start, workEnd) });
    }
    current = Math.max(current, occupied.end);
  }
  if (current < workEnd) {
    available.push({ start: current, end: workEnd });
  }

  return available.filter(s => s.end - s.start >= 15);
}

function findBestSlot(
  duration: number,
  preferredDays: DayOfWeek[],
  preferredRanges: { start: string; end: string }[],
  availableSlots: Map<DayOfWeek, { start: number; end: number }[]>,
  energyPeaks: { day: DayOfWeek; start: string; end: string }[]
): { day: DayOfWeek; start: number; end: number } | null {
  let best: { day: DayOfWeek; start: number; end: number; score: number } | null = null;

  for (const day of preferredDays) {
    const slots = availableSlots.get(day) || [];
    for (const slot of slots) {
      if (slot.end - slot.start < duration) continue;

      for (const range of preferredRanges) {
        const rangeStart = timeToMinutes(range.start);
        const rangeEnd = timeToMinutes(range.end);
        const overlapStart = Math.max(slot.start, rangeStart);
        const overlapEnd = Math.min(slot.end, rangeEnd);
        if (overlapEnd - overlapStart >= duration) {
          let score = 100;
          const peak = energyPeaks.find(p => p.day === day);
          if (peak) {
            const peakStart = timeToMinutes(peak.start);
            const peakEnd = timeToMinutes(peak.end);
            if (overlapStart >= peakStart && overlapEnd <= peakEnd) score += 50;
          }
          if (!best || score > best.score) {
            best = { day, start: overlapStart, end: overlapStart + duration, score };
          }
        }
      }

      if (slot.end - slot.start >= duration) {
        let score = 50;
        const peak = energyPeaks.find(p => p.day === day);
        if (peak) {
          const peakStart = timeToMinutes(peak.start);
          const peakEnd = timeToMinutes(peak.end);
          if (slot.start >= peakStart && slot.start + duration <= peakEnd) score += 30;
        }
        if (!best || score > best.score) {
          best = { day, start: slot.start, end: slot.start + duration, score };
        }
      }
    }
  }

  return best ? { day: best.day, start: best.start, end: best.end } : null;
}

export function generateWeeklyRoutine(
  commitments: Commitment[],
  goals: Goal[],
  recurringTasks: RecurringTask[],
  preferences: UserPreferences
): WeeklyRoutine {
  const weekStart = getWeekStart();
  const blocks: TimeBlock[] = [];
  const conflicts: Conflict[] = [];

  for (const commitment of commitments) {
    if (commitment.isRecurring && commitment.recurrenceDays) {
      for (const day of commitment.recurrenceDays) {
        const slot = commitment.timeSlot;
        const startMin = timeToMinutes(slot.start);
        const endMin = timeToMinutes(slot.end);
        blocks.push({
          day,
          startMin,
          endMin,
          type: 'fixed',
          title: commitment.title,
          sourceId: commitment.id,
          priority: commitment.priority,
          color: commitment.color,
        });
      }
    } else {
      const slot = commitment.timeSlot;
      const startMin = timeToMinutes(slot.start);
      const endMin = timeToMinutes(slot.end);
      blocks.push({
        day: slot.day,
        startMin,
        endMin,
        type: 'fixed',
        title: commitment.title,
        sourceId: commitment.id,
        priority: commitment.priority,
        color: commitment.color,
      });
    }
  }

  for (const day of DAYS_ORDER) {
    const sleepStart = timeToMinutes(preferences.sleepSchedule.start);
    const sleepEnd = timeToMinutes(preferences.sleepSchedule.end);
    if (sleepStart > sleepEnd) {
      blocks.push({
        day,
        startMin: 0,
        endMin: sleepEnd,
        type: 'sleep',
        title: 'Sleep',
        sourceId: 'sleep',
        priority: 'critical',
      });
      blocks.push({
        day,
        startMin: sleepStart,
        endMin: 24 * 60,
        type: 'sleep',
        title: 'Sleep',
        sourceId: 'sleep',
        priority: 'critical',
      });
    } else {
      blocks.push({
        day,
        startMin: sleepStart,
        endMin: sleepEnd,
        type: 'sleep',
        title: 'Sleep',
        sourceId: 'sleep',
        priority: 'critical',
      });
    }
  }

  const availableSlots = new Map<DayOfWeek, { start: number; end: number }[]>();
  for (const day of DAYS_ORDER) {
    availableSlots.set(day, getAvailableSlots(day, preferences, blocks.filter(b => b.day === day), weekStart));
  }

  const sortedGoals = [...goals].sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]);
  const goalsProgress: Record<string, number> = {};

  for (const goal of sortedGoals) {
    const targetMinutes = goal.targetHoursPerWeek * 60;
    let scheduledMinutes = 0;
    const preferredDays = goal.preferredDays && goal.preferredDays.length > 0 ? goal.preferredDays : DAYS_ORDER;
    const preferredRanges = goal.preferredTimeRanges && goal.preferredTimeRanges.length > 0
      ? goal.preferredTimeRanges.map(r => ({ start: r.start, end: r.end }))
      : preferences.workingHours.map(w => ({ start: w.start, end: w.end }));

    while (scheduledMinutes < targetMinutes) {
      const remaining = targetMinutes - scheduledMinutes;
      const sessionDuration = Math.min(
        goal.maxSessionDuration,
        Math.max(goal.minSessionDuration, remaining)
      );

      const slot = findBestSlot(
        sessionDuration,
        preferredDays,
        preferredRanges,
        availableSlots,
        preferences.energyPeaks
      );

      if (!slot) break;

      blocks.push({
        day: slot.day,
        startMin: slot.start,
        endMin: slot.end,
        type: 'goal',
        title: goal.title,
        sourceId: goal.id,
        priority: goal.priority,
        color: goal.color,
      });

      scheduledMinutes += sessionDuration;

      const daySlots = availableSlots.get(slot.day) || [];
      const updated = daySlots.map(s => {
        if (s.start <= slot.start && s.end >= slot.end) {
          const result: { start: number; end: number }[] = [];
          if (slot.start > s.start) result.push({ start: s.start, end: slot.start });
          if (slot.end < s.end) result.push({ start: slot.end, end: s.end });
          return result;
        }
        return [s];
      }).flat();
      availableSlots.set(slot.day, updated);
    }

    goalsProgress[goal.id] = Math.round((scheduledMinutes / targetMinutes) * 100);
  }

  const sortedTasks = [...recurringTasks].sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]);
  const unscheduledTasks: RecurringTask[] = [];

  for (const task of sortedTasks) {
    let scheduled = false;
    for (const day of task.days) {
      const slots = availableSlots.get(day) || [];
      const preferredRanges = task.preferredTimeRanges && task.preferredTimeRanges.length > 0
        ? task.preferredTimeRanges
        : preferences.workingHours.map(w => ({ start: w.start, end: w.end }));

      const slot = findBestSlot(
        task.duration,
        [day],
        preferredRanges,
        new Map([[day, slots]]),
        preferences.energyPeaks
      );

      if (slot) {
        blocks.push({
          day: slot.day,
          startMin: slot.start,
          endMin: slot.end,
          type: 'recurring',
          title: task.title,
          sourceId: task.id,
          priority: task.priority,
          color: task.color,
        });

        const daySlots = availableSlots.get(day) || [];
        const updated = daySlots.map(s => {
          if (s.start <= slot.start && s.end >= slot.end) {
            const result: { start: number; end: number }[] = [];
            if (slot.start > s.start) result.push({ start: s.start, end: slot.start });
            if (slot.end < s.end) result.push({ start: slot.end, end: s.end });
            return result;
          }
          return [s];
        }).flat();
        availableSlots.set(day, updated);
        scheduled = true;
        break;
      }
    }
    if (!scheduled) {
      unscheduledTasks.push(task);
    }
  }

  blocks.sort((a, b) => {
    const dayDiff = DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return a.startMin - b.startMin;
  });

  const scheduledBlocks: ScheduledBlock[] = blocks.map(b => ({
    id: generateId(),
    type: b.type,
    title: b.title,
    start: createDateFromMinutes(b.day, b.startMin, weekStart),
    end: createDateFromMinutes(b.day, b.endMin, weekStart),
    day: b.day,
    sourceId: b.sourceId,
    priority: b.priority,
    color: b.color,
  }));

  return {
    weekStart,
    blocks: scheduledBlocks,
    goalsProgress,
    unscheduledTasks,
    conflicts,
    score: 100,
    generatedAt: new Date(),
  };
}

export function detectConflicts(
  newCommitment: Commitment,
  currentRoutine: WeeklyRoutine,
  _preferences: UserPreferences
): { conflicts: Conflict[]; affectedBlocks: ScheduledBlock[] } {
  const conflicts: Conflict[] = [];
  const affectedBlocks: ScheduledBlock[] = [];

  const newBlocks: TimeBlock[] = [];
  if (newCommitment.isRecurring && newCommitment.recurrenceDays) {
    for (const day of newCommitment.recurrenceDays) {
      newBlocks.push({
        day,
        startMin: timeToMinutes(newCommitment.timeSlot.start),
        endMin: timeToMinutes(newCommitment.timeSlot.end),
        type: 'fixed',
        title: newCommitment.title,
        sourceId: newCommitment.id,
        priority: newCommitment.priority,
      });
    }
  } else {
    newBlocks.push({
      day: newCommitment.timeSlot.day,
      startMin: timeToMinutes(newCommitment.timeSlot.start),
      endMin: timeToMinutes(newCommitment.timeSlot.end),
      type: 'fixed',
      title: newCommitment.title,
      sourceId: newCommitment.id,
      priority: newCommitment.priority,
    });
  }

  for (const newBlock of newBlocks) {
    for (const block of currentRoutine.blocks) {
      if (block.day !== newBlock.day) continue;
      if (block.type === 'fixed' || block.type === 'sleep') continue;

      const blockStart = timeToMinutes(minutesToTime(block.start.getHours() * 60 + block.start.getMinutes()));
      const blockEnd = timeToMinutes(minutesToTime(block.end.getHours() * 60 + block.end.getMinutes()));

      if (newBlock.startMin < blockEnd && newBlock.endMin > blockStart) {
        conflicts.push({
          id: generateId(),
          type: 'overlap',
          severity: 'critical',
          description: `"${newCommitment.title}" overlaps with "${block.title}"`,
          affectedBlockIds: [block.id],
          suggestedResolution: 'Move or reschedule the flexible task',
        });
        affectedBlocks.push(block);
      }
    }
  }

  return { conflicts, affectedBlocks };
}

export function proposeReplan(
  changedCommitment: Commitment,
  currentRoutine: WeeklyRoutine,
  preferences: UserPreferences,
  allCommitments: Commitment[],
  allGoals: Goal[],
  allTasks: RecurringTask[]
): { proposal: { changes: { type: 'move' | 'resize' | 'remove' | 'add'; blockId: string; from: { start: Date; end: Date }; to: { start: Date; end: Date }; reason: string }[]; reasoning: string }; newRoutine: WeeklyRoutine } {
  const newRoutine = generateWeeklyRoutine(allCommitments, allGoals, allTasks, preferences);
  const changes: { type: 'move' | 'resize' | 'remove' | 'add'; blockId: string; from: { start: Date; end: Date }; to: { start: Date; end: Date }; reason: string }[] = [];

  for (const oldBlock of currentRoutine.blocks) {
    if (oldBlock.type === 'fixed' || oldBlock.type === 'sleep') continue;

    const newBlock = newRoutine.blocks.find(b => b.sourceId === oldBlock.sourceId && b.type === oldBlock.type);
    if (newBlock) {
      const oldStart = oldBlock.start.getTime();
      const oldEnd = oldBlock.end.getTime();
      const newStart = newBlock.start.getTime();
      const newEnd = newBlock.end.getTime();

      if (oldStart !== newStart || oldEnd !== newEnd) {
        changes.push({
          type: oldStart !== newStart && oldEnd !== newEnd ? 'move' : 'resize',
          blockId: oldBlock.id,
          from: { start: oldBlock.start, end: oldBlock.end },
          to: { start: newBlock.start, end: newBlock.end },
          reason: `Rescheduled due to "${changedCommitment.title}" change`,
        });
      }
    } else {
      changes.push({
        type: 'remove',
        blockId: oldBlock.id,
        from: { start: oldBlock.start, end: oldBlock.end },
        to: { start: oldBlock.start, end: oldBlock.end },
        reason: `Removed due to "${changedCommitment.title}" conflict`,
      });
    }
  }

  for (const newBlock of newRoutine.blocks) {
    if (newBlock.type === 'fixed' || newBlock.type === 'sleep') continue;
    const oldBlock = currentRoutine.blocks.find(b => b.sourceId === newBlock.sourceId && b.type === newBlock.type);
    if (!oldBlock) {
      changes.push({
        type: 'add',
        blockId: newBlock.id,
        from: { start: newBlock.start, end: newBlock.end },
        to: { start: newBlock.start, end: newBlock.end },
        reason: `Added to fill available time`,
      });
    }
  }

  return {
    proposal: {
      changes,
      reasoning: `Updated schedule to accommodate "${changedCommitment.title}". ${changes.filter(c => c.type === 'move').length} tasks moved, ${changes.filter(c => c.type === 'add').length} added, ${changes.filter(c => c.type === 'remove').length} removed.`,
    },
    newRoutine,
  };
}