// src/lib/google.ts
import { google } from 'googleapis';
import type { NextApiRequest } from 'next';
import { prisma } from '~/lib/prisma';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
  // add events read if you later want details:
  // 'https://www.googleapis.com/auth/calendar.events.readonly',
];

export function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI!;
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getAuthUrl(state: string) {
  const oauth2Client = getOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state,
  });
}

/** Exchange code -> tokens, save on artist + set a default calendarId if missing */
export async function saveTokensForArtist(artistId: string, code: string) {
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  // Persist tokens on artist
  const updated = await prisma.artist.update({
    where: { id: artistId },
    data: { googleTokens: tokens as any },
  });

  // Pick a default calendar (primary)
  oauth2Client.setCredentials(tokens);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const list = await calendar.calendarList.list({ maxResults: 50 });
  const primary = list.data.items?.find((c) => c.primary) || list.data.items?.[0];

  if (!updated.calendarId && primary?.id) {
    await prisma.artist.update({
      where: { id: artistId },
      data: { calendarId: primary.id || null },
    });
  }
}

/** Helper to get an authed Calendar client from stored artist tokens */
export async function getCalendarClientForArtist(artistId: string) {
  const artist = await prisma.artist.findUnique({
    where: { id: artistId },
    select: { googleTokens: true, calendarId: true },
  });
  if (!artist?.googleTokens) return null;

  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials(artist.googleTokens as any);

  // googleapis auto-refreshes if refresh_token is present
  return {
    calendar: google.calendar({ version: 'v3', auth: oauth2Client }),
    calendarId: artist.calendarId || 'primary',
  };
} type Attendee = { email: string; displayName?: string };

function toISO(v: string | Date) {
  return (v instanceof Date ? v : new Date(v)).toISOString();
}

/**
 * Insert a Google Calendar event for the given artist.
 * Requires the artist to have connected Google (googleTokens present).
 * Returns the created event id and htmlLink.
 */
export async function insertEvent(opts: {
  artistId: string;
  summary: string;
  description?: string;
  start: string | Date;        // ISO or Date
  end: string | Date;          // ISO or Date
  attendees?: Attendee[];
  location?: string;
  calendarId?: string;         // optional override; defaults to artist.calendarId or 'primary'
  timeZone?: string;           // defaults to 'Europe/London'
}) {
  const {
    artistId,
    summary,
    description,
    start,
    end,
    attendees,
    location,
    calendarId,
    timeZone = 'Europe/London',
  } = opts;

  const g = await getCalendarClientForArtist(artistId);
  if (!g) {
    throw new Error('Artist has not connected Google Calendar (no tokens).');
  }

  const cid = calendarId || g.calendarId || 'primary';

  const resp = await g.calendar.events.insert({
    calendarId: cid,
    requestBody: {
      summary,
      description,
      location,
      start: { dateTime: toISO(start), timeZone },
      end:   { dateTime: toISO(end),   timeZone },
      attendees,
    },
    sendUpdates: 'all',
  });

  return {
    eventId: resp.data.id || '',
    htmlLink: resp.data.htmlLink || '',
  };
}
