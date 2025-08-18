// src/lib/adminAuth.ts
import type { NextApiRequest, NextApiResponse } from 'next';

function getCookieToken(req: NextApiRequest): string | null {
  // Next API routes expose parsed cookies at req.cookies
  const fromParsed = (req as any).cookies?.authToken as string | undefined;
  if (fromParsed) return fromParsed;

  // Fallback: parse raw cookie header (older Next versions / edge cases)
  const raw = req.headers.cookie || '';
  const m = raw.match(/(?:^|;\s*)authToken=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export async function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<boolean> {
  const envToken = (process.env.ADMIN_TOKEN || '').trim();

  // 1) Authorization header (if present)
  const authHeader = (req.headers.authorization || '').trim();
  const headerToken = authHeader.replace(/^Bearer\s+/i, '').trim();

  // 2) Cookie token (sent on navigations like window.location)
  const cookieToken = getCookieToken(req) || '';

  // Candidate token to validate
  const candidate = headerToken || cookieToken;

  // Fast-path: static admin override
  if (envToken && candidate && candidate === envToken) return true;

  // Validate via your existing /api/auth/validate
  if (candidate) {
    try {
      const proto = (req.headers['x-forwarded-proto'] as string) || 'http';
      const host = req.headers.host;
      const base = `${proto}://${host}`;
      const resp = await fetch(`${base}/api/auth/validate`, {
        headers: { authorization: `Bearer ${candidate}` },
      });
      if (resp.ok) return true;
    } catch {
      // fall-through to 401
    }
  }

  if (!res.headersSent) res.status(401).json({ error: 'Unauthorized' });
  return false;
}
