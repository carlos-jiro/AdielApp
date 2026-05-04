/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export function useInviteMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const invite = async (payload: { email: string; full_name: string; voice_part: string; group_role: string; }) => {
    setLoading(true);
    setError(null);
    try {
      const systemRole = (payload.group_role === 'Director' || payload.group_role === 'Secretario') ? 'admin' : 'member';

      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: {
          email: payload.email,
          metadata: {
            full_name: payload.full_name,
            voice_part: payload.voice_part,
            group_role: payload.group_role,
            role: systemRole,
          },
        },
      });

      if (error) throw error;
      if (data && (data as any).error) throw new Error((data as any).error);
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { invite, loading, error } as const;
}
