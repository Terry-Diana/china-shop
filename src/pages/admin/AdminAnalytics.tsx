import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart as BarChartIcon,
  TrendingUp,
  Users,
  ShoppingBag,
  Calendar,
  DollarSign,
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
import { supabase } from '../../lib/supabase';

const COLORS = ['#013352', '#024d79', '#0072b1', '#00a3ff'];

interface AnalyticsData {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  salesByMonth: Array<{ name: string; sales: number; orders: number }>;
  categoryData: Array<{ name: string; value: number }>;
  recentActivity: Array<{
    icon: React.ReactNode;
    title: string;
    time: string;
    description: string;
  }>;
}

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
    
    // Set up real-time subscriptions
    const ordersChannel = supabase
      .channel('analytics-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchAnalyticsData)
      .subscribe();

    const usersChannel = supabase
      .channel('analytics-users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchAnalyticsData)
      .subscribe();

    const productsChannel = supabase
      .channel('analytics-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchAnalyticsData)
      .subscribe();

    return () => {
      ordersChannel.unsubscribe();
      usersChannel.unsubscribe();
      productsChannel.unsubscribe();
    };
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all required data
      const [
        { data: orders, error: ordersError },
        { data: users, error: usersError },
        { data: categories, error: categoriesError },
        { data: orderItems, error: orderItemsError }
      ] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('users').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('order_items').select(`
          quantity,
          price,
          products!inner (
            category_id,
            categories!inner (
              name
            )
          )
        `)
      ]);

      if (ordersError) throw ordersError;
      if (usersError) throw usersError;
      if (categoriesError) throw categoriesError;
      if (orderItemsError) throw orderItemsError;

      // Calculate analytics
      const totalSales = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
      const totalOrders = orders?.length || 0;
      const totalCustomers = users?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      // Generate sales by month data (last 6 months)
      const salesByMonth = generateSalesByMonth(orders || []);

      // Generate category data
      const categoryData = generateCategoryData(orderItems || []);

      // Generate recent activity
      const recentActivity = generateRecentActivity(orders || [], users || []);

      setAnalyticsData({
        totalSales,
        totalOrders,
        totalCustomers,
        averageOrderValue,
        salesByMonth,
        categoryData,
        recentActivity
      });

    } catch (err: any) {
      console.error('Error fetching analytics data:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const generateSalesByMonth = (orders: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentDate = new Date();
    
    return months.map((month, index) => {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - index), 1);
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === monthDate.getMonth() && 
               orderDate.getFullYear() === monthDate.getFullYear();
      });
      
      return {
        name: month,
        sales: monthOrders.reduce((sum, order) => sum + order.total, 0),
        orders: monthOrders.length
      };
    });
  };

  const generateCategoryData = (orderItems: any[]) => {
    const categorySales: Record<string, number> = {};

    orderItems.forEach((item) => {
      const categoryName = item.products?.categories?.name || 'Uncategorized';
      const revenue = item.quantity * item.price;
      categorySales[categoryName] = (categorySales[categoryName] || 0) + revenue;
    });

    return Object.entries(categorySales)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  };

  const generateRecentActivity = (orders: any[], users: any[]) => {
    const activities = [];

    // Recent orders
    const recentOrders = orders.slice(-3);
    recentOrders.forEach(order => {
      activities.push({
        icon: <ShoppingBag size={16} />,
        title: `New Order #${order.tracking_number || order.id}`,
        time: formatTimeAgo(order.created_at),
        description: `Order total: Ksh ${order.total.toLocaleString()}`
      });
    });

    // Recent users
    const recentUsers = users.slice(-2);
    recentUsers.forEach(user => {
      activities.push({
        icon: <Users size={16} />,
        title: 'New Customer',
        time: formatTimeAgo(user.created_at),
        description: `${user.first_name || ''} ${user.last_name || ''} joined`.trim() || user.email
      });
    });

    return activities.slice(0, 5);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

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
        <p className="text-lg font-semibold text-gray-900 mb-2">Failed to load analytics data</p>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchAnalyticsData}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Monitor your business performance</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: 'Total Sales',
            value: `Ksh ${analyticsData.totalSales.toLocaleString()}`,
            change: '+12.5%',
            icon: <DollarSign size={24} />,
          },
          {
            title: 'Total Orders',
            value: analyticsData.totalOrders.toString(),
            change: '+8.2%',
            icon: <ShoppingBag size={24} />,
          },
          {
            title: 'Total Customers',
            value: analyticsData.totalCustomers.toString(),
            change: '+15.3%',
            icon: <Users size={24} />,
          },
          {
            title: 'Average Order Value',
            value: `Ksh ${analyticsData.averageOrderValue.toLocaleString()}`,
            change: '+5.7%',
            icon: <BarChartIcon size={24} />,
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary-50 rounded-lg">
                <div className="text-primary">{stat.icon}</div>
              </div>
              <span className="text-success text-sm font-medium">{stat.change}</span>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6">Sales Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.salesByMonth}>
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
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Traffic */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6">Orders by Month</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#013352" />
              </BarChart>
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
                  data={analyticsData.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analyticsData.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {analyticsData.categoryData.map((category, index) => (
                <div key={category.name} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {analyticsData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center text-primary">
                  {activity.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;