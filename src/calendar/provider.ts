import { CalendarProvider, CalendarEvent, RecurrenceRule, TimeRange } from '../core/types';
import { EventEmitter } from 'events';

export interface CalendarAdapter {
  connect(authCode: string): Promise<void>;
  disconnect(): Promise<void>;
  fetchEvents(range: TimeRange, calendarIds: string[]): Promise<CalendarEvent[]>;
  createEvent(event: Omit<CalendarEvent, 'id'>, calendarId: string): Promise<CalendarEvent>;
  updateEvent(event: CalendarEvent, calendarId: string): Promise<CalendarEvent>;
  deleteEvent(eventId: string, calendarId: string): Promise<void>;
  watchChanges(webhookUrl: string): Promise<string>;
  stopWatch(channelId: string): Promise<void>;
}

export class CalendarManager extends EventEmitter {
  private adapters: Map<string, CalendarAdapter> = new Map();
  private providers: Map<string, CalendarProvider> = new Map();
  private syncInterval: NodeJS.Timeout | null = null;

  registerAdapter(providerId: string, adapter: CalendarAdapter): void {
    this.adapters.set(providerId, adapter);
  }

  async connectProvider(provider: CalendarProvider, authCode: string): Promise<void> {
    const adapter = this.adapters.get(provider.id);
    if (!adapter) {
      throw new Error(`No adapter found for provider: ${provider.id}`);
    }

    await adapter.connect(authCode);
    provider.isConnected = true;
    this.providers.set(provider.id, provider);
    this.emit('providerConnected', provider);
  }

  async disconnectProvider(providerId: string): Promise<void> {
    const adapter = this.adapters.get(providerId);
    if (adapter) {
      await adapter.disconnect();
    }
    const provider = this.providers.get(providerId);
    if (provider) {
      provider.isConnected = false;
      this.emit('providerDisconnected', provider);
    }
  }

  async fetchAllEvents(range: TimeRange): Promise<CalendarEvent[]> {
    const allEvents: CalendarEvent[] = [];

    for (const [providerId, provider] of this.providers) {
      if (!provider.isConnected) continue;

      const adapter = this.adapters.get(providerId);
      if (!adapter) continue;

      try {
        const events = await adapter.fetchEvents(range, provider.calendarIds);
        allEvents.push(...events);
      } catch (error) {
        this.emit('syncError', { providerId, error });
      }
    }

    return allEvents;
  }

  async createEvent(event: Omit<CalendarEvent, 'id'>, providerId: string, calendarId: string): Promise<CalendarEvent> {
    const adapter = this.adapters.get(providerId);
    if (!adapter) throw new Error(`Provider not found: ${providerId}`);
    return adapter.createEvent(event, calendarId);
  }

  async updateEvent(event: CalendarEvent, providerId: string, calendarId: string): Promise<CalendarEvent> {
    const adapter = this.adapters.get(providerId);
    if (!adapter) throw new Error(`Provider not found: ${providerId}`);
    return adapter.updateEvent(event, calendarId);
  }

  async deleteEvent(eventId: string, providerId: string, calendarId: string): Promise<void> {
    const adapter = this.adapters.get(providerId);
    if (!adapter) throw new Error(`Provider not found: ${providerId}`);
    return adapter.deleteEvent(eventId, calendarId);
  }

