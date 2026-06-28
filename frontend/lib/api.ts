/**
 * Lansy.ai — API Client
 * Axios instance with auth interceptor and error handling.
 */

import axios from 'axios';
import toast from 'react-hot-toast';
import { getAccessToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30s for AI generation
});

// Request interceptor — attach Supabase JWT
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Silently fail — user may not be authenticated
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
      // All other errors (402, 422, 429, 500…) are handled by the modal in each page
    } else if (error.request) {
      toast.error('Impossible de contacter le serveur. Vérifiez votre connexion.');
    }

    return Promise.reject(error);
  }
);

export default api;

// --- API Functions ---

import type {
  OfferAnalysis,
  CVGenerateRequest,
  CVGenerateResponse,
  CVSession,
  CVHistoryResponse,
  TokenBalance,
  TokenPurchaseResponse,
  TokenHistoryResponse,
  UserProfile,
  UserSync,
  User,
} from '@/types';

// Auth
export const syncUser = (data: UserSync) =>
  api.post<User>('/auth/sync-user', data).then((r) => r.data);

// Profile
export const getProfile = () =>
  api.get<UserProfile | null>('/profile').then((r) => r.data);

export const updateProfile = (data: Partial<UserProfile>) =>
  api.put<UserProfile>('/profile', data).then((r) => r.data);

// CV
export const analyzeOffer = (offer_text: string) =>
  api.post<OfferAnalysis>('/cv/analyze-offer', { offer_text }).then((r) => r.data);

export const generateCV = (data: CVGenerateRequest) =>
  api.post<CVGenerateResponse>('/cv/generate', data).then((r) => r.data);

export const getCVHistory = (page: number = 1, per_page: number = 10) =>
  api.get<CVHistoryResponse>('/cv/history', { params: { page, per_page } }).then((r) => r.data);

export const getCVSession = (sessionId: string) =>
  api.get<CVSession>(`/cv/${sessionId}`).then((r) => r.data);

export const downloadCVPdf = async (sessionId: string, filename: string = 'lansy_cv.pdf') => {
  const token = await getAccessToken();
  const res = await fetch(`/api/download-cv/${sessionId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('PDF download failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// Tokens
export const getTokenBalance = () =>
  api.get<TokenBalance>('/tokens/balance').then((r) => r.data);

export const purchaseTokens = (package_id: string) =>
  api.post<TokenPurchaseResponse>('/tokens/purchase', { package_id }).then((r) => r.data);

export const getTokenHistory = (page: number = 1, per_page: number = 20) =>
  api.get<TokenHistoryResponse>('/tokens/history', { params: { page, per_page } }).then((r) => r.data);
