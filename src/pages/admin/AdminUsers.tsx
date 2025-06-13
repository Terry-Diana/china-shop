import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Users as UsersIcon,
  Mail,
  Calendar,
  MapPin,
  Download,
  Eye,
  MoreHorizontal,
  Phone,
  User,
  Shield
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  created_at: string;
  updated_at: string;
  orderCount?: number;
  totalSpent?: number;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('users-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'users' 
      }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users with their order statistics
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // For each user, get their order count and total spent
      const usersWithStats = await Promise.all(
        (usersData || []).map(async (user) => {
          const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('total')
            .eq('user_id', user.id);

          if (ordersError) {
            console.error('Error fetching orders for user:', user.id, ordersError);
            return {
              ...user,
              orderCount: 0,
              totalSpent: 0
            };
          }

          const orderCount = orders?.length || 0;
          const totalSpent = orders?.reduce((sum, order) => sum + order.total, 0) || 0;

          return {
            ...user,
            orderCount,
            totalSpent
          };
        })
      );

      setUsers(usersWithStats);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchLower)
    );
  });

  const exportUsers = () => {
    if (filteredUsers.length === 0) {
      alert('No users to export');
      return;
    }

    const csvContent = [
      'Name,Email,Phone,City,Orders,Total Spent,Join Date',
      ...filteredUsers.map(user => 
        `"${user.first_name || ''} ${user.last_name || ''}",${user.email},${user.phone || 'N/A'},${user.city || 'N/A'},${user.orderCount || 0},${user.totalSpent || 0},${new Date(user.created_at).toLocaleDateString()}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getCustomerTier = (totalSpent: number) => {
    if (totalSpent >= 50000) return { tier: 'Gold', color: 'text-yellow-600 bg-yellow-50' };
    if (totalSpent >= 25000) return { tier: 'Silver', color: 'text-gray-600 bg-gray-50' };
    return { tier: 'Bronze', color: 'text-amber-600 bg-amber-50' };
  };

  const getStats = () => {
    const totalUsers = users.length;
    const newThisMonth = users.filter(user => {
      const userDate = new Date(user.created_at);
      const now = new Date();
      return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
    }).length;
    
    const activeUsers = users.filter(user => (user.orderCount || 0) > 0).length;
    const totalRevenue = users.reduce((sum, user) => sum + (user.totalSpent || 0), 0);

    return { totalUsers, newThisMonth, activeUsers, totalRevenue };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-lg font-semibold text-gray-900 mb-2">Failed to load users data</p>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchUsers} variant="primary">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600">Manage customer accounts and information</p>
        </div>
        <Button
          variant="outline"
          icon={<Download size={18} />}
          onClick={exportUsers}
        >
          Export Users
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: <UsersIcon size={24} />,
            color: 'primary'
          },
          {
            title: 'New This Month',
            value: stats.newThisMonth,
            icon: <Calendar size={24} />,
            color: 'success'
          },
          {
            title: 'Active Users',
            value: stats.activeUsers,
            icon: <Shield size={24} />,
            color: 'accent'
          },
          {
            title: 'Total Revenue',
            value: `Ksh ${stats.totalRevenue.toLocaleString()}`,
            icon: <Mail size={24} />,
            color: 'warning'
          }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 bg-${stat.color}-50 rounded-lg`}>
                <div className={`text-${stat.color}`}>{stat.icon}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const customerTier = getCustomerTier(user.totalSpent || 0);
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                          {user.first_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          {user.last_name?.charAt(0) || ''}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name || user.last_name ? 
                              `${user.first_name || ''} ${user.last_name || ''}`.trim() : 
                              'No name provided'
                            }
                          </div>
                          <div className="flex items-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${customerTier.color}`}>
                              {customerTier.tier}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      {user.phone && (
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.city && user.state ? `${user.city}, ${user.state}` : 'Not provided'}
                      </div>
                      {user.country && (
                        <div className="text-sm text-gray-500">{user.country}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.orderCount || 0}</div>
                      <div className="text-sm text-gray-500">orders</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Ksh {(user.totalSpent || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Avg: Ksh {((user.totalSpent || 0) / Math.max(user.orderCount || 1, 1)).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-primary hover:text-primary-dark transition-colors"
                        title="View User Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">No users match your search criteria.</p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* User Header */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {selectedUser.first_name?.charAt(0) || selectedUser.email.charAt(0).toUpperCase()}
                    {selectedUser.last_name?.charAt(0) || ''}
                  </div>
                  <h4 className="text-xl font-medium text-gray-900">
                    {selectedUser.first_name || selectedUser.last_name ? 
                      `${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() : 
                      'No name provided'
                    }
                  </h4>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="mt-2">
                    <span className={`px-3 py-1 text-sm rounded-full ${getCustomerTier(selectedUser.totalSpent || 0).color}`}>
                      {getCustomerTier(selectedUser.totalSpent || 0).tier} Customer
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{selectedUser.orderCount || 0}</p>
                    <p className="text-sm text-gray-600">Total Orders</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">Ksh {(selectedUser.totalSpent || 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Spent</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      Ksh {((selectedUser.totalSpent || 0) / Math.max(selectedUser.orderCount || 1, 1)).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Avg Order</p>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Phone size={18} className="mr-2" />
                    Contact Information
                  </h5>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>Phone:</strong> {selectedUser.phone || 'Not provided'}</p>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                    <MapPin size={18} className="mr-2" />
                    Address Information
                  </h5>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedUser.address_line1 ? (
                      <div className="space-y-1">
                        <p>{selectedUser.address_line1}</p>
                        {selectedUser.address_line2 && <p>{selectedUser.address_line2}</p>}
                        <p>{selectedUser.city}, {selectedUser.state} {selectedUser.postal_code}</p>
                        {selectedUser.country && <p>{selectedUser.country}</p>}
                      </div>
                    ) : (
                      <p className="text-gray-500">No address provided</p>
                    )}
                  </div>
                </div>

                {/* Account Information */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Calendar size={18} className="mr-2" />
                    Account Information
                  </h5>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Member Since:</strong> {new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                    <p><strong>Last Updated:</strong> {new Date(selectedUser.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;