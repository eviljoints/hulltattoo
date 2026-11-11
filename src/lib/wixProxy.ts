import type { NextApiRequest, NextApiResponse } from 'next';
// Best-effort per-instance limit; supplement with shared Vercel WAF limits.
const requests = new Map<string, { count: number; until: number }>();
export function allowContactRequest(req: NextApiRequest, res: NextApiResponse): boolean {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); res.status(405).json({error:'Method not allowed'}); return false; }
  if (req.headers.origin) {
    try { if (new URL(req.headers.origin).host !== req.headers.host) { res.status(403).json({error:'Please submit using our website.'}); return false; } }
    catch { res.status(403).json({error:'Invalid origin'}); return false; }
  }
  const key = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  const now = Date.now();
  for (const [ip, value] of requests) if (value.until <= now) requests.delete(ip);
  if (requests.size >= 2000 && !requests.has(key)) { res.status(429).json({error:'Please try again later.'}); return false; }
  const current = requests.get(key) || {count:0,until:now+60000};
  requests.set(key, {...current,count:current.count+1});
  if (current.count >= 10) { res.setHeader('Retry-After','60'); res.status(429).json({error:'Please wait a minute before trying again.'}); return false; }
  return true;
}
export function shortText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}
export async function proxyToWix(endpoint: string, payload: unknown, res: NextApiResponse) {
  const secret = process.env.WIX_CONTACT_SECRET;
  if (!secret) return res.status(503).json({error:'Contact is temporarily unavailable. Please call the studio.'});
  try {
    if (new URL(endpoint).protocol !== 'https:') throw new Error('Invalid endpoint');
    const response = await fetch(endpoint, {method:'POST',headers:{'Content-Type':'application/json','x-contact-secret':secret},body:JSON.stringify(payload),signal:AbortSignal.timeout(20000)});
    if (!response.ok) return res.status(502).json({error:'Wix could not process this request. Please try again or call the studio.'});
    return res.status(200).json(await response.json());
  } catch {
    // Never log enquiry bodies, upload URLs, credentials or upstream responses.
    return res.status(502).json({error:'Unable to reach the studio right now. Please try again or call us.'});
  }
}
