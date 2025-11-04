export interface FamilyMember {
  uuid: string;
  id: number;
  user: number;
  username: string;
  family: number;
  family_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyListResponse {
  message?: string;
  payload?: FamilyMember[];
  status?: number;
}

