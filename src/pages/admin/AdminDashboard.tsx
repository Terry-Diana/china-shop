import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Users, Package,
  ArrowUp, ArrowDown, DollarSign, Clock,
} from 'lucide-react';
import {
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer
} from 'recharts';
import { useRealTimeData } from '../../hooks/useRealTimeData';
import { supabase } from '../../lib/supabase';

const COLORS = ['#013352', '#024d79', '#0072b1', '#00a3ff'];

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
}

interface SalesDataPoint {
  name: string;
  sales: number;
  orders: number;
}

interface CategoryDataPoint {
  name: string;
  value: number;
  color: string;
}

// Define types for our database responses
interface Order {
  id: number;
  total: number;
  created_at: string;
}

interface User {
  id: string;
  created_at: string;
}

interface Product {
  id: number;
  categories?: { name: string }[];
}

interface OrderItem {
  quantity: number;
  price: number;
  products: {
    categories: { name: string }[];
  } | null;
}

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [staticStats, setStaticStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryDataPoint[]>([]);
  const { stats: realTimeStats, loading: realTimeLoading, error: realTimeError } = useRealTimeData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized data fetchers
  const fetchStaticData = useCallback(async () => {
    try {
      setError(null);

      const [
        { data: ordersData, error: ordersError },
        { data: usersData, error: usersError },
        { data: productsData, error: productsError }
      ] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('users').select('*'),
        supabase.from('products').select('*')
      ]);

      if (ordersError) throw ordersError;
      if (usersError) throw usersError;
      if (productsError) throw productsError;

      const orders = ordersData as Order[] | null;
      const users = usersData as User[] | null;
      const products = productsData as Product[] | null;

      const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;

      setStaticStats({
        totalRevenue,
        totalOrders: orders?.length || 0,
        totalUsers: users?.length || 0,
        totalProducts: products?.length || 0
      });

    } catch (err) {
      console.error('Error fetching static data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    }
  }, []);

  const fetchSalesData = useCallback(async () => {
    try {
      const today = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d': startDate.setDate(today.getDate() - 7); break;
        case '30d': startDate.setDate(today.getDate() - 30); break;
        case '90d': startDate.setDate(today.getDate() - 90); break;
        default: startDate.setDate(today.getDate() - 7);
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', today.toISOString());

      if (error) throw error;
      const orders = data as Order[] | null;

      const groupedData: Record<string, { sales: number; orders: number }> = {};

      orders?.forEach(order => {
        const date = new Date(order.created_at);
        let key = '';
        
        switch (timeRange) {
          case '7d': 
            key = date.toLocaleDateString('en-US', { weekday: 'short' });
            break;
          case '30d': 
            key = `Week ${Math.floor((date.getDate() - 1) / 7) + 1}`;
            break;
          case '90d': 
            key = date.toLocaleDateString('en-US', { month: 'short' });
            break;
          default: 
            key = date.toLocaleDateString('en-US', { weekday: 'short' });
        }

        if (!groupedData[key]) {
          groupedData[key] = { sales: 0, orders: 0 };
        }

        groupedData[key].sales += order.total;
        groupedData[key].orders += 1;
      });

      setSalesData(Object.entries(groupedData).map(([name, values]) => ({
        name,
        sales: values.sales,
        orders: values.orders
      })));
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sales data');
    }
  }, [timeRange]);

  const fetchCategoryData = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('order_items')
        .select('quantity, price, products ( categories ( name ) )');

      if (error) throw error;

      const categorySales: Record<string, number> = {};
      // No need for type assertion here - let TypeScript infer the type
      const orderItems = data;

      orderItems?.forEach((item) => {
        // Safely access nested properties with optional chaining
        const categoryName = item.products?.categories?.[0]?.name || 'Uncategorized';
        const revenue = item.quantity * item.price;
        categorySales[categoryName] = (categorySales[categoryName] || 0) + revenue;
      });

      setCategoryData(Object.entries(categorySales).map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      })));
    } catch (err) {
      console.error('Error fetching category data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load category data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchStaticData();
    fetchSalesData();
    fetchCategoryData();
  }, [fetchStaticData, fetchSalesData, fetchCategoryData]);

  // Real-time subscriptions for all relevant tables
  useEffect(() => {
    const refetchAllData = () => {
      fetchStaticData();
      fetchSalesData();
      fetchCategoryData();
    };

    const ordersChannel = supabase
      .channel('dashboard-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, refetchAllData)
      .subscribe();

    const usersChannel = supabase
      .channel('dashboard-users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, refetchAllData)
      .subscribe();

    const productsChannel = supabase
      .channel('dashboard-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, refetchAllData)
      .subscribe();

    const orderItemsChannel = supabase
      .channel('dashboard-order-items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, refetchAllData)
      .subscribe();

    return () => {
      ordersChannel.unsubscribe();
      usersChannel.unsubscribe();
      productsChannel.unsubscribe();
      orderItemsChannel.unsubscribe();
    };
  }, [fetchStaticData, fetchSalesData, fetchCategoryData]);

  const isLoading = loading || realTimeLoading;
  const hasError = error || realTimeError;
  const hasStats = staticStats && realTimeStats;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center text-gray-600">
        <p className="text-lg font-semibold">Failed to load dashboard data.</p>
        <p className="text-sm mt-2">{hasError}</p>
        <button 
          onClick={() => {
            setError(null);
            fetchStaticData();
            fetchSalesData();
            fetchCategoryData();
          }}
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!hasStats || !staticStats || !realTimeStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, Admin!</h1>
        <p className="text-primary-100">Here's what's happening with your store today.</p>
        <div className="mt-4 flex items-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Real-time data active
          </div>
          <div>Last updated: {new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Revenue',
            value: `Ksh ${staticStats.totalRevenue.toLocaleString()}`,
            change: '+12.5%',
            icon: <DollarSign size={24} />,
            positive: true,
            realTime: false,
          },
          {
            title: 'Orders Today',
            value: realTimeStats.todayOrders.toString(),
            change: '+8.2%',
            icon: <ShoppingBag size={24} />,
            positive: true,
            realTime: true,
          },
          {
            title: 'New Users Today',
            value: realTimeStats.todayUsers.toString(),
            change: '+15.3%',
            icon: <Users size={24} />,
            positive: true,
            realTime: true,
          },
          {
            title: 'Total Products',
            value: staticStats.totalProducts.toString(),
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
              <div className={`flex items-center ${stat.positive ? 'text-success' : 'text-error'}`}>
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
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'sales') {
                        return [`Ksh ${Number(value).toLocaleString()}`, 'Sales'];
                      }
                      return [value, 'Orders'];
                    }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#013352" strokeWidth={2} name="Sales" />
                  <Line type="monotone" dataKey="orders" stroke="#bb313e" strokeWidth={2} name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No sales data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6">Sales by Category</h2>
          <div className="h-80">
            {categoryData.length > 0 ? (
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
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`Ksh ${Number(value).toLocaleString()}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No category data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-6">Recent Activity</h2>
        {realTimeStats.recentActivity.length > 0 ? (
          <ul className="space-y-3 max-h-64 overflow-y-auto">
            {realTimeStats.recentActivity.map((activity) => (
              <li
                key={activity.id}
                className="flex items-center justify-between p-3 bg-primary-50 rounded-md"
              >
                <div>
                  <p className="text-sm font-medium text-primary">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.user}</p>
                </div>
                <div className="flex items-center text-gray-400">
                  <Clock size={16} className="mr-1" />
                  <span className="text-xs">{activity.time}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No recent activity available.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;