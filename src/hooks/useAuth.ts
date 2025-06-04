import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Admin {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  name: string;
}

interface AuthState {
  admin: Admin | null;
  token: string | null;
  setAdmin: (admin: Admin | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      setAdmin: (admin) => set({ admin }),
      setToken: (token) => set({ token }),
      logout: () => set({ admin: null, token: null }),
    }),
    {
      name: 'admin-auth',
    }
  )
);