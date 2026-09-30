import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader, PageSection } from '@/components/layout/PageLayout';
import { Card, Button, Badge, CardTitle, CardDescription } from '@/components/ui';
import {
  Calendar,
  CheckCircle,
  Link2,
  AlertTriangle,
  RefreshCw,
  XCircle,
  Clock,
  Settings2,
  Info,
} from 'lucide-react';
import { cn } from '@/utils/helpers';
import { usePlannerStore } from '@/lib/store';
import type { Conflict } from '@/types/planning';
import {
  CalendarStatus,
  GoogleCalendarEvent,
  requestAccessToken,
  fetchPrimaryEvents,
  eventsToCommitments,
  isConfigured,
  getSetupInstructions,
} from '@/lib/googleCalendarService';

const STATUS_META: Record<
  CalendarStatus,
  { label: string; dotClass: string; message: string }
> = {
  not_connected: {
    label: 'Not connected',
    dotClass: 'bg-surface-400',
    message: 'Connect your Google Calendar to import events as fixed commitments.',
  },
  connecting: {
    label: 'Connecting',
    dotClass: 'bg-brand-500 animate-pulse',
    message: 'Waiting for Google sign-in…',
  },
  connected: {
    label: 'Connected',
    dotClass: 'bg-success-500',
    message: 'Authorized. Ready to import events.',
  },
  syncing: {
    label: 'Syncing',
    dotClass: 'bg-brand-500 animate-pulse',
    message: 'Fetching your upcoming calendar events…',
  },
  synced: {
    label: 'Synced',
    dotClass: 'bg-success-500',
    message: 'Calendar events imported as fixed commitments.',
  },
  error: {
    label: 'Error',
    dotClass: 'bg-danger-500',
    message: 'Something went wrong while connecting.',
  },
  setup_required: {
    label: 'Setup required',
    dotClass: 'bg-warning-500',
    message: 'Google OAuth is not configured for this build.',
  },
};

function formatEventTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatEventDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function CalendarSync() {
  const { importCalendarCommitments, currentRoutine, commitments } = usePlannerStore();

  const [status, setStatus] = useState<CalendarStatus>('not_connected');
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const busyRef = useRef(false);

  const configured = isConfigured();

  useEffect(() => {
    if (!configured) setStatus('setup_required');
  }, [configured]);

  const runSync = useCallback(
    async (token: string) => {
      setStatus('syncing');
      setError(null);
      try {
        const fetched = await fetchPrimaryEvents(token);
        setEvents(fetched);

        const commitmentsFromEvents = eventsToCommitments(fetched);
        setImportedCount(commitmentsFromEvents.length);

        const detected = importCalendarCommitments(commitmentsFromEvents);
        setConflicts(detected);
        setLastSyncedAt(new Date());
        setStatus('synced');
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error while syncing calendar.';
        setError(message);
        setStatus('error');
      }
    },
    [importCalendarCommitments]
  );

  const handleConnect = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setStatus('connecting');
    setError(null);
    try {
      const token = await requestAccessToken();
      await runSync(token);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to connect to Google Calendar.';
      setError(message);
      setStatus('error');
    } finally {
      busyRef.current = false;
    }
  }, [runSync]);

  const handleResync = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setStatus('connecting');
    setError(null);
    try {
      const token = await requestAccessToken();
      await runSync(token);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to resync calendar.';
      setError(message);
      setStatus('error');
    } finally {
      busyRef.current = false;
    }
  }, [runSync]);

  const handleDisconnect = useCallback(() => {
    setEvents([]);
    setConflicts([]);
    setImportedCount(0);
    setLastSyncedAt(null);
    setError(null);
    setStatus('not_connected');
  }, []);

  const meta = STATUS_META[status];
  const calendarCommitments = commitments.filter((c) => c.source === 'calendar');
  const busy = status === 'connecting' || status === 'syncing';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Connect Google Calendar and use your real events as fixed commitments"
      />

      <PageSection delay={0.05}>
        <Card padding="lg" variant="elevated">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div
              className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0',
                status === 'synced' || status === 'connected'
                  ? 'bg-success-100 dark:bg-success-500/20'
                  : status === 'error'
                    ? 'bg-danger-100 dark:bg-danger-500/20'
                    : status === 'setup_required'
                      ? 'bg-warning-100 dark:bg-warning-500/20'
                      : 'bg-brand-100 dark:bg-brand-900/30'
              )}
            >
              <Calendar
                className={cn(
                  'w-7 h-7',
                  status === 'synced' || status === 'connected'
                    ? 'text-success-600 dark:text-success-400'
                    : status === 'error'
                      ? 'text-danger-600 dark:text-danger-400'
                      : status === 'setup_required'
                        ? 'text-warning-600 dark:text-warning-400'
                        : 'text-brand-600 dark:text-brand-400'
                )}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-1">
                <span className={cn('w-2.5 h-2.5 rounded-full', meta.dotClass)} />
                <span className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">
                  Google Calendar
                </span>
                <Badge variant={status === 'synced' || status === 'connected' ? 'success' : status === 'error' ? 'danger' : status === 'setup_required' ? 'warning' : 'neutral'} size="sm">
                  {meta.label}
                </Badge>
              </div>
              <p className="font-display font-semibold text-lg text-surface-900 dark:text-surface-100">
                {meta.message}
              </p>
              {lastSyncedAt && (
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Last synced {lastSyncedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {status === 'not_connected' && (
                <Button onClick={handleConnect} leftIcon={<Link2 className="w-4 h-4" />} disabled={!configured}>
                  Connect Google Calendar
                </Button>
              )}
              {(status === 'connected' || status === 'synced') && (
                <>
                  <Button variant="secondary" onClick={handleResync} leftIcon={<RefreshCw className="w-4 h-4" />}>
                    Resync
                  </Button>
                  <Button variant="ghost" onClick={handleDisconnect}>
                    Disconnect
                  </Button>
                </>
              )}
              {status === 'error' && (
                <Button onClick={handleConnect} leftIcon={<RefreshCw className="w-4 h-4" />}>
                  Try again
                </Button>
              )}
              {busy && (
                <Button disabled leftIcon={<RefreshCw className="w-4 h-4 animate-spin" />}>
                  {status === 'connecting' ? 'Connecting…' : 'Syncing…'}
                </Button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-5 p-4 rounded-xl bg-danger-50 dark:bg-danger-500/10 border border-danger-500/30 flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-danger-600 dark:text-danger-400">Calendar connection failed</p>
                    <p className="text-sm text-danger-600/80 dark:text-danger-400/80 mt-0.5">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </PageSection>

      {status === 'setup_required' && (
        <PageSection delay={0.1}>
          <Card padding="lg" variant="elevated" className="border border-warning-500/30 bg-warning-50/50 dark:bg-warning-500/5">
            <div className="flex items-start gap-3">
              <Settings2 className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <CardTitle className="text-warning-700 dark:text-warning-400 mb-1">
                  Google Calendar setup required
                </CardTitle>
                <CardDescription className="mb-4">
                  OAuth credentials are missing, so no calendar is connected. Nothing is being faked — follow
                  these steps to enable real sync:
                </CardDescription>
                <ol className="space-y-1.5">
                  {getSetupInstructions().map((step, i) => (
                    <li key={i} className="text-sm text-surface-700 dark:text-surface-300 flex gap-2">
                      <span className="font-mono text-warning-600 dark:text-warning-400 flex-shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className={cn(!step.startsWith('  ') && 'font-medium')}>{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-4 p-3 rounded-lg bg-surface-100 dark:bg-surface-800 font-mono text-xs text-surface-600 dark:text-surface-400 break-all">
                  Required env vars: VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_API_KEY
                </div>
              </div>
            </div>
          </Card>
        </PageSection>
      )}

      {configured && status !== 'setup_required' && (
        <PageSection delay={0.15}>
          <Card padding="lg" variant="elevated">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <CheckItem
                ok={status === 'connected' || status === 'synced'}
                loading={status === 'connecting'}
                text="Google Calendar connected"
              />
              <CheckItem
                ok={status === 'synced' && importedCount > 0}
                loading={status === 'syncing'}
                text={status === 'synced' ? `${importedCount} events imported` : 'Events imported'}
              />
              <CheckItem
                ok={status === 'synced' && importedCount > 0}
                loading={false}
                text="Free time detected"
              />
              <CheckItem
                ok={conflicts.length === 0 && status === 'synced'}
                warn={conflicts.length > 0}
                loading={false}
                text={status === 'synced' ? `Conflicts detected: ${conflicts.length}` : 'Conflicts detected'}
              />
            </div>

            {status === 'not_connected' && (
              <div className="mt-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800">
                <Info className="w-4 h-4 text-surface-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-surface-500 dark:text-surface-400">
                  Once connected, your primary Google Calendar events become fixed commitments the planner
                  will route around — automatically avoiding double-booking.
                </p>
              </div>
            )}
          </Card>
        </PageSection>
      )}

      {conflicts.length > 0 && (
        <PageSection delay={0.2}>
          <Card padding="lg" variant="elevated" className="border border-warning-500/30 bg-warning-50/50 dark:bg-warning-500/5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-warning-500" />
              <CardTitle className="text-warning-700 dark:text-warning-400">
                {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} with your current routine
              </CardTitle>
            </div>
            <div className="space-y-2">
              {conflicts.slice(0, 8).map((conflict) => (
                <div
                  key={conflict.id}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800"
                >
                  <Badge variant={conflict.severity === 'critical' ? 'danger' : 'warning'} size="sm">
                    {conflict.severity}
                  </Badge>
                  <p className="text-sm text-surface-700 dark:text-surface-300">{conflict.description}</p>
                </div>
              ))}
            </div>
            {!currentRoutine && (
              <p className="mt-4 text-sm text-surface-500 dark:text-surface-400">
                Generate your week on the Dashboard to see how the planner routes around these events.
              </p>
            )}
          </Card>
        </PageSection>
      )}

      {events.length > 0 && (
        <PageSection delay={0.25}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-surface-900 dark:text-surface-100">
              Imported events
            </h2>
            <Badge variant="success" dot>{events.length} loaded</Badge>
          </div>

          <Card variant="elevated" padding="none" className="divide-y divide-surface-100 dark:divide-surface-800/60">
            <AnimatePresence initial={false}>
              {events.slice(0, 30).map((event, i) => {
                const startISO = event.start?.dateTime || event.start?.date || '';
                const endISO = event.end?.dateTime || event.end?.date || '';
                if (!startISO || !endISO) return null;
                return (
                  <motion.div
                    key={event.id || i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.4) }}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors"
                  >
                    <div
                      className="w-1.5 h-9 rounded-full flex-shrink-0"
                      style={{ backgroundColor: calendarCommitments[i % calendarCommitments.length]?.color || '#06bdff' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-surface-900 dark:text-surface-100 truncate">
                        {event.summary || 'Untitled event'}
                      </p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">
                        {formatEventDate(startISO)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-mono tabular-nums text-surface-700 dark:text-surface-300">
                        {formatEventTime(startISO)} – {formatEventTime(endISO)}
                      </p>
                      <p className="text-xs text-surface-400 dark:text-surface-500">fixed commitment</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {events.length > 30 && (
              <div className="px-5 py-3 text-center text-xs text-surface-400 dark:text-surface-500">
                Showing first 30 of {events.length} events
              </div>
            )}
          </Card>
        </PageSection>
      )}

      {importedCount === 0 && status === 'synced' && (
        <PageSection delay={0.25}>
          <Card padding="lg" variant="outlined" className="text-center py-10">
            <Calendar className="w-10 h-10 mx-auto text-surface-300 dark:text-surface-700 mb-3" />
            <p className="font-medium text-surface-700 dark:text-surface-300">No upcoming events found</p>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
              Your primary calendar has no scheduled events in the next few weeks.
            </p>
          </Card>
        </PageSection>
      )}
    </div>
  );
}

function CheckItem({
  ok,
  warn,
  loading,
  text,
}: {
  ok: boolean;
  warn?: boolean;
  loading: boolean;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {loading ? (
        <RefreshCw className="w-5 h-5 text-brand-500 animate-spin flex-shrink-0" />
      ) : ok ? (
        <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
      ) : warn ? (
        <AlertTriangle className="w-5 h-5 text-warning-500 flex-shrink-0" />
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-surface-300 dark:border-surface-700 flex-shrink-0" />
      )}
      <span
        className={cn(
          'text-sm',
          ok || warn ? 'text-surface-700 dark:text-surface-300 font-medium' : 'text-surface-400 dark:text-surface-500'
        )}
      >
        {text}
      </span>
    </div>
  );
}
