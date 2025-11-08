import axios from 'axios';
import { User, UserCreate, StudySpot, StudySpotCreate, Review, ReviewCreate, CheckinCreate, StudySpotCheckinResponse, UserCheckinStatusResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
  login: (credentials: { email: string; password: string }) =>
    api.post<User>('/users/login', credentials), // JSON payload
};

// Study Spot API
export const studySpotApi = {
  create: (spot: StudySpotCreate) => api.post<StudySpot>('/studyspots/', spot),
  list: () => api.get<StudySpot[]>('/studyspots/'),
  get: (id: string | number) => api.get<StudySpot>(`/studyspots/${id}`),
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

export const checkinApi = {
  getUserCheckinStatus: async (studyspot_id: number, user_id: number) => {
    const response = await api.post<UserCheckinStatusResponse>(
      `/checkin/userCheckinStatus`,
      { studyspot_id, user_id }
    );
    return response.data;
  },

  checkIn: async (payload: CheckinCreate) => {
    const response = await api.post(`/checkin/signIn`, payload);
    return response;
  },

  checkOut: async (payload: CheckinCreate) => {
    const response = await api.post(`/checkin/signOut`, payload);
    return response;
  },

  getStudySpotCheckinStatus: async (studyspot_id: number) => {
    const response = await api.post<StudySpotCheckinResponse>(`/checkin/studyspotCheckinStatus/${studyspot_id}`);
    return response.data;
  }
};

export default api;
