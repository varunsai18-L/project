import { PageHeader, PageSection } from '@/components/layout/PageLayout';
import { Card, ProgressRing, Badge } from '@/components/ui';
import { usePlannerStore } from '@/lib/store';
import { motion } from 'framer-motion';

export function Goals() {
  const { goals } = usePlannerStore();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals"
        description="Track your progress across weekly goals"
      />
      <PageSection delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, i) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card padding="md" variant="elevated">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: goal.color + '20' }}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: goal.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-surface-900 dark:text-surface-100">{goal.title}</p>
                      <p className="text-sm text-surface-500 dark:text-surface-400">{goal.targetHoursPerWeek}h/week</p>
                    </div>
                  </div>
                  <ProgressRing progress={goal.progress} size={48} strokeWidth={3} color="brand" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="sm">{goal.priority}</Badge>
                  <Badge variant="neutral" size="sm">{goal.category}</Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </PageSection>
    </div>
  );
}
