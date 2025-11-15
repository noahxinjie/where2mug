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
  avg_rating?: number;
  distance_km?: number;
  active_checkins?: number;
  photos?: Photo[];
}

export interface Photo {
  id: number;
  url: string;
  key: string;
  is_primary: boolean;
  created_at: string;
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
  user_name?: string;
  created_at: string;
}

export interface ReviewCreate {
  studyspot_id: number;
  user_id: number;
  rating: number;
  comment?: string;
}

export interface CheckinCreate {
  studyspot_id: number;
  user_id: number;
}

export interface UserCheckinStatusResponse {
  studyspot_id: number;
  user_id: number;
  is_user_checkin: boolean;
}

export interface StudySpotCheckinResponse {
  studyspot_id: number;
  active_checkins: number;
}
