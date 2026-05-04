import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

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

function deleteUserDevApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'delete-user-dev-api',
    apply: 'serve',
    configureServer(server) {
      const SUPABASE_URL = env.SUPABASE_URL || process.env.SUPABASE_URL;
      const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
      const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

      const sendJson = (res: any, statusCode: number, payload: Record<string, unknown>) => {
        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(payload));
      };

      const readBody = async (req: any) => {
        let raw = '';
        await new Promise<void>((resolve) => {
          req.on('data', (chunk: Buffer) => { raw += String(chunk); });
          req.on('end', () => resolve());
        });
        return raw ? JSON.parse(raw) : {};
      };

      const getToken = (req: any) => ((req.headers.authorization || '') as string).replace('Bearer ', '').trim();

      type AdminCheck =
        | { ok: true }
        | { ok: false; error: string; status: number };

      const validateAdmin = async (token: string): Promise<AdminCheck> => {
        const payload = decodeJwtPayload(token);
        const requesterId = payload?.sub;
        if (!requesterId) return { ok: false, error: 'Invalid token', status: 401 };

        const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=role&id=eq.${requesterId}`, {
          headers: {
            apikey: SUPABASE_ANON_KEY as string,
            Authorization: `Bearer ${token}`,
          },
        });
        const profileData = await profileRes.json().catch(() => []);

        if (!profileRes.ok || !Array.isArray(profileData) || !profileData[0] || profileData[0].role !== 'admin') {
          return { ok: false, error: 'Requires admin privileges', status: 403 };
        }

        return { ok: true };
      };

      server.middlewares.use('/api/delete-user', async (req, res, next) => {
        if (req.method !== 'POST') return next();

        if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
          return sendJson(res, 500, { error: 'Missing SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY in env' });
        }

        try {
          const body = await readBody(req);
          const id = body?.id;
          if (!id) return sendJson(res, 400, { error: 'Missing id' });

          const token = getToken(req);
          const adminCheck = await validateAdmin(token);
          if (!adminCheck.ok) return sendJson(res, adminCheck.status, { error: adminCheck.error });

          const deleteProfileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${id}`, {
            method: 'DELETE',
            headers: {
              apikey: SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              Prefer: 'return=representation',
            },
          });

          if (!deleteProfileRes.ok) {
            const details = await deleteProfileRes.text();
            return sendJson(res, 500, { error: 'Failed deleting profile', details });
          }

          const deleteAuthRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, {
            method: 'DELETE',
            headers: {
              apikey: SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
          });

          if (!deleteAuthRes.ok) {
            const details = await deleteAuthRes.text();
            return sendJson(res, 500, { error: 'Failed deleting auth user', details });
          }

          return sendJson(res, 200, { ok: true });
        } catch (err: any) {
          return sendJson(res, 500, { error: err?.message || String(err) });
        }
      });

      server.middlewares.use('/api/delete-song-asset', async (req, res, next) => {
        if (req.method !== 'POST') return next();

        if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
          return sendJson(res, 500, { error: 'Missing SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY in env' });
        }

        try {
          const body = await readBody(req);
          const assetId = body?.assetId;
          if (!assetId) return sendJson(res, 400, { error: 'Missing assetId' });

          const token = getToken(req);
          const adminCheck = await validateAdmin(token);
          if (!adminCheck.ok) return sendJson(res, adminCheck.status, { error: adminCheck.error });

          const assetRes = await fetch(`${SUPABASE_URL}/rest/v1/song_assets?select=id,file_url&id=eq.${assetId}&limit=1`, {
            headers: {
              apikey: SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
          });

          if (!assetRes.ok) {
            const details = await assetRes.text();
            return sendJson(res, 500, { error: 'Failed fetching asset', details });
          }

          const assetRows = await assetRes.json().catch(() => []);
          if (!Array.isArray(assetRows) || assetRows.length === 0) {
            return sendJson(res, 404, { error: 'Asset not found' });
          }

          const filePath = getStoragePathFromPublicUrl(assetRows[0].file_url);
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
            },
          });

          if (!deleteAssetRes.ok) {
            const details = await deleteAssetRes.text();
            return sendJson(res, 500, { error: 'Failed deleting asset row', details });
          }

          return sendJson(res, 200, { ok: true, deletedAssetId: assetId });
        } catch (err: any) {
          return sendJson(res, 500, { error: err?.message || String(err) });
        }
      });

      server.middlewares.use('/api/delete-song', async (req, res, next) => {
        if (req.method !== 'POST') return next();

        if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
          return sendJson(res, 500, { error: 'Missing SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY in env' });
        }

        try {
          const body = await readBody(req);
          const songId = body?.songId;
          if (!songId) return sendJson(res, 400, { error: 'Missing songId' });

          const token = getToken(req);
          const adminCheck = await validateAdmin(token);
          if (!adminCheck.ok) return sendJson(res, adminCheck.status, { error: adminCheck.error });

          const assetsRes = await fetch(`${SUPABASE_URL}/rest/v1/song_assets?select=id,file_url&song_id=eq.${songId}`, {
            headers: {
              apikey: SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
          });

          if (!assetsRes.ok) {
            const details = await assetsRes.text();
            return sendJson(res, 500, { error: 'Failed fetching song assets', details });
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
            return sendJson(res, 500, { error: 'Failed deleting song assets rows', details });
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
            return sendJson(res, 500, { error: 'Failed deleting song row', details });
          }

          return sendJson(res, 200, { ok: true, deletedSongId: songId });
        } catch (err: any) {
          return sendJson(res, 500, { error: err?.message || String(err) });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      deleteUserDevApiPlugin(env),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"), // <--- Agrega esto
      },
    },
  };
})