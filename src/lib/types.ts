export interface Project {
  id: string;
  name: string;
  description: string;
  cover_url: string;
}

export interface Song {
  author: string;
  tone: string;
  id: string;
  project_id: string;
  title: string;
  order_index: number;
}

export interface SongAsset {
  id: string;
  song_id: string;
  type: 'pista' | 'soprano' | 'contralto' | 'tenor' | 'baritono' | 'bajo' | 'pdf';
  file_url: string;
  display_name: string;
}

export interface Activity {
  id: string;
  title: string;
  event_date: string;
  location: string;
  description: string;
}