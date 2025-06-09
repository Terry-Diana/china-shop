import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Shield, UserPlus, Info, AlertCircle, CheckCircle } from 'lucide-react';
import Logo from '../../components/ui/Logo';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

const AdminLogin = () => {
  const [email, setEmail] = useState('superadmin@chinasquare.com');
  const [password, setPassword] = useState('adminsuper@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  
  // Registration form state
  const [regName, setRegName] = useState('Super Admin');
  const [regEmail, setRegEmail] = useState('superadmin@chinasquare.com');
  const [regPassword, setRegPassword] = useState('adminsuper@123');
  const [regRole, setRegRole] = useState<'admin' | 'super_admin'>('super_admin');
  const [regShowPassword, setRegShowPassword] = useState(false);
  
  const navigate = useNavigate();

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('🔐 Attempting login with:', email);
      
      // Step 1: Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        console.error('❌ Auth error:', authError);
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Authentication failed - no user data returned');
      }

      console.log('✅ Auth successful, user ID:', authData.user.id);
      console.log('🔍 Checking admin status...');

      // Step 2: Check if user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      console.log('📊 Admin query result:', { adminData, adminError });

      if (adminError) {
        console.error('❌ Admin lookup error:', adminError);
        
        // Sign out the user since they're not an admin
        await supabase.auth.signOut();
        
        if (adminError.code === 'PGRST116') {
          throw new Error('Access denied. This account does not have admin privileges. Please create an admin account first.');
        } else {
          throw new Error(`Error verifying admin status: ${adminError.message}`);
        }
      }

      if (!adminData) {
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }

      console.log('🎉 Admin verification successful:', adminData);
      setSuccess('Login successful! Redirecting to admin dashboard...');
      
      // Store admin data in localStorage for the auth hook
      localStorage.setItem('admin-auth-storage', JSON.stringify({
        state: { admin: adminData, loading: false },
        version: 0
      }));
      
      // Small delay to show success message
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
      
    } catch (err: any) {
      console.error('💥 Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Validate inputs
      if (!regName.trim()) {
        throw new Error('Name is required');
      }
      if (!regEmail.trim()) {
        throw new Error('Email is required');
      }
      if (regPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      console.log('👤 Creating admin account for:', regEmail.trim());

      // Step 1: Create auth user with admin signup (bypassing email confirmation)
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: regEmail.trim(),
        password: regPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: { 
          name: regName.trim(),
          role: regRole
        }
      });

      if (authError) {
        console.error('❌ Auth signup error:', authError);
        
        if (authError.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please try logging in instead.');
        }
        
        throw new Error(`Failed to create user account: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Failed to create user account - no user data returned');
      }

      console.log('✅ Auth user created:', authData.user.id);
      console.log('📝 Creating admin record...');

      // Step 2: Create admin record
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .insert({
          id: authData.user.id,
          email: regEmail.trim(),
          name: regName.trim(),
          role: regRole,
        })
        .select()
        .single();

      if (adminError) {
        console.error('❌ Admin creation error:', adminError);
        
        // Try to clean up the auth user
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
          console.log('🧹 Cleaned up auth user after admin creation failure');
        } catch (cleanupError) {
          console.error('⚠️ Failed to cleanup auth user:', cleanupError);
        }
        
        throw new Error(`Failed to create admin record: ${adminError.message}`);
      }
      
      console.log('🎉 Admin account created successfully:', adminData);
      
      // Success - switch to login form
      setSuccess(`${regRole === 'super_admin' ? 'Super Admin' : 'Admin'} account created successfully! You can now log in.`);
      setShowRegistration(false);
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegRole('admin');
      setEmail(regEmail.trim()); // Pre-fill login email
      
    } catch (err: any) {
      console.error('💥 Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    setEmail('superadmin@chinasquare.com');
    setPassword('adminsuper@123');
    setError('');
    setSuccess('');
  };

  const fillRegistrationDefaults = () => {
    setRegName('Super Admin');
    setRegEmail('superadmin@chinasquare.com');
    setRegPassword('adminsuper@123');
    setRegRole('super_admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary to-primary-light flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-full shadow-lg">
            <Logo className="h-12 w-auto" />
          </div>
        </div>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Shield size={48} className="text-accent" />
          </div>
          <h2 className="text-3xl font-bold text-white">
            Admin Portal
          </h2>
          <p className="mt-2 text-primary-100">
            {showRegistration ? 'Create your admin account' : 'Secure access for authorized personnel'}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10"
        >
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-error-50 text-error rounded-md text-sm border border-error-200 flex items-start">
              <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-success-50 text-success-dark rounded-md text-sm border border-success-200 flex items-start">
              <CheckCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {showRegistration ? (
            /* Registration Form */
            <>
              {/* Registration Info */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Create Admin Account</p>
                    <p className="mb-2">Fill in the details below or use the default super admin credentials:</p>
                    <button
                      onClick={fillRegistrationDefaults}
                      className="text-xs text-blue-700 hover:text-blue-900 underline"
                      disabled={isLoading}
                    >
                      Use default super admin credentials
                    </button>
                  </div>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleRegistration}>
                <div>
                  <label htmlFor="regName" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="regName"
                      name="regName"
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="Enter your full name"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="regEmail" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="regEmail"
                      name="regEmail"
                      type="email"
                      autoComplete="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="admin@chinasquare.com"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="regPassword" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="regPassword"
                      name="regPassword"
                      type={regShowPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                      disabled={isLoading}
                      minLength={6}
                      placeholder="Minimum 6 characters"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setRegShowPassword(!regShowPassword)}
                      disabled={isLoading}
                    >
                      {regShowPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="regRole" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <div className="mt-1">
                    <select
                      id="regRole"
                      name="regRole"
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as 'admin' | 'super_admin')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                      disabled={isLoading}
                    >
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Super Admin can create other admin accounts
                  </p>
                </div>

                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={isLoading}
                    icon={isLoading ? undefined : <UserPlus size={18} />}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Admin Account'}
                  </Button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegistration(false);
                      setError('');
                      setSuccess('');
                      setRegName('');
                      setRegEmail('');
                      setRegPassword('');
                      setRegRole('admin');
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900"
                    disabled={isLoading}
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Login Form */
            <>
              {/* Default Credentials Info */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">First Time Setup</p>
                    <p className="mb-2">If this is your first time, create the super admin account first:</p>
                    <div className="bg-blue-100 p-2 rounded text-xs font-mono mb-2">
                      <div>Email: superadmin@chinasquare.com</div>
                      <div>Password: adminsuper@123</div>
                    </div>
                    <button
                      onClick={resetToDefaults}
                      className="text-xs text-blue-700 hover:text-blue-900 underline mr-4"
                      disabled={isLoading}
                    >
                      Use these credentials
                    </button>
                    <button
                      onClick={() => setShowRegistration(true)}
                      className="text-xs text-blue-700 hover:text-blue-900 underline"
                      disabled={isLoading}
                    >
                      Create account first
                    </button>
                  </div>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="superadmin@chinasquare.com"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                      disabled={isLoading}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={isLoading}
                    icon={isLoading ? undefined : <Shield size={18} />}
                  >
                    {isLoading ? 'Signing in...' : 'Access Admin Portal'}
                  </Button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegistration(true);
                      setError('');
                      setSuccess('');
                    }}
                    className="text-sm text-primary hover:text-primary-dark underline"
                    disabled={isLoading}
                  >
                    Create Admin Account
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Security Notice</span>
              </div>
            </div>
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                This is a secure area. All access attempts are logged and monitored.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;