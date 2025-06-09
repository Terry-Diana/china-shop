import { useEffect } from 'react';
import { useAuth } from './useAuth';

interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

class AnalyticsService {
  private sessionId: string;
  private events: AnalyticsEvent[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadStoredEvents();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadStoredEvents() {
    try {
      const stored = localStorage.getItem('analytics_events');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading stored analytics events:', error);
    }
  }

  private saveEvents() {
    try {
      // Keep only last 100 events to prevent storage bloat
      const eventsToStore = this.events.slice(-100);
      localStorage.setItem('analytics_events', JSON.stringify(eventsToStore));
    } catch (error) {
      console.error('Error saving analytics events:', error);
    }
  }

  track(event: string, properties: Record<string, any> = {}, userId?: string) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
      userId,
      sessionId: this.sessionId,
    };

    this.events.push(analyticsEvent);
    this.saveEvents();

    // In a real app, you would send this to your analytics service
    console.log('Analytics Event:', analyticsEvent);
  }

  getEvents(): AnalyticsEvent[] {
    return this.events;
  }

  getConversionFunnel() {
    const funnelSteps = [
      'page_view',
      'product_view',
      'add_to_cart',
      'checkout_start',
      'purchase'
    ];

    const stepCounts = funnelSteps.reduce((acc, step) => {
      acc[step] = this.events.filter(e => e.event === step).length;
      return acc;
    }, {} as Record<string, number>);

    return funnelSteps.map((step, index) => ({
      step,
      count: stepCounts[step] || 0,
      conversionRate: index === 0 ? 100 : 
        stepCounts[funnelSteps[0]] > 0 ? 
        ((stepCounts[step] || 0) / stepCounts[funnelSteps[0]]) * 100 : 0
    }));
  }

  getUserBehaviorInsights() {
    const totalEvents = this.events.length;
    const uniqueSessions = new Set(this.events.map(e => e.sessionId)).size;
    const avgEventsPerSession = totalEvents / uniqueSessions;

    const eventTypes = this.events.reduce((acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostPopularEvents = Object.entries(eventTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      totalEvents,
      uniqueSessions,
      avgEventsPerSession: Math.round(avgEventsPerSession * 100) / 100,
      mostPopularEvents,
    };
  }
}

const analyticsService = new AnalyticsService();

export const useAnalytics = () => {
  const { user } = useAuth();

  const track = (event: string, properties: Record<string, any> = {}) => {
    analyticsService.track(event, properties, user?.id);
  };

  // Track page views
  useEffect(() => {
    track('page_view', {
      path: window.location.pathname,
      search: window.location.search,
    });
  }, []);

  const trackProductView = (productId: number, productName: string) => {
    track('product_view', { productId, productName });
  };

  const trackAddToCart = (productId: number, productName: string, quantity: number, price: number) => {
    track('add_to_cart', { productId, productName, quantity, price, value: price * quantity });
  };

  const trackRemoveFromCart = (productId: number, productName: string) => {
    track('remove_from_cart', { productId, productName });
  };

  const trackAddToWishlist = (productId: number, productName: string) => {
    track('add_to_wishlist', { productId, productName });
  };

  const trackSearch = (query: string, resultsCount: number) => {
    track('search', { query, resultsCount });
  };

  const trackCheckoutStart = (cartValue: number, itemCount: number) => {
    track('checkout_start', { cartValue, itemCount });
  };

  const trackPurchase = (orderId: string, value: number, items: any[]) => {
    track('purchase', { orderId, value, items, itemCount: items.length });
  };

  const getAnalyticsData = () => ({
    events: analyticsService.getEvents(),
    conversionFunnel: analyticsService.getConversionFunnel(),
    userBehaviorInsights: analyticsService.getUserBehaviorInsights(),
  });

  return {
    track,
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackAddToWishlist,
    trackSearch,
    trackCheckoutStart,
    trackPurchase,
    getAnalyticsData,
  };
};