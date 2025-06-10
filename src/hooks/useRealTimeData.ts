import { useState, useEffect } from 'react';

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
    todayOrders: 156,
    todayUsers: 89,
    todayRevenue: 247500,
    recentActivity: [
      { id: '1', action: 'New order placed', user: 'John Doe', time: '2 min ago' },
      { id: '2', action: 'User registered', user: 'Sarah Johnson', time: '5 min ago' },
      { id: '3', action: 'Product updated', user: 'Admin', time: '12 min ago' },
      { id: '4', action: 'Order shipped', user: 'System', time: '18 min ago' },
      { id: '5', action: 'Payment received', user: 'Mike Wilson', time: '25 min ago' }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        todayOrders: prev.todayOrders + Math.floor(Math.random() * 3),
        todayUsers: prev.todayUsers + Math.floor(Math.random() * 2),
        todayRevenue: prev.todayRevenue + Math.floor(Math.random() * 5000)
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

const refetch = () => {
  setLoading(true);
  // Simulate API call
  setTimeout(() => {
    // Simulate an error
    const hasError = Math.random() < 0.1; // 10% chance

    if (hasError) {
      setError("Failed to fetch data");
    } else {
      setStats(prev => ({
        ...prev,
        todayOrders: prev.todayOrders + 1,
        todayUsers: prev.todayUsers + 1
      }));
      setError(null);
    }

    setLoading(false);
  }, 1000);
};

  return { stats, loading, error, refetch };
};