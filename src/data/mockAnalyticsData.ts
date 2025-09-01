import { DashboardAnalytics, ProductAnalytics, CustomerSegment, TrafficAnalytics } from '@/hooks/useAnalyticsData';

// Dados mock para o dashboard de analytics
export const getMockDashboardData = (): DashboardAnalytics => {
  const today = new Date();
  const periodData = [];

  // Gerar dados dos últimos 30 dias
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Simular variação nos dados
    const baseRevenue = 5000 + Math.random() * 3000;
    const baseSessions = 150 + Math.random() * 100;
    const basePurchases = 8 + Math.random() * 12;
    
    periodData.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.round(baseRevenue),
      sessions: Math.round(baseSessions),
      purchases: Math.round(basePurchases),
      conversion_rate: Number(((basePurchases / baseSessions) * 100).toFixed(2))
    });
  }

  const totalRevenue = periodData.reduce((sum, day) => sum + day.revenue, 0);
  const totalSessions = periodData.reduce((sum, day) => sum + day.sessions, 0);
  const totalPurchases = periodData.reduce((sum, day) => sum + day.purchases, 0);

  return {
    total_revenue: totalRevenue,
    total_sessions: totalSessions,
    total_purchases: totalPurchases,
    avg_conversion_rate: Number(((totalPurchases / totalSessions) * 100).toFixed(2)),
    avg_order_value: Number((totalRevenue / totalPurchases).toFixed(2)),
    cart_abandonment_rate: 68.5,
    whatsapp_clicks: 234,
    period_data: periodData
  };
};

export const getMockProductAnalytics = (): ProductAnalytics[] => [
  {
    product_id: '1',
    product_name: 'Console Xbox Series X',
    total_views: 1542,
    total_add_to_cart: 234,
    total_purchases: 89,
    total_revenue: 44500,
    avg_conversion_rate: 5.77,
    whatsapp_clicks: 124
  },
  {
    product_id: '2',
    product_name: 'PlayStation 5',
    total_views: 1234,
    total_add_to_cart: 198,
    total_purchases: 67,
    total_revenue: 33500,
    avg_conversion_rate: 5.43,
    whatsapp_clicks: 98
  },
  {
    product_id: '3',
    product_name: 'Nintendo Switch',
    total_views: 987,
    total_add_to_cart: 165,
    total_purchases: 54,
    total_revenue: 16200,
    avg_conversion_rate: 5.47,
    whatsapp_clicks: 76
  },
  {
    product_id: '4',
    product_name: 'Steam Deck',
    total_views: 876,
    total_add_to_cart: 143,
    total_purchases: 32,
    total_revenue: 12800,
    avg_conversion_rate: 3.65,
    whatsapp_clicks: 45
  },
  {
    product_id: '5',
    product_name: 'Gaming Headset',
    total_views: 654,
    total_add_to_cart: 87,
    total_purchases: 28,
    total_revenue: 5600,
    avg_conversion_rate: 4.28,
    whatsapp_clicks: 34
  }
];

export const getMockCustomerSegments = (): CustomerSegment[] => [
  {
    segment: 'premium',
    count: 145,
    percentage: 12.8,
    avg_order_value: 850.50,
    total_revenue: 123322.50
  },
  {
    segment: 'regular',
    count: 623,
    percentage: 55.2,
    avg_order_value: 320.80,
    total_revenue: 199858.40
  },
  {
    segment: 'new',
    count: 287,
    percentage: 25.4,
    avg_order_value: 180.45,
    total_revenue: 51789.15
  },
  {
    segment: 'inactive',
    count: 75,
    percentage: 6.6,
    avg_order_value: 95.20,
    total_revenue: 7140.00
  }
];

export const getMockTrafficAnalytics = (): TrafficAnalytics[] => [
  {
    source: 'google',
    sessions: 1245,
    conversions: 87,
    conversion_rate: 6.99,
    revenue: 43500
  },
  {
    source: 'direct',
    sessions: 892,
    conversions: 62,
    conversion_rate: 6.95,
    revenue: 31000
  },
  {
    source: 'facebook',
    sessions: 634,
    conversions: 34,
    conversion_rate: 5.36,
    revenue: 17000
  },
  {
    source: 'instagram',
    sessions: 423,
    conversions: 21,
    conversion_rate: 4.96,
    revenue: 10500
  },
  {
    source: 'youtube',
    sessions: 287,
    conversions: 15,
    conversion_rate: 5.23,
    revenue: 7500
  }
];