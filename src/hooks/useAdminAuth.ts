import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { Admin } from '../types/admin';

interface AdminAuthState {
  admin: Admin | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  setAdmin: (admin: Admin | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => Promise<void>;
  registerAdmin: (email: string, password: string, name: string, role: 'admin' | 'super_admin') => Promise<void>;
  checkAdminStatus: () => Promise<void>;
  refreshAdminSession: () => Promise<void>;
  initialize: () => Promise<void>;
  clearAdminAuth: () => void;
}

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      loading: false,
      initialized: false,
      error: null,

      setAdmin: (admin) => {
        console.log('🔧 AdminAuth: Setting admin:', admin?.email || 'null');
        set({ admin, loading: false, error: null });
      },

      setLoading: (loading) => set({ loading }),
      setInitialized: (initialized) => set({ initialized }),
      setError: (error) => set({ error }),

      clearAdminAuth: () => {
        console.log('🧹 AdminAuth: Clearing admin auth state');
        set({ admin: null, loading: false, error: null, initialized: true });
      },

      initialize: async () => {
        const state = get();
        if (state.initialized) {
          console.log('🔧 AdminAuth: Already initialized, skipping');
          return;
        }
        
        console.log('🔧 AdminAuth: Initializing...');
        set({ loading: true, error: null });
        
        try {
          // Add timeout to prevent infinite initialization
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Admin auth initialization timeout')), 10000)
          );
          
          await Promise.race([
            state.checkAdminStatus(),
            timeoutPromise
          ]);
        } catch (error) {
          console.error('❌ AdminAuth: Initialization error:', error);
          set({ 
            admin: null, 
            loading: false, 
            error: error instanceof Error ? error.message : 'Admin auth initialization failed' 
          });
        } finally {
          set({ initialized: true, loading: false });
        }
      },

      refreshAdminSession: async () => {
        try {
          console.log('🔄 AdminAuth: Refreshing admin session...');
          
          // Add timeout for session refresh
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Admin session refresh timeout')), 5000)
          );
          
          const { data: { session }, error: sessionError } = await Promise.race([
            sessionPromise,
            timeoutPromise
          ]) as any;
          
          if (sessionError) {
            console.error('❌ AdminAuth: Session error:', sessionError);
            set({ admin: null, loading: false, error: sessionError.message });
            return;
          }

          if (!session?.user) {
            console.log('ℹ️ AdminAuth: No active session');
            set({ admin: null, loading: false, error: null });
            return;
          }

          // Check if user is admin in the admins table
          const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (adminError) {
            console.error('❌ AdminAuth: Admin lookup error:', adminError);
            set({ admin: null, loading: false, error: adminError.message });
            return;
          }

          if (adminData) {
            console.log('✅ AdminAuth: Admin session refreshed');
            set({ admin: adminData, loading: false, error: null });
          } else {
            console.log('ℹ️ AdminAuth: No admin record found');
            set({ admin: null, loading: false, error: null });
          }

        } catch (error) {
          console.error('❌ AdminAuth: Error refreshing admin session:', error);
          set({ 
            admin: null, 
            loading: false, 
            error: error instanceof Error ? error.message : 'Admin session refresh failed' 
          });
        }
      },

      checkAdminStatus: async () => {
        try {
          console.log('🔍 AdminAuth: Checking admin status...');
          
          // Add timeout for session check
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Admin status check timeout')), 5000)
          );
          
          const { data: { session }, error: sessionError } = await Promise.race([
            sessionPromise,
            timeoutPromise
          ]) as any;
          
          if (sessionError) {
            console.error('❌ AdminAuth: Session error:', sessionError);
            set({ admin: null, loading: false, error: sessionError.message });
            return;
          }

          if (!session?.user) {
            console.log('ℹ️ AdminAuth: No active session');
            set({ admin: null, loading: false, error: null });
            return;
          }

          console.log('✅ AdminAuth: Active session found, checking admin status');

          // Check if user is admin in the admins table
          const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (adminError) {
            console.error('❌ AdminAuth: Admin lookup error:', adminError);
            set({ admin: null, loading: false, error: adminError.message });
            return;
          }

          if (adminData) {
            console.log('✅ AdminAuth: Admin status confirmed');
            set({ admin: adminData, loading: false, error: null });
          } else {
            console.log('ℹ️ AdminAuth: No admin record found');
            set({ admin: null, loading: false, error: null });
          }

        } catch (error) {
          console.error('❌ AdminAuth: Error checking admin status:', error);
          set({ 
            admin: null, 
            loading: false, 
            error: error instanceof Error ? error.message : 'Admin status check failed' 
          });
        }
      },

      logout: async () => {
        try {
          console.log('🚪 AdminAuth: Logging out');
          const currentAdmin = get().admin;
          
          // Clear state immediately
          set({ admin: null, loading: false, error: null });
          
          // Only sign out from Supabase if not using default credentials
          if (currentAdmin && currentAdmin.id !== 'default-super-admin') {
            const { error } = await supabase.auth.signOut();
            if (error) {
              console.warn('⚠️ AdminAuth: Supabase logout warning:', error);
              // Don't throw, local state is already cleared
            }
          }
          
          console.log('✅ AdminAuth: Logout successful');
        } catch (error) {
          console.error('❌ AdminAuth: Logout error:', error);
          // Even if logout fails, clear local state
          set({ admin: null, loading: false, error: null });
        }
      },

      registerAdmin: async (email: string, password: string, name: string, role: 'admin' | 'super_admin') => {
        try {
          const currentAdmin = get().admin;
          
          // Only allow registration if current user is super admin
          if (!currentAdmin || currentAdmin.role !== 'super_admin') {
            throw new Error('Only super admins can register new admins');
          }
          
          console.log('👤 AdminAuth: Registering new admin via server:', email);
          
          // Validate inputs
          if (!email.trim() || !password || !name.trim()) {
            throw new Error('All fields are required');
          }
          
          if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
          }
          
          // Make request to server-side endpoint using the configured API base URL
          const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
          
          // Add timeout for the registration request
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
          
          try {
            const response = await fetch(`${apiBaseUrl}/api/admin/register`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: email.trim(),
                password: password,
                name: name.trim(),
                role: role,
                currentAdminId: currentAdmin.id
              }),
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            let result;
            try {
              result = await response.json();
            } catch (jsonError) {
              console.error('❌ AdminAuth: Failed to parse JSON response:', jsonError);
              const responseText = await response.text();
              console.error('❌ AdminAuth: Response text:', responseText);
              throw new Error(`Server returned invalid response: ${response.status} ${response.statusText}`);
            }

            if (!response.ok) {
              console.error('❌ AdminAuth: Server registration error:', result);
              throw new Error(result.error || 'Failed to register admin');
            }

            console.log('✅ AdminAuth: Admin registration successful');
          } catch (fetchError) {
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
              throw new Error('Registration request timed out. Please try again.');
            }
            throw fetchError;
          }
          
        } catch (error) {
          console.error('❌ AdminAuth: Registration error:', error);
          throw error;
        }
      },
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({ 
        admin: state.admin,
        // Don't persist loading, initialized, or error states
      }),
      version: 6,
      migrate: (persistedState: any, version: number) => {
        // Clear old state on version mismatch to prevent issues
        if (version < 6) {
          console.log('🔄 AdminAuth: Migrating admin auth state, clearing old data');
          return { admin: null };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Reset runtime state after rehydration
          state.loading = false;
          state.initialized = false;
          state.error = null;
          console.log('🔄 AdminAuth: State rehydrated:', state.admin?.email || 'no admin');
        }
      }
    }
  )
);

// Single admin auth listener setup with better error handling
let adminAuthListenerInitialized = false;
let adminAuthStateChangeSubscription: any = null;

export const initializeAdminAuth = () => {
  if (adminAuthListenerInitialized) {
    console.log('🔧 AdminAuth: Listener already initialized');
    return;
  }
  
  adminAuthListenerInitialized = true;
  console.log('🔧 AdminAuth: Setting up admin auth listener');
  
  // Initialize admin auth state
  useAdminAuth.getState().initialize();
  
  // Clean up any existing subscription
  if (adminAuthStateChangeSubscription) {
    adminAuthStateChangeSubscription.subscription?.unsubscribe();
  }
  
  // Listen for auth state changes with debouncing
  let adminAuthChangeTimeout: NodeJS.Timeout;
  
  adminAuthStateChangeSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 AdminAuth: Auth state change:', event, session?.user?.id);
    
    // Clear any pending admin auth change handlers
    if (adminAuthChangeTimeout) {
      clearTimeout(adminAuthChangeTimeout);
    }
    
    // Debounce admin auth state changes
    adminAuthChangeTimeout = setTimeout(async () => {
      const state = useAdminAuth.getState();
      
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if the signed-in user is an admin
          await state.checkAdminStatus();
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 AdminAuth: User signed out, clearing admin state');
          state.clearAdminAuth();
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Only refresh if we don't already have admin data or if it's a different user
          if (!state.admin || state.admin.id !== session.user.id) {
            await state.refreshAdminSession();
          }
        }
      } catch (error) {
        console.error('❌ AdminAuth: Error in admin auth state change handler:', error);
        state.setError(error instanceof Error ? error.message : 'Admin auth state change error');
      }
      
      state.setLoading(false);
    }, 100); // 100ms debounce
  });
};

// Cleanup function
export const cleanupAdminAuth = () => {
  if (adminAuthStateChangeSubscription) {
    adminAuthStateChangeSubscription.subscription?.unsubscribe();
    adminAuthStateChangeSubscription = null;
  }
  adminAuthListenerInitialized = false;
};