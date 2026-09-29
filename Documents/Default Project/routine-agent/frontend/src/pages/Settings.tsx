import { PageHeader, PageSection } from '@/components/layout/PageLayout';
import { Card, CardTitle, CardDescription } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun, Globe, Clock } from 'lucide-react';

export function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your preferences"
      />
      <PageSection delay={0.1}>
        <div className="space-y-4">
          <Card padding="md" variant="elevated">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-brand-500" /> : <Sun className="w-5 h-5 text-warning-500" />}
                <div>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Toggle between light and dark mode</CardDescription>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-brand-600' : 'bg-surface-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                    theme === 'dark' ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </Card>

          <Card padding="md" variant="elevated">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-surface-500" />
              <div>
                <CardTitle>Timezone</CardTitle>
                <CardDescription>America/Los_Angeles</CardDescription>
              </div>
            </div>
          </Card>

          <Card padding="md" variant="elevated">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-surface-500" />
              <div>
                <CardTitle>Week Starts</CardTitle>
                <CardDescription>Monday</CardDescription>
              </div>
            </div>
          </Card>
        </div>
      </PageSection>
    </div>
  );
}
