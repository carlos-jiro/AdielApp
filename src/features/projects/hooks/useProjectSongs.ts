import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import type { Song } from '../../../lib/types';
import type { Project } from '../../../lib/types';

export function useProjectSongs(selectedProject: Project | 'ALL' | null, allSongs: Song[]) {
  const [displayedSongs, setDisplayedSongs] = useState<Song[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);

  useEffect(() => {
    const updateTable = async () => {
      setDisplayedSongs([]);
      setLoadingSongs(true);

      if (!selectedProject || selectedProject === 'ALL') {
        setDisplayedSongs(allSongs || []);
        setLoadingSongs(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('project_songs')
          .select(`
            song_id,
            songs:song_id (*)
          `)
          .eq('project_id', selectedProject.id);

        if (error) throw error;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const songsFromProject = (data?.map((item: any) => item.songs) as Song[]) || [];
        songsFromProject.sort((a: Song, b: Song) => a.title.localeCompare(b.title));
        setDisplayedSongs(songsFromProject);
      } catch (err) {
        console.error('Error fetching project songs:', err);
        setDisplayedSongs([]);
      } finally {
        setLoadingSongs(false);
      }
    };

    updateTable();
  }, [selectedProject, allSongs]);

  const addSongToProject = async (projectId: string, songId: string, allSongsLocal: Song[]) => {
    const { error } = await supabase.from('project_songs').insert({ project_id: projectId, song_id: songId });
    if (error) throw error;
    const songToAdd = allSongsLocal.find(s => s.id === songId);
    if (songToAdd) {
      setDisplayedSongs(prev => {
        const newList = [...prev, songToAdd];
        return newList.sort((a, b) => a.title.localeCompare(b.title));
      });
    }
  };

  const removeSongFromProject = async (projectId: string, songId: string) => {
    const { error } = await supabase
      .from('project_songs')
      .delete()
      .eq('project_id', projectId)
      .eq('song_id', songId);
    if (error) throw error;
    setDisplayedSongs(prev => prev.filter(s => s.id !== songId));
  };

  return {
    displayedSongs,
    loadingSongs,
    addSongToProject,
    removeSongFromProject,
    setDisplayedSongs,
  } as const;
}
