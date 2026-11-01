import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createValidateAdmin } from './lib/apiUtils';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  // When running locally without env set, we still allow build but runtime will error.
}

const validateAdmin = createValidateAdmin(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Missing id' });

  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string') return res.status(401).json({ error: 'Missing Authorization header' });
  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const adminCheck = await validateAdmin(token);
    if (!adminCheck.ok) return res.status(adminCheck.status).json({ error: adminCheck.error });

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
