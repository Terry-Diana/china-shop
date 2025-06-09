import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { adminService } from '../services/adminService';
import { RealTimeStats } from '../types/admin';

export const useRealTimeData = () => {
  const [stats, setStats] = useState<RealTimeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getRealTimeStats();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching real-time stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up real-time subscriptions
    const ordersSubscription = supabase
      .channel('admin_orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    const usersSubscription = supabase
      .channel('admin_users')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => {
      ordersSubscription.unsubscribe();
      usersSubscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};