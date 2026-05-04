import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import type { Project } from '../../../lib/types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProjects((data as Project[]) || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const deleteProject = async (projectId: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) throw error;
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const createProject = async (payload: { name: string; description?: string }) => {
    const { data, error } = await supabase.from('projects').insert([payload]).select().single();
    if (error) throw error;
    setProjects(prev => [data as Project, ...prev]);
    return data as Project;
  };

  return {
    projects,
    loadingProjects,
    error,
    fetchProjects,
    deleteProject,
    createProject,
  } as const;
}
