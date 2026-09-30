import type { Commitment, DayOfWeek } from '@/types/planning';

const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';
const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const CALENDAR_API = 'https://www.googleapis.com/calendar/v3/calendars';

const DAY_INDEX: DayOfWeek[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const CALENDAR_COLORS = [
  '#06bdff',
  '#22c55e',
  '#ff9d40',
  '#7c56ff',
  '#f45b5b',
  '#06bdff',
  '#ff7d16',
  '#22c55e',
];

export interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  status?: string;
}

export type CalendarStatus =
  | 'not_connected'
  | 'connecting'
  | 'connected'
  | 'syncing'
  | 'synced'
  | 'error'
  | 'setup_required';

export interface CalendarState {
  status: CalendarStatus;
  errorMessage: string | null;
  events: GoogleCalendarEvent[];
  importedCount: number;
  conflictCount: number;
  lastSyncedAt: Date | null;
  accessToken: string | null;
}

interface GoogleAccounts {
  oauth2: {
    initTokenClient: (config: {
      client_id: string;
      scope: string;
      callback: (response: { access_token?: string; error?: string; error_description?: string }) => void;
      error_callback?: (error: { type: string; message?: string }) => void;
    }) => {
      requestAccessToken: (options?: { prompt?: string }) => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleAccounts;
  }
}

export function getConfig() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY as string | undefined;
  return { clientId, apiKey };
}

export function isConfigured(): boolean {
  const { clientId } = getConfig();
  return Boolean(clientId && clientId.trim().length > 0);
}

let gisLoaded: Promise<void> | null = null;

function loadGisScript(): Promise<void> {
  if (window.google?.oauth2) return Promise.resolve();
  if (gisLoaded) return gisLoaded;

  gisLoaded = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services')));
      return;
    }

    const script = document.createElement('script');
    script.src = GIS_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script'));
    document.head.appendChild(script);
  });

  return gisLoaded;
}

export async function requestAccessToken(): Promise<string> {
  const { clientId } = getConfig();
  if (!clientId) {
    throw new Error('Google Calendar setup required: VITE_GOOGLE_CLIENT_ID is not set.');
  }

  await loadGisScript();

  if (!window.google?.oauth2) {
    throw new Error('Google Identity Services failed to load. Check your network connection.');
  }

  return new Promise<string>((resolve, reject) => {
    const tokenClient = window.google!.oauth2.initTokenClient({
      client_id: clientId,
      scope: CALENDAR_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(
            new Error(
              response.error_description || response.error || 'Google denied the authorization request.'
            )
          );
          return;
        }
        resolve(response.access_token);
      },
      error_callback: (error) => {
        reject(new Error(error.message || `Google OAuth error: ${error.type}`));
      },
    });

    tokenClient.requestAccessToken({ prompt: '' });
  });
}

export async function fetchPrimaryEvents(
  accessToken: string,
  maxResults = 100
): Promise<GoogleCalendarEvent[]> {
  const timeMin = new Date();
  timeMin.setDate(timeMin.getDate() - 7);
  const timeMax = new Date();
  timeMax.setDate(timeMax.getDate() + 21);

  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: String(maxResults),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const response = await fetch(`${CALENDAR_API}/primary/events?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    let detail = `Google Calendar API returned ${response.status}`;
    try {
      const body = await response.json();
      if (body?.error?.message) detail = body.error.message;
    } catch {
      /* keep default message */
    }
    if (response.status === 401) {
      throw new Error('Session expired. Please reconnect Google Calendar.');
    }
    throw new Error(detail);
  }

  const data = (await response.json()) as { items?: GoogleCalendarEvent[] };
  return (data.items || []).filter((event) => event.status !== 'cancelled');
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function eventsToCommitments(events: GoogleCalendarEvent[]): Commitment[] {
  const commitments: Commitment[] = [];

  events.forEach((event, index) => {
    const summary = (event.summary || 'Untitled event').trim();
    const startRaw = event.start?.dateTime || event.start?.date;
    const endRaw = event.end?.dateTime || event.end?.date;
    if (!startRaw || !endRaw) return;

    const startDate = new Date(startRaw);
    const endDate = new Date(endRaw);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return;

    const day = DAY_INDEX[startDate.getDay()];
    const start = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
    const end = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;
    if (start === end) return;

    commitments.push({
      id: `gcal-${event.id || index}`,
      title: summary,
      description: event.description || undefined,
      timeSlot: { start, end, day },
      isRecurring: false,
      priority: 'critical',
      type: 'fixed',
      source: 'calendar',
      color: CALENDAR_COLORS[index % CALENDAR_COLORS.length],
    });
  });

  return commitments;
}

export function getSetupInstructions(): string[] {
  return [
    'Create a project at console.cloud.google.com',
    'Enable the Google Calendar API',
    'Configure the OAuth consent screen (External, add yourself as a test user)',
    'Create credentials → OAuth client ID → Web application',
    'Add authorized JavaScript origins:',
    `  • http://localhost:5173 (development)`,
    `  • ${window.location.origin} (this deployment)`,
    'Set VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_API_KEY in your .env file',
    'Rebuild and redeploy',
  ];
}
