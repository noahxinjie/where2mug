// Types for the Where2Mug application
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'business';
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'business';
}

export interface StudySpot {
  id: number;
  name: string;
  place_id: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'active' | 'closed';
  description?: string;
}

export interface StudySpotCreate {
  name: string;
  place_id: string;
  latitude: number;
  longitude: number;
  status?: 'pending' | 'active' | 'closed';
  description?: string;
}

export interface Review {
  id: number;
  studyspot_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface ReviewCreate {
  studyspot_id: number;
  user_id: number;
  rating: number;
  comment?: string;
}
