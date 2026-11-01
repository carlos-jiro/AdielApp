import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createValidateAdmin, getStoragePathFromPublicUrl } from './lib/apiUtils';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const validateAdmin = createValidateAdmin(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Missing SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY in env' });
  }

  const { assetId } = req.body || {};
  if (!assetId) return res.status(400).json({ error: 'Missing assetId' });

  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string') return res.status(401).json({ error: 'Missing Authorization header' });
  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const adminCheck = await validateAdmin(token);
    if (!adminCheck.ok) return res.status(adminCheck.status).json({ error: adminCheck.error });

    // Get asset row first to remove the file from storage
    const assetRes = await fetch(`${SUPABASE_URL}/rest/v1/song_assets?select=id,file_url&id=eq.${assetId}&limit=1`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (!assetRes.ok) {
      const details = await assetRes.text();
      return res.status(500).json({ error: 'Failed fetching asset', details });
    }

    const assetRows = await assetRes.json().catch(() => []);
    if (!Array.isArray(assetRows) || assetRows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const asset = assetRows[0] as { id: string; file_url: string };
    const filePath = getStoragePathFromPublicUrl(asset.file_url);

    if (filePath) {
      await fetch(`${SUPABASE_URL}/storage/v1/object/music_assets/${filePath}`, {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      });
    }

    const deleteAssetRes = await fetch(`${SUPABASE_URL}/rest/v1/song_assets?id=eq.${assetId}`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: 'return=representation',
      },
    });

    if (!deleteAssetRes.ok) {
      const details = await deleteAssetRes.text();
      return res.status(500).json({ error: 'Failed deleting asset row', details });
    }

    return res.status(200).json({ ok: true, deletedAssetId: assetId });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}
