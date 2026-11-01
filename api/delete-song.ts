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

  const { songId } = req.body || {};
  if (!songId) return res.status(400).json({ error: 'Missing songId' });

  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string') return res.status(401).json({ error: 'Missing Authorization header' });
  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const adminCheck = await validateAdmin(token);
    if (!adminCheck.ok) return res.status(adminCheck.status).json({ error: adminCheck.error });

    // Fetch all asset files for storage cleanup
    const assetsRes = await fetch(`${SUPABASE_URL}/rest/v1/song_assets?select=id,file_url&song_id=eq.${songId}`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (!assetsRes.ok) {
      const details = await assetsRes.text();
      return res.status(500).json({ error: 'Failed fetching song assets', details });
    }

    const assets = (await assetsRes.json().catch(() => [])) as Array<{ id: string; file_url: string }>;

    for (const asset of assets) {
      const filePath = getStoragePathFromPublicUrl(asset.file_url);
      if (!filePath) continue;
      await fetch(`${SUPABASE_URL}/storage/v1/object/music_assets/${filePath}`, {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      });
    }

    const deleteAssetsRes = await fetch(`${SUPABASE_URL}/rest/v1/song_assets?song_id=eq.${songId}`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (!deleteAssetsRes.ok) {
      const details = await deleteAssetsRes.text();
      return res.status(500).json({ error: 'Failed deleting song assets rows', details });
    }

    const deleteSongRes = await fetch(`${SUPABASE_URL}/rest/v1/songs?id=eq.${songId}`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (!deleteSongRes.ok) {
      const details = await deleteSongRes.text();
      return res.status(500).json({ error: 'Failed deleting song row', details });
    }

    return res.status(200).json({ ok: true, deletedSongId: songId, assetsDeleted: assets.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}
