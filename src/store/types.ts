// src/store/types.ts

// Data Types
export interface GroupInfo {
  name: string;
  logo_url: string | null;
}

export interface UserInfo {
  id: string;
  full_name: string;
  avatar_url: string | null;
  group_role: string;
}

export interface MemberProfile {
  id: string;
  full_name: string;
}

export interface Song {
  author: string;
  tone: string;
  id: string;
  project_id: string;
  title: string;
  order_index: number;
}

export interface AttendanceStats {
  percentage: number;
  trend: number;
  totalSongs: number;
}

export interface ActiveTrack {
  id: string;
  title: string;
  author: string;
  url: string;
}

// Slices Interfaces

export interface PlayerSlice {
  activeTrack: ActiveTrack | null;
  isPlaying: boolean;
  queue: ActiveTrack[];
  currentIndex: number;
  playTrack: (track: ActiveTrack) => void;
  playQueue: (tracks: ActiveTrack[], startIndex?: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlay: () => void;
  closePlayer: () => void;
}

export interface UserSlice {
  userInfo: UserInfo | null;
  attendanceStats: AttendanceStats;
  fetchUserInfo: () => Promise<void>;
  setUserInfo: (info: UserInfo) => void;
  fetchAttendanceStats: () => Promise<void>;
}

export interface DataSlice {
  loading: boolean;
  groupInfo: GroupInfo | null;
  members: MemberProfile[];
  songs: Song[];
  fetchGroupInfo: () => Promise<void>;
  setGroupInfo: (info: GroupInfo) => void;
  fetchMembers: () => Promise<void>;
  fetchSongs: () => Promise<void>;
}

// Global App State Type
export type AppState = PlayerSlice & UserSlice & DataSlice;