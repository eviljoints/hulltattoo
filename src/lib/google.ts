// src/lib/google.ts
import { google } from 'googleapis';
import { prisma } from '~/lib/prisma';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events', // read/write events
  'https://www.googleapis.com/auth/calendar.readonly',
];

export function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI!;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing Google OAuth env vars');
  }
  if (!/^https?:\/\//i.test(redirectUri)) {
    console.error('GOOGLE_REDIRECT_URI invalid:', redirectUri);
    throw new Error('Invalid GOOGLE_REDIRECT_URI');
  }
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

/** Save tokens on the artist and select a default calendar (primary) if missing */
export async function saveTokensForArtist(artistId: string, code: string) {
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);

  await prisma.artist.update({
    where: { id: artistId },
    data: { googleTokens: tokens as any },
  });

  oauth2Client.setCredentials(tokens);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const list = await calendar.calendarList.list({ maxResults: 50 });
  const primary = list.data.items?.find(c => c.primary) || list.data.items?.[0];

  if (primary?.id) {
    await prisma.artist.update({
      where: { id: artistId },
      data: { calendarId: primary.id },
    });
  }
}

/** Get a ready-to-use calendar client from stored tokens */
export async function getCalendarClientForArtist(artistId: string) {
  const artist = await prisma.artist.findUnique({
    where: { id: artistId },
    select: { googleTokens: true, calendarId: true },
  });
  if (!artist?.googleTokens) return null;

  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials(artist.googleTokens as any);
  return {
    calendar: google.calendar({ version: 'v3', auth: oauth2Client }),
    calendarId: artist.calendarId || 'primary',
  };
}

type Attendee = { email: string };

export async function insertEvent(params: {
  artistId: string;
  summary: string;
  description?: string;
  start: string | Date;
  end: string | Date;
  attendees?: Attendee[];
  location?: string;
  calendarId?: string;
  timeZone?: string; // default Europe/London
}): Promise<string | null> {
  const g = await getCalendarClientForArtist(params.artistId);
  if (!g) {
    console.warn('[gcal] No Google tokens for artist', params.artistId);
    return null;
  }
  const calendarId = params.calendarId || g.calendarId!;
  const timeZone = params.timeZone || 'Europe/London';
  const start = typeof params.start === 'string' ? new Date(params.start) : params.start;
  const end   = typeof params.end === 'string' ? new Date(params.end) : params.end;

  const resp = await g.calendar.events.insert({
    calendarId,
    requestBody: {
      summary: params.summary,
      description: params.description,
      location: params.location,
      start: { dateTime: start.toISOString(), timeZone },
      end:   { dateTime: end.toISOString(),   timeZone },
      attendees: params.attendees?.map(a => ({ email: a.email })),
    },
  });

  return resp.data.id || null;
}
