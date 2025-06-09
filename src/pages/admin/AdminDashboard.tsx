import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Users,
  TrendingUp,
  Package,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Eye,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useRealTimeData } from '../../hooks/useRealTimeData';
import { adminService } from '../../services/adminService';
import { AnalyticsData } from '../../types/admin';

const COLORS = ['#013352', '#024d79', '#0072b1', '#00a3ff'];

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { stats, loading: statsLoading } = useRealTimeData();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await adminService.getAnalytics();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const salesData = [
    { name: 'Jan', sales: 4000, orders: 24 },
    { name: 'Feb', sales: 3000, orders: 18 },
    { name: 'Mar', sales: 2000, orders: 12 },
    { name: 'Apr', sales: 2780, orders: 16 },
    { name: 'May', sales: 1890, orders: 11 },
    { name: 'Jun', sales: 2390, orders: 14 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 400, color: COLORS[0] },
    { name: 'Fashion', value: 300, color: COLORS[1] },
    { name: 'Home', value: 300, color: COLORS[2] },
    { name: 'Beauty', value: 200, color: COLORS[3] },
  ];

  if (loading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, Admin!</h1>
        <p className="text-primary-100">
          Here's what's happening with your store today.
        </p>
        {stats && (
          <div className="mt-4 flex items-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Real-time data active
            </div>
            <div>Last updated: {new Date().toLocaleTimeString()}</div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Revenue',
            value: `Ksh ${analyticsData?.overview.totalRevenue?.toLocaleString() || '0'}`,
            change: '+12.5%',
            icon: <DollarSign size={24} />,
            positive: true,
            realTime: false,
          },
          {
            title: 'Orders Today',
            value: stats?.todayOrders?.toString() || '0',
            change: '+8.2%',
            icon: <ShoppingBag size={24} />,
            positive: true,
            realTime: true,
          },
          {
            title: 'New Users Today',
            value: stats?.todayUsers?.toString() || '0',
            change: '+15.3%',
            icon: <Users size={24} />,
            positive: true,
            realTime: true,
          },
          {
            title: 'Total Products',
            value: analyticsData?.overview.totalProducts?.toString() || '0',
            change: '+2.1%',
            icon: <Package size={24} />,
            positive: true,
            realTime: false,
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6 relative"
          >
            {stat.realTime && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary-50 rounded-lg">
                <div className="text-primary">{stat.icon}</div>
              </div>
              <div className={`flex items-center ${
                stat.positive ? 'text-success' : 'text-error'
              }`}>
                {stat.positive ? (
                  <ArrowUp size={16} className="mr-1" />
                ) : (
                  <ArrowDown size={16} className="mr-1" />
                )}
                <span className="text-sm font-medium">{stat.change}</span>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Sales Overview</h2>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'sales' ? `Ksh ${value}` : value,
                    name === 'sales' ? 'Sales' : 'Orders'
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#013352"
                  strokeWidth={2}
                  name="sales"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#bb313e"
                  strokeWidth={2}
                  name="orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6">Sales by Category</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`Ksh ${value}`, 'Sales']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {categoryData.map((category, index) => (
                <div key={category.name} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-gray-600">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Orders</h2>
              <div className="flex items-center text-sm text-gray-500">
                <Clock size={16} className="mr-1" />
                Real-time
              </div>
            </div>
          </div>
          <div className="p-6">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        Order #{order.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.users?.first_name} {order.users?.last_name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        Ksh {order.total.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent orders
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Add Product', icon: <Package size={20} />, href: '/admin/products' },
                { label: 'View Orders', icon: <ShoppingBag size={20} />, href: '/admin/orders' },
                { label: 'Manage Users', icon: <Users size={20} />, href: '/admin/users' },
                { label: 'Analytics', icon: <BarChart3 size={20} />, href: '/admin/analytics' },
              ].map((action, index) => (
                <motion.a
                  key={index}
                  href={action.href}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary-50 transition-colors"
                >
                  <div className="text-primary mb-2">{action.icon}</div>
                  <span className="text-sm font-medium text-gray-700">{action.label}</span>
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;