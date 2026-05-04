import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64').toString('utf8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

function getStoragePathFromPublicUrl(fileUrl: string) {
  const marker = '/storage/v1/object/public/music_assets/';
  const index = fileUrl.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(fileUrl.substring(index + marker.length));
}

async function validateAdmin(token: string) {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.sub) {
    return { ok: false, status: 401, error: 'Invalid token' } as const;
  }

  const requesterId = payload.sub;
  const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=role&id=eq.${requesterId}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY as string,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!profileRes.ok) {
    return { ok: false, status: 403, error: 'Unable to validate requester' } as const;
  }

  const profileData = await profileRes.json().catch(() => []);
  if (!Array.isArray(profileData) || !profileData[0] || profileData[0].role !== 'admin') {
    return { ok: false, status: 403, error: 'Requires admin privileges' } as const;
  }

  return { ok: true } as const;
}

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
