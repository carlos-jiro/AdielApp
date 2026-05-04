import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  // When running locally without env set, we still allow build but runtime will error.
}

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64').toString('utf8');
    return JSON.parse(payload);
  } catch (e) {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Missing id' });

  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string') return res.status(401).json({ error: 'Missing Authorization header' });
  const token = authHeader.replace('Bearer ', '').trim();
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.sub) return res.status(401).json({ error: 'Invalid token' });
  const requesterId = payload.sub;

  try {
    // Verify requester is admin by querying profiles using their token (RLS applies)
    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=role&id=eq.${requesterId}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!profileRes.ok) return res.status(403).json({ error: 'Unable to validate requester' });
    const profileData = await profileRes.json();
    if (!Array.isArray(profileData) || !profileData[0] || profileData[0].role !== 'admin') {
      return res.status(403).json({ error: 'Requires admin privileges' });
    }

    // Delete profile row using service role
    const deleteProfileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: 'return=representation',
      },
    });

    if (!deleteProfileRes.ok) {
      const text = await deleteProfileRes.text();
      return res.status(500).json({ error: 'Failed deleting profile', details: text });
    }

    // Delete user from Auth
    const deleteAuthRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (!deleteAuthRes.ok) {
      const text = await deleteAuthRes.text();
      // profile already deleted; return warning
      return res.status(200).json({ warning: 'Profile deleted but failed to delete auth user', details: text });
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('delete-user error', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
