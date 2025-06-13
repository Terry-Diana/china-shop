import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

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
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current date
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      // Fetch all required data
      const [
        { data: todayOrders, error: ordersError },
        { data: todayUsers, error: usersError },
        { data: recentOrders, error: recentOrdersError },
        { data: recentUsers, error: recentUsersError }
      ] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .gte('created_at', todayStart.toISOString()),
        supabase
          .from('users')
          .select('*')
          .gte('created_at', todayStart.toISOString()),
        supabase
          .from('orders')
          .select('*, users(first_name, last_name, email)')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3)
      ]);

      // Handle errors
      if (ordersError) throw ordersError;
      if (usersError) throw usersError;
      if (recentOrdersError) throw recentOrdersError;
      if (recentUsersError) throw recentUsersError;

      // Calculate today's revenue
      const todayRevenue = todayOrders?.reduce((sum, order) => sum + order.total, 0) || 0;

      // Format recent activity
      const activity = [];
      
      // Add recent orders to activity
      for (const order of (recentOrders || [])) {
        const user = order.users;
        const userName = user ? 
          `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 
          'Customer';
          
        activity.push({
          id: `order-${order.id}`,
          action: `New order #${order.tracking_number || order.id}`,
          user: userName,
          time: formatTimeAgo(order.created_at)
        });
      }
      
      // Add recent users to activity
      for (const user of (recentUsers || [])) {
        const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
        
        activity.push({
          id: `user-${user.id}`,
          action: 'New user registered',
          user: userName,
          time: formatTimeAgo(user.created_at)
        });
      }
      
      // Sort by time (most recent first)
      activity.sort((a, b) => {
        const timeA = a.time;
        const timeB = b.time;
        
        if (timeA === 'Just now') return -1;
        if (timeB === 'Just now') return 1;
        
        const getMinutes = (time: string) => {
          if (time.includes('minutes')) return parseInt(time);
          if (time.includes('hours')) return parseInt(time) * 60;
          if (time.includes('days')) return parseInt(time) * 60 * 24;
          return 0;
        };
        
        return getMinutes(timeA) - getMinutes(timeB);
      });

      setStats({
        todayOrders: todayOrders?.length || 0,
        todayUsers: todayUsers?.length || 0,
        todayRevenue,
        recentActivity: activity.slice(0, 5)
      });

    } catch (err) {
      console.error('Error fetching real-time data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load real-time data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up real-time subscriptions for ALL operations
    const ordersSubscription = supabase
      .channel('realtime-orders')
      .on('postgres_changes', { 
        event: '*',  // Listen to INSERT, UPDATE, DELETE
        schema: 'public', 
        table: 'orders' 
      }, fetchData)
      .subscribe();

    const usersSubscription = supabase
      .channel('realtime-users')
      .on('postgres_changes', { 
        event: '*',  // Listen to INSERT, UPDATE, DELETE
        schema: 'public', 
        table: 'users' 
      }, fetchData)
      .subscribe();

    const orderItemsSubscription = supabase
      .channel('realtime-order-items')
      .on('postgres_changes', { 
        event: '*',
        schema: 'public', 
        table: 'order_items' 
      }, fetchData)
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
      usersSubscription.unsubscribe();
      orderItemsSubscription.unsubscribe();
    };
  }, []);

  return { stats, loading, error, refetch: fetchData };
};