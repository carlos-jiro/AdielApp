import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import type { Song, SongAsset } from '../../../lib/types';

export function useSongDetails(songId?: string) {
  const [song, setSong] = useState<Song | null>(null);
  const [assets, setAssets] = useState<SongAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSongData = async () => {
    if (!songId) return;
    setLoading(true);
    setError(null);
    try {
      const { data: songData, error: songError } = await supabase
        .from('songs')
        .select('*')
        .eq('id', songId)
        .single();
      if (songError) throw songError;

      const { data: assetsData, error: assetsError } = await supabase
        .from('song_assets')
        .select('*')
        .eq('song_id', songId);
      if (assetsError) throw assetsError;

      setSong(songData || null);
      setAssets(assetsData || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (songId) fetchSongData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId]);

  return {
    song,
    assets,
    loading,
    error,
    refetch: fetchSongData,
  } as const;
}
