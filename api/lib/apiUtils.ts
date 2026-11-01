export function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64').toString('utf8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export function getStoragePathFromPublicUrl(fileUrl: string): string | null {
  const marker = '/storage/v1/object/public/music_assets/';
  const index = fileUrl.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(fileUrl.substring(index + marker.length));
}

export type AdminCheck =
  | { ok: true }
  | { ok: false; status: number; error: string };

export function createValidateAdmin(
  supabaseUrl: string | undefined,
  supabaseAnonKey: string | undefined
) {
  return async function validateAdmin(token: string): Promise<AdminCheck> {
    const payload = decodeJwtPayload(token);
    if (!payload || !payload.sub) {
      return { ok: false, status: 401, error: 'Invalid token' };
    }

    const requesterId = payload.sub;
    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?select=role&id=eq.${requesterId}`,
      {
        headers: {
          apikey: supabaseAnonKey as string,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!profileRes.ok) {
      return { ok: false, status: 403, error: 'Unable to validate requester' };
    }

    const profileData = await profileRes.json().catch(() => []);
    if (
      !Array.isArray(profileData) ||
      !profileData[0] ||
      profileData[0].role !== 'admin'
    ) {
      return { ok: false, status: 403, error: 'Requires admin privileges' };
    }

    return { ok: true };
  };
}
