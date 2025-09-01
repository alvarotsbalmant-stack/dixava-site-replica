// Simplified subscriptions hook for new architecture
export const useSubscriptions = () => {
  // For now, return basic structure with expected interface
  return {
    isProMember: false,
    hasActiveSubscription: () => false,
    checkSubscriptionStatus: () => {},
    subscriptionData: null,
    plans: [],
    userSubscription: null,
    usuario: null,
    loading: false,
    createSubscription: async (planId?: any) => true,
    cancelSubscription: async () => true,
  };
};