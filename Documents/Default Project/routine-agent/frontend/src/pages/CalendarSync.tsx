import { PageHeader, PageSection } from '@/components/layout/PageLayout';
import { Card, Button, CardTitle, CardDescription } from '@/components/ui';
import { Calendar, CheckCircle, Link2, AlertTriangle } from 'lucide-react';

export function CalendarSync() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Connect and sync your calendar"
      />
      <PageSection delay={0.1}>
        <Card padding="lg" variant="elevated">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-brand-600 dark:text-brand-400" />
            </div>
            <CardTitle className="text-xl mb-2">Demo Calendar Integration</CardTitle>
            <CardDescription className="max-w-md mx-auto mb-6">
              A realistic demo of calendar sync. No real external calendar is connected — this demonstrates the integration flow.
            </CardDescription>
            <Button leftIcon={<Link2 className="w-4 h-4" />}>
              Connect Calendar
            </Button>
          </div>
        </Card>
      </PageSection>

      <PageSection delay={0.15}>
        <Card padding="lg" variant="elevated">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success-500" />
              <span className="text-surface-700 dark:text-surface-300">Calendar connected</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success-500" />
              <span className="text-surface-700 dark:text-surface-300">Imported 8 fixed events</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success-500" />
              <span className="text-surface-700 dark:text-surface-300">Free time detected</span>
            </div>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-warning-500" />
              <span className="text-surface-700 dark:text-surface-300">2 conflicts identified</span>
            </div>
          </div>
        </Card>
      </PageSection>
    </div>
  );
}
