import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Shield, UserPlus, Info } from 'lucide-react';
import Logo from '../../components/ui/Logo';
import Button from '../../components/ui/Button';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { supabase } from '../../lib/supabase';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [hasAdmins, setHasAdmins] = useState(true);
  
  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAdminAuth();

  // Check if any admins exist
  useEffect(() => {
    const checkAdmins = async () => {
      try {
        const { data, error } = await supabase
          .from('admins')
          .select('id')
          .limit(1);
        
        if (error) {
          console.error('Error checking admins:', error);
          // If table doesn't exist or other error, assume no admins
          setHasAdmins(false);
          return;
        }
        
        setHasAdmins(data && data.length > 0);
      } catch (error) {
        console.error('Error checking admins:', error);
        setHasAdmins(false);
      }
    };
    
    checkAdmins();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (err.message?.includes('Admin privileges required')) {
        setError('Access denied. This account does not have admin privileges.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Create auth user with email confirmation disabled
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: { name: regName },
          emailRedirectTo: undefined, // Disable email confirmation
        },
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      // Create admin record
      if (authData.user) {
        const { error: adminError } = await supabase
          .from('admins')
          .insert({
            id: authData.user.id,
            email: regEmail,
            name: regName,
            role: 'super_admin', // First admin is super admin
          });

        if (adminError) {
          console.error('Admin creation error:', adminError);
          throw adminError;
        }
        
        // Update hasAdmins state
        setHasAdmins(true);
        
        // Now try to login with the new credentials
        try {
          await login(regEmail, regPassword);
          navigate('/admin');
        } catch (loginError) {
          console.error('Auto-login after registration failed:', loginError);
          // Registration succeeded but auto-login failed
          setError('Account created successfully! Please log in with your credentials.');
          setShowRegistration(false);
          setRegName('');
          setRegEmail('');
          setRegPassword('');
          setEmail(regEmail); // Pre-fill login email
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.message?.includes('User already registered')) {
        setError('An account with this email already exists. Please try logging in instead.');
      } else if (err.message?.includes('Password should be at least 6 characters')) {
        setError('Password must be at least 6 characters long.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
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
            {showRegistration ? 'Create your admin account' : 'Secure access for authorized personnel only'}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10"
        >
          {error && (
            <div className="mb-4 p-3 bg-error-50 text-error rounded-md text-sm border border-error-200">
              {error}
            </div>
          )}

          {/* Default Admin Credentials Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Default Super Admin Access</p>
                <p className="mb-2">Use these credentials to access the admin panel:</p>
                <div className="bg-blue-100 p-2 rounded text-xs font-mono">
                  <div>Email: superadmin@chinasquare.com</div>
                  <div>Password: adminsuper@123</div>
                </div>
                <p className="mt-2 text-xs">
                  You can change these credentials after logging in.
                </p>
              </div>
            </div>
          </div>

          {!hasAdmins && !showRegistration && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-center">
                <UserPlus className="h-5 w-5 text-amber-600 mr-2" />
                <p className="text-sm text-amber-800">
                  No admin accounts found. You can create additional admin accounts.
                </p>
              </div>
              <button
                onClick={() => setShowRegistration(true)}
                className="mt-2 text-sm text-amber-700 hover:text-amber-900 underline"
              >
                Create Additional Admin Account
              </button>
            </div>
          )}

          {showRegistration ? (
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
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isLoading}
                  icon={<UserPlus size={18} />}
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
                    setRegName('');
                    setRegEmail('');
                    setRegPassword('');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                  disabled={isLoading}
                >
                  Back to Login
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                  icon={<Shield size={18} />}
                >
                  {isLoading ? 'Signing in...' : 'Access Admin Portal'}
                </Button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowRegistration(true)}
                  className="text-sm text-primary hover:text-primary-dark underline"
                  disabled={isLoading}
                >
                  Create Additional Admin Account
                </button>
              </div>
            </form>
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