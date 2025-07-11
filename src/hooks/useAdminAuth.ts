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
          // Check current session immediately without timeout
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.warn('⚠️ AdminAuth: Session check error during init:', sessionError);
            set({ admin: null, loading: false, error: null, initialized: true });
            return;
          }

          if (!session?.user) {
            console.log('ℹ️ AdminAuth: No active session during init');
            set({ admin: null, loading: false, error: null, initialized: true });
            return;
          }

          // Check if user is admin
          const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (adminError && adminError.code !== 'PGRST116') {
            console.warn('⚠️ AdminAuth: Admin lookup error during init:', adminError);
            set({ admin: null, loading: false, error: null, initialized: true });
            return;
          }

          if (adminData) {
            console.log('✅ AdminAuth: Admin found during initialization');
            set({ admin: adminData, loading: false, error: null, initialized: true });
          } else {
            console.log('ℹ️ AdminAuth: No admin record found during init');
            set({ admin: null, loading: false, error: null, initialized: true });
          }

        } catch (error) {
          console.error('❌ AdminAuth: Initialization error:', error);
          set({ 
            admin: null, 
            loading: false, 
            error: null, // Don't show initialization errors to user
            initialized: true 
          });
        }
      },

      refreshAdminSession: async () => {
        try {
          console.log('🔄 AdminAuth: Refreshing admin session...');
          
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('❌ AdminAuth: Session error:', sessionError);
            // Don't throw, just clear state
            set({ admin: null, loading: false, error: null });
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

          if (adminError && adminError.code !== 'PGRST116') {
            console.warn('⚠️ AdminAuth: Admin lookup error:', adminError);
            // Don't clear admin state for temporary errors
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
          // Don't clear admin state for network/temporary errors
          set({ loading: false });
        }
      },

      checkAdminStatus: async () => {
        try {
          console.log('🔍 AdminAuth: Checking admin status...');
          
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('❌ AdminAuth: Session error:', sessionError);
            set({ admin: null, loading: false, error: null });
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

          if (adminError && adminError.code !== 'PGRST116') {
            console.warn('⚠️ AdminAuth: Admin lookup error:', adminError);
            // Don't clear state for temporary errors
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
          // Don't clear admin state for network/temporary errors
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          console.log('🚪 AdminAuth: Logging out');
          const currentAdmin = get().admin;
          
          // Clear state immediately
          set({ admin: null, loading: false, error: null });
          
          // Check if there's an active session before attempting to sign out
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.warn('⚠️ AdminAuth: Session check error during logout:', sessionError);
            // State is already cleared, so we're done
            return;
          }
          
          // Only sign out from Supabase if not using default credentials
          if (currentAdmin && currentAdmin.id !== 'default-super-admin' && session) {
            const { error } = await supabase.auth.signOut();
            if (error) {
              console.warn('⚠️ AdminAuth: Supabase logout warning:', error);
              // Don't throw, local state is already cleared
            }
          } else if (!session) {
            console.log('ℹ️ AdminAuth: No active session to sign out from');
          }
          
          console.log('✅ AdminAuth: Logout successful');
        } catch (error) {
          console.error('❌ AdminAuth: Logout error:', error);
          // Even if logout fails, ensure local state is cleared
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
          const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
          
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
      version: 8, // Incremented version to clear old problematic state
      migrate: (persistedState: any, version: number) => {
        // Clear old state on version mismatch to prevent issues
        if (version < 8) {
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
      },
      // Add storage event handling to sync across tabs
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);

// Improved admin auth listener setup
let adminAuthListenerInitialized = false;
let adminAuthStateChangeSubscription: any = null;
let adminSessionCheckInterval: NodeJS.Timeout | null = null;

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
  
  // Clean up any existing interval
  if (adminSessionCheckInterval) {
    clearInterval(adminSessionCheckInterval);
  }
  
  // Listen for auth state changes with debouncing
  let authChangeTimeout: NodeJS.Timeout | null = null;
  
  adminAuthStateChangeSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 AdminAuth: Auth state change:', event, session?.user?.id);
    
    // Clear any pending auth change
    if (authChangeTimeout) {
      clearTimeout(authChangeTimeout);
    }
    
    // Debounce auth state changes to prevent rapid-fire updates
    authChangeTimeout = setTimeout(async () => {
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
        // Don't set error state for auth listener errors
      }
      
      state.setLoading(false);
    }, 500); // 500ms debounce
  });
  
  // Set up periodic session check for better reliability
  adminSessionCheckInterval = setInterval(async () => {
    const state = useAdminAuth.getState();
    
    // Only check if we have an admin and it's not the default one
    if (state.admin && state.admin.id !== 'default-super-admin' && !state.loading) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          console.log('🔍 AdminAuth: Periodic check - no valid session, clearing admin');
          state.clearAdminAuth();
        }
      } catch (error) {
        console.warn('⚠️ AdminAuth: Periodic session check error:', error);
        // Don't clear admin state for network errors
      }
    }
  }, 60000); // Check every minute
  
  // Listen for storage events to sync across tabs
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'admin-auth-storage' && e.newValue !== e.oldValue) {
      console.log('🔄 AdminAuth: Storage changed in another tab, syncing...');
      
      try {
        const newState = e.newValue ? JSON.parse(e.newValue) : null;
        const currentState = useAdminAuth.getState();
        
        // Only update if the admin actually changed
        if (newState?.state?.admin?.id !== currentState.admin?.id) {
          useAdminAuth.getState().setAdmin(newState?.state?.admin || null);
        }
      } catch (error) {
        console.warn('⚠️ AdminAuth: Error syncing storage change:', error);
      }
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
};

// Cleanup function
export const cleanupAdminAuth = () => {
  if (adminAuthStateChangeSubscription) {
    adminAuthStateChangeSubscription.subscription?.unsubscribe();
    adminAuthStateChangeSubscription = null;
  }
  
  if (adminSessionCheckInterval) {
    clearInterval(adminSessionCheckInterval);
    adminSessionCheckInterval = null;
  }
  
  window.removeEventListener('storage', () => {});
  adminAuthListenerInitialized = false;
};