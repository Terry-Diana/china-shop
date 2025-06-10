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

// Mock users data
const mockUsers = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+254 700 123 456',
    addressLine1: '123 Main Street',
    addressLine2: 'Apt 4B',
    city: 'Nairobi',
    state: 'Nairobi County',
    postalCode: '00100',
    country: 'Kenya',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastLogin: '2024-01-20T14:22:00Z',
    orderCount: 5,
    totalSpent: 45750.50
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+254 700 234 567',
    addressLine1: '456 Oak Avenue',
    city: 'Mombasa',
    state: 'Mombasa County',
    postalCode: '80100',
    country: 'Kenya',
    createdAt: '2024-01-10T15:45:00Z',
    updatedAt: '2024-01-18T09:20:00Z',
    lastLogin: '2024-01-19T11:15:00Z',
    orderCount: 3,
    totalSpent: 23400.75
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Wilson',
    email: 'mike.wilson@example.com',
    phone: '+254 700 345 678',
    addressLine1: '789 Pine Road',
    city: 'Kisumu',
    state: 'Kisumu County',
    postalCode: '40100',
    country: 'Kenya',
    createdAt: '2024-01-08T11:20:00Z',
    updatedAt: '2024-01-17T16:30:00Z',
    lastLogin: '2024-01-18T08:45:00Z',
    orderCount: 8,
    totalSpent: 67890.25
  },
  {
    id: '4',
    firstName: 'Emma',
    lastName: 'Davis',
    email: 'emma.davis@example.com',
    phone: '+254 700 456 789',
    addressLine1: '321 Cedar Lane',
    city: 'Eldoret',
    state: 'Uasin Gishu County',
    postalCode: '30100',
    country: 'Kenya',
    createdAt: '2024-01-05T14:15:00Z',
    updatedAt: '2024-01-16T08:45:00Z',
    lastLogin: '2024-01-17T19:30:00Z',
    orderCount: 12,
    totalSpent: 89450.00
  },
  {
    id: '5',
    firstName: 'Alex',
    lastName: 'Brown',
    email: 'alex.brown@example.com',
    phone: '+254 700 567 890',
    addressLine1: '654 Birch Street',
    city: 'Nakuru',
    state: 'Nakuru County',
    postalCode: '20100',
    country: 'Kenya',
    createdAt: '2024-01-03T09:30:00Z',
    updatedAt: '2024-01-15T10:15:00Z',
    lastLogin: '2024-01-16T13:20:00Z',
    orderCount: 2,
    totalSpent: 15600.50
  }
];

const AdminUsers = () => {
  const [users, setUsers] = useState(mockUsers);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower)
    );
  });

  const exportUsers = () => {
    const csvContent = [
      'Name,Email,Phone,City,Orders,Total Spent,Join Date',
      ...filteredUsers.map(user => 
        `"${user.firstName} ${user.lastName}",${user.email},${user.phone || 'N/A'},${user.city || 'N/A'},${user.orderCount},${user.totalSpent},${new Date(user.createdAt).toLocaleDateString()}`
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
            value: users.length,
            icon: <UsersIcon size={24} />,
            color: 'primary'
          },
          {
            title: 'New This Month',
            value: users.filter(user => {
              const userDate = new Date(user.createdAt);
              const now = new Date();
              return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
            }).length,
            icon: <Calendar size={24} />,
            color: 'success'
          },
          {
            title: 'Active Users',
            value: users.filter(user => {
              const lastLogin = new Date(user.lastLogin);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return lastLogin > weekAgo;
            }).length,
            icon: <Shield size={24} />,
            color: 'accent'
          },
          {
            title: 'Total Revenue',
            value: `Ksh ${users.reduce((sum, user) => sum + user.totalSpent, 0).toLocaleString()}`,
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
                const customerTier = getCustomerTier(user.totalSpent);
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
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
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
                      <div className="text-sm font-medium text-gray-900">{user.orderCount}</div>
                      <div className="text-sm text-gray-500">orders</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Ksh {user.totalSpent.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Avg: Ksh {(user.totalSpent / Math.max(user.orderCount, 1)).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Last: {new Date(user.lastLogin).toLocaleDateString()}
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
                    {selectedUser.firstName?.charAt(0)}{selectedUser.lastName?.charAt(0)}
                  </div>
                  <h4 className="text-xl font-medium text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h4>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="mt-2">
                    <span className={`px-3 py-1 text-sm rounded-full ${getCustomerTier(selectedUser.totalSpent).color}`}>
                      {getCustomerTier(selectedUser.totalSpent).tier} Customer
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{selectedUser.orderCount}</p>
                    <p className="text-sm text-gray-600">Total Orders</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">Ksh {selectedUser.totalSpent.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Spent</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      Ksh {(selectedUser.totalSpent / Math.max(selectedUser.orderCount, 1)).toLocaleString()}
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
                    {selectedUser.addressLine1 ? (
                      <div className="space-y-1">
                        <p>{selectedUser.addressLine1}</p>
                        {selectedUser.addressLine2 && <p>{selectedUser.addressLine2}</p>}
                        <p>{selectedUser.city}, {selectedUser.state} {selectedUser.postalCode}</p>
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
                    <p><strong>Member Since:</strong> {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                    <p><strong>Last Login:</strong> {new Date(selectedUser.lastLogin).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                    <p><strong>Last Updated:</strong> {new Date(selectedUser.updatedAt).toLocaleDateString('en-US', {
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