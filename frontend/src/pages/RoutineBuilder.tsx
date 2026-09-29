import { PageHeader, PageSection } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui';

export function RoutineBuilder() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Routine Builder"
        description="Generate and refine your weekly schedule"
      />
      <PageSection delay={0.1}>
        <Card padding="lg">
          <p className="text-surface-500 dark:text-surface-400">
            Use the Dashboard to generate your routine, then return here to make adjustments.
          </p>
        </Card>
      </PageSection>
    </div>
  );
}