  startAutoSync(intervalMinutes: number, lookaheadWeeks: number): void {
    if (this.syncInterval) clearInterval(this.syncInterval);

    this.syncInterval = setInterval(async () => {
      const now = new Date();
      const end = new Date(now);
      end.setDate(end.getDate() + lookaheadWeeks * 7);

      try {
        const events = await this.fetchAllEvents({ start: now, end });
        this.emit('eventsSynced', events);
      } catch (error) {
        this.emit('syncError', { error });
      }
    }, intervalMinutes * 60 * 1000);
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  getProviders(): CalendarProvider[] {
    return Array.from(this.providers.values());
  }

  getProvider(providerId: string): CalendarProvider | undefined {
    return this.providers.get(providerId);
  }
}

export function createGoogleCalendarAdapter(credentials: { clientId: string; clientSecret: string }): CalendarAdapter {
  return {
    async connect(authCode: string) {
      console.log('[Google Calendar] Connecting with auth code...');
    },
    async disconnect() {
      console.log('[Google Calendar] Disconnecting...');
    },
    async fetchEvents(range: TimeRange, calendarIds: string[]): Promise<CalendarEvent[]> {
      console.log(`[Google Calendar] Fetching events from ${range.start} to ${range.end}`);
      return [];
    },
    async createEvent(event: Omit<CalendarEvent, 'id'>, calendarId: string): Promise<CalendarEvent> {
      console.log('[Google Calendar] Creating event:', event.title);
      return { ...event, id: `google-${Date.now()}` };
    },
    async updateEvent(event: CalendarEvent, calendarId: string): Promise<CalendarEvent> {
      console.log('[Google Calendar] Updating event:', event.id);
      return event;
    },
    async deleteEvent(eventId: string, calendarId: string): Promise<void> {
      console.log('[Google Calendar] Deleting event:', eventId);
    },
    async watchChanges(webhookUrl: string): Promise<string> {
      console.log('[Google Calendar] Watching changes at:', webhookUrl);
      return `channel-${Date.now()}`;
    },
    async stopWatch(channelId: string): Promise<void> {
      console.log('[Google Calendar] Stopping watch:', channelId);
    }
  };
}

export function createOutlookCalendarAdapter(credentials: { clientId: string; clientSecret: string; tenantId: string }): CalendarAdapter {
  return {
    async connect(authCode: string) {
      console.log('[Outlook Calendar] Connecting with auth code...');
    },
    async disconnect() {
      console.log('[Outlook Calendar] Disconnecting...');
    },
    async fetchEvents(range: TimeRange, calendarIds: string[]): Promise<CalendarEvent[]> {
      console.log(`[Outlook Calendar] Fetching events from ${range.start} to ${range.end}`);
      return [];
    },
    async createEvent(event: Omit<CalendarEvent, 'id'>, calendarId: string): Promise<CalendarEvent> {
      console.log('[Outlook Calendar] Creating event:', event.title);
      return { ...event, id: `outlook-${Date.now()}` };
    },
    async updateEvent(event: CalendarEvent, calendarId: string): Promise<CalendarEvent> {
      console.log('[Outlook Calendar] Updating event:', event.id);
      return event;
    },
    async deleteEvent(eventId: string, calendarId: string): Promise<void> {
      console.log('[Outlook Calendar] Deleting event:', eventId);
    },
    async watchChanges(webhookUrl: string): Promise<string> {
      console.log('[Outlook Calendar] Watching changes at:', webhookUrl);
      return `channel-${Date.now()}`;
    },
    async stopWatch(channelId: string): Promise<void> {
      console.log('[Outlook Calendar] Stopping watch:', channelId);
    }
  };
}

export function createMockCalendarAdapter(events: CalendarEvent[] = []): CalendarAdapter {
  let storedEvents = [...events];
  let eventIdCounter = events.length;

  return {
    async connect(authCode: string) {
      console.log('[Mock Calendar] Connected');
    },
    async disconnect() {
      console.log('[Mock Calendar] Disconnected');
    },
    async fetchEvents(range: TimeRange, calendarIds: string[]): Promise<CalendarEvent[]> {
      return storedEvents.filter(e =>
        e.start >= range.start && e.end <= range.end
      );
    },
    async createEvent(event: Omit<CalendarEvent, 'id'>, calendarId: string): Promise<CalendarEvent> {
      const newEvent = { ...event, id: `mock-${++eventIdCounter}` };
      storedEvents.push(newEvent);
      return newEvent;
    },
    async updateEvent(event: CalendarEvent, calendarId: string): Promise<CalendarEvent> {
      const idx = storedEvents.findIndex(e => e.id === event.id);
      if (idx >= 0) storedEvents[idx] = event;
      return event;
    },
    async deleteEvent(eventId: string, calendarId: string): Promise<void> {
      storedEvents = storedEvents.filter(e => e.id !== eventId);
    },
    async watchChanges(webhookUrl: string): Promise<string> {
      return `mock-channel-${Date.now()}`;
    },
    async stopWatch(channelId: string): Promise<void> {
      console.log('[Mock Calendar] Stop watch:', channelId);
    }
  };
}