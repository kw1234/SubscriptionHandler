import { apiRequest } from "./queryClient";

export const subscriptionApi = {
  createSubscription: async (email: string, username: string) => {
    const response = await apiRequest("POST", "/api/create-subscription", {
      email,
      username,
    });
    return response.json();
  },

  cancelSubscription: async (subscriptionId: string) => {
    const response = await apiRequest("POST", `/api/subscriptions/${subscriptionId}/cancel`);
    return response.json();
  },

  reactivateSubscription: async (subscriptionId: string) => {
    const response = await apiRequest("POST", `/api/subscriptions/${subscriptionId}/reactivate`);
    return response.json();
  },

  getSubscriptions: async (page: number = 1, limit: number = 10, status?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status && status !== 'all') {
      params.append('status', status);
    }

    const response = await apiRequest("GET", `/api/subscriptions?${params}`);
    return response.json();
  },

  getDashboardMetrics: async () => {
    const response = await apiRequest("GET", "/api/dashboard/metrics");
    return response.json();
  },

  getActivityLogs: async (limit: number = 10) => {
    const response = await apiRequest("GET", `/api/activity-logs?limit=${limit}`);
    return response.json();
  },

  getPaymentHistory: async (userId?: string, limit: number = 10) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (userId) {
      params.append('userId', userId);
    }
    
    const response = await apiRequest("GET", `/api/payment-history?${params}`);
    return response.json();
  },
};
