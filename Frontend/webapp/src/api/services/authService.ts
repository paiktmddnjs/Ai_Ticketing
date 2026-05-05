import { api } from '../client';
import { User } from '../types';
// import { delay } from './utils';

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface SignupRequest extends LoginRequest {
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

/*
const MOCK_USER: User = {
  id: 'user-123',
  email: 'test@example.com',
  name: '홍길동',
  created_at: new Date().toISOString(),
};
*/

export const GOOGLE_AUTH_URL = `${import.meta.env.VITE_API_URL || 'https://my-app-eta-sage-27.vercel.app'}/api/auth/google`;

export const authService = {
  /**
   * Login user
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/api/auth/login', data);
  },

  /**
   * Google Login (Redirect based)
   * This method helps in navigating the user to the backend's Google auth endpoint
   */
  initiateGoogleLogin: () => {
    window.location.href = GOOGLE_AUTH_URL;
  },

  /**
   * Google Login (Token based)
   * Use this if you receive a token or code from a frontend Google SDK
   */
  loginWithGoogle: async (token: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/api/auth/google/callback', { token });
  },

  /**
   * Signup user
   */
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/api/auth/signup', data);
    /*
    await delay(1500);
    return {
      user: {
        id: `user-${Math.random().toString(36).substr(2, 5)}`,
        email: data.email,
        name: data.name,
        created_at: new Date().toISOString(),
      },
      token: 'mock-jwt-token-new-user',
    };
    */
  },

  /**
   * Get current user
   */
  getCurrentUser: async (): Promise<User> => {
    return api.get<User>('/api/auth/me');
    /*
    await delay(500);
    return MOCK_USER;
    */
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    return api.post<void>('/api/auth/logout');
    /*
    await delay(300);
    */
  },
};
