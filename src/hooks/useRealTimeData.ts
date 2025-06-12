import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface RealTimeStats {
  todayOrders: number;
  todayUsers: number;
  todayRevenue: number;
  recentActivity: Array<{
    id: string;
    action: string;
    user: string;
    time: string;
  }>;
}

export const useRealTimeData = () => {
  const [stats, setStats] = useState<RealTimeStats>({
    todayOrders: 0,
    todayUsers: 0,
    todayRevenue: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRealTimeStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get today's date range
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      // Fetch today's orders
      const { data: todayOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', todayStart.toISOString())
        .lt('created_at', todayEnd.toISOString());

      if (ordersError) throw ordersError;

      // Fetch today's users
      const { data: todayUsers, error: usersError } = await supabase
        .from('users')
        .select('*')
        .gte('created_at', todayStart.toISOString())
        .lt('created_at', todayEnd.toISOString());

      if (usersError) throw usersError;

      // Calculate today's revenue
      const todayRevenue = todayOrders?.reduce((sum, order) => sum + order.total, 0) || 0;

      // Get recent activity from orders
      const { data: recentOrders, error: recentError } = await supabase
        .from('orders')
        .select('id, tracking_number, total, created_at, users(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      // Format recent activity
      const recentActivity = recentOrders?.map((order, index) => ({
        id: order.id.toString(),
        action: `New order ${order.tracking_number || `#${order.id}`}`,
        user: order.users?.first_name ? 
          `${order.users.first_name} ${order.users.last_name || ''}`.trim() : 
          'Customer',
        time: formatTimeAgo(order.created_at)
      })) || [];

      setStats({
        todayOrders: todayOrders?.length || 0,
        todayUsers: todayUsers?.length || 0,
        todayRevenue,
        recentActivity
      });

    } catch (err: any) {
      console.error('Error fetching real-time stats:', err);
      setError(err.message || 'Failed to fetch real-time data');
    } finally {
      setLoading(false);
    }
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

  const refetch = () => {
    fetchRealTimeStats();
  };

  // Initial fetch
  useEffect(() => {
    fetchRealTimeStats();
  }, []);

  // Set up real-time updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRealTimeStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error, refetch };
};