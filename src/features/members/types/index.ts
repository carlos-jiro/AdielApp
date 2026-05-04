export interface Profile {
  id: string;
  email: string;
  role: string;
  group_role: string;
  full_name: string;
  voice_part: string;
  avatar_url: string | null;
  created_at: string;
}

export type LeftViewType = 'EMPTY' | 'PROFILE' | 'ATTENDANCE_ADMIN' | 'ATTENDANCE_PERSONAL';
