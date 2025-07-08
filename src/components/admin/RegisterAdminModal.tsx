import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus, Shield, User } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import Button from '../ui/Button';

interface RegisterAdminModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const RegisterAdminModal = ({ onClose, onSuccess }: RegisterAdminModalProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'admin' as const,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { registerAdmin } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await registerAdmin(
        formData.email,
        formData.password,
        formData.name,
        formData.role
      );
      onSuccess();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to register admin. Please try again.';
      
      // Provide more helpful error messages for common issues
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch')) {
        setError('Unable to connect to the server. Please ensure the backend server is running and try again.');
      } else if (errorMessage.includes('timeout')) {
        setError('Request timed out. Please check your connection and try again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
      >
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center">
            <UserPlus size={24} className="text-primary mr-3" />
            <h2 className="text-xl font-semibold">Register New Admin</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-error-50 text-error rounded-md text-sm border border-error-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User size={16} className="inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={isLoading}
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={isLoading}
                placeholder="admin@chinasquare.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={isLoading}
                minLength={6}
                placeholder="Minimum 6 characters"
              />
              <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Shield size={16} className="inline mr-2" />
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <div className="mt-2 text-xs text-gray-600">
                <div className="mb-1"><strong>Admin:</strong> Can manage products, orders, and content</div>
                <div><strong>Super Admin:</strong> Full access including user management and admin registration</div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading}
              icon={<UserPlus size={18} />}
            >
              {isLoading ? 'Creating Admin...' : 'Create Admin'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterAdminModal;