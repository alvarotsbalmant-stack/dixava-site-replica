import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAnalyticsCleanup = () => {
  const { user } = useAuth();

  // Function to clear mock analytics data
  const clearMockData = async () => {
    try {
      console.log('🧹 Clearing mock analytics data...');
      
      // Clear mock events (events without real user interactions)
      const { error: eventsError } = await supabase
        .from('customer_events')
        .delete()
        .or('event_data->mock.eq.true,session_id.like.mock_%');

      if (eventsError) {
        console.error('Error clearing mock events:', eventsError);
      }

      // Clear mock sessions
      const { error: sessionsError } = await supabase
        .from('user_sessions')
        .delete()
        .like('session_id', 'mock_%');

      if (sessionsError) {
        console.error('Error clearing mock sessions:', sessionsError);
      }

      console.log('✅ Mock analytics data cleared successfully');
    } catch (error) {
      console.error('❌ Error during analytics cleanup:', error);
    }
  };

  // Validate analytics data integrity
  const validateAnalyticsData = async () => {
    try {
      // Check for orphaned events
      const { data: orphanedEvents, error } = await supabase
        .from('customer_events')
        .select('id, session_id, event_type')
        .not('session_id', 'in', `(
          SELECT DISTINCT session_id 
          FROM user_sessions 
          WHERE session_id IS NOT NULL
        )`);

      if (error) {
        console.error('Error validating analytics data:', error);
        return;
      }

      if (orphanedEvents && orphanedEvents.length > 0) {
        console.warn(`Found ${orphanedEvents.length} orphaned events without valid sessions`);
      }
    } catch (error) {
      console.error('Error during analytics validation:', error);
    }
  };

  // Run cleanup on admin login (only for admins)
  useEffect(() => {
    if (user?.user_metadata?.role === 'admin') {
      const runCleanup = async () => {
        await clearMockData();
        await validateAnalyticsData();
      };
      
      // Delay cleanup to avoid interfering with initial load
      const timer = setTimeout(runCleanup, 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  return {
    clearMockData,
    validateAnalyticsData
  };
};