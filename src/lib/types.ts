export interface Project {
  id: string;
  name: string;
  description: string;
  cover_url: string;
}

export interface Song {
  author: string | null;
  tone: string | null;
  lyrics_json?: SongLyricsJson | null;
  id: string;
  project_id: string | null;
  title: string;
  order_index: number | null;
}

export interface SongLyricsJson {
  text: string;
}

export type SongAssetType = 'pista' | 'soprano' | 'contralto' | 'tenor' | 'baritono' | 'bajo' | 'pdf';

export interface SongAsset {
  id: string;
  song_id: string;
  type: SongAssetType;
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
