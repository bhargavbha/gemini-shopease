import { create } from 'zustand';
import { authApi } from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  [key: string]: unknown;
}

interface AuthState {
  user: User | null;
  token: string | null;
  guestId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  initialize: () => void;
}

const getOrCreateGuestId = () => {
  let id = localStorage.getItem('guest_id');
  if (!id) {
    id = 'guest_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('guest_id', id);
  }
  return id;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('jwt_token'),
  guestId: getOrCreateGuestId(),
  isAuthenticated: !!localStorage.getItem('jwt_token'),
  isLoading: false,

  initialize: () => {
    const token = localStorage.getItem('jwt_token');
    const guestId = getOrCreateGuestId();
    set({ guestId });
    if (token) {
      set({ token, isAuthenticated: true });
      get().fetchProfile();
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await authApi.login(email, password);
      const { token, user } = res.data;
      localStorage.setItem('jwt_token', token);
      if (user?.id) localStorage.setItem('user_id', user.id);
      set({ token, user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      await authApi.register(data);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_id');
    const guestId = getOrCreateGuestId();
    set({ user: null, token: null, isAuthenticated: false, guestId });
  },

  fetchProfile: async () => {
    try {
      const res = await authApi.getProfile();
      const user = res.data;
      if (user?.id) localStorage.setItem('user_id', user.id);
      set({ user });
    } catch {
      // silent fail
    }
  },
}));
