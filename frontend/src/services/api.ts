import axios from 'axios';
import { User, UserCreate, StudySpot, StudySpotCreate, Review, ReviewCreate } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API
export const userApi = {
  create: (user: UserCreate) => api.post<User>('/users/', user),
  list: () => api.get<User[]>('/users/'),
};

// Study Spot API
export const studySpotApi = {
  create: (spot: StudySpotCreate) => api.post<StudySpot>('/studyspots/', spot),
  list: () => api.get<StudySpot[]>('/studyspots/'),
};

// Review API
export const reviewApi = {
  create: (review: ReviewCreate) => api.post<Review>('/reviews/', review),
  list: () => api.get<Review[]>('/reviews/'),
  listBySpot: (spotId: number) => api.get<Review[]>(`/reviews/by-spot/${spotId}`),
  listByUser: (userId: number) => api.get<Review[]>(`/reviews/by-user/${userId}`),
  update: (reviewId: number, review: ReviewCreate) => api.put<Review>(`/reviews/${reviewId}`, review),
  delete: (reviewId: number) => api.delete(`/reviews/${reviewId}`),
};

export default api;
