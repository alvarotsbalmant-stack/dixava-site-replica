// Session monitoring and debugging utilities
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

export interface SessionInfo {
  hasSession: boolean;
  sessionValid: boolean;
  tokenExpiry: Date | null;
  refreshTokenExpiry: Date | null;
  userId: string | null;
  userEmail: string | null;
  clockDrift: number;
  timeChecked: Date;
}

export class SessionMonitor {
  private static instance: SessionMonitor;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private callbacks: Array<(info: SessionInfo) => void> = [];

  static getInstance(): SessionMonitor {
    if (!SessionMonitor.instance) {
      SessionMonitor.instance = new SessionMonitor();
    }
    return SessionMonitor.instance;
  }

  // Check current session status
  async checkSessionStatus(): Promise<SessionInfo> {
    const timeChecked = new Date();
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return {
          hasSession: false,
          sessionValid: false,
          tokenExpiry: null,
          refreshTokenExpiry: null,
          userId: null,
          userEmail: null,
          clockDrift: 0,
          timeChecked
        };
      }

      // Calculate clock drift
      const serverTime = this.extractTokenTimestamp(session.access_token);
      const clockDrift = serverTime ? Math.abs(Date.now() - serverTime) : 0;

      // Parse token expiry
      const tokenExpiry = session.expires_at ? new Date(session.expires_at * 1000) : null;
      const refreshTokenExpiry = session.refresh_token ? this.extractRefreshTokenExpiry(session.refresh_token) : null;

      // Validate session
      const sessionValid = await this.validateSession(session);

      return {
        hasSession: true,
        sessionValid,
        tokenExpiry,
        refreshTokenExpiry,
        userId: session.user?.id || null,
        userEmail: session.user?.email || null,
        clockDrift,
        timeChecked
      };
    } catch (error) {
      console.error('[SESSION_MONITOR] Error checking session:', error);
      return {
        hasSession: false,
        sessionValid: false,
        tokenExpiry: null,
        refreshTokenExpiry: null,
        userId: null,
        userEmail: null,
        clockDrift: 0,
        timeChecked
      };
    }
  }

  // Start monitoring session health
  startMonitoring(intervalMs: number = 30000, callback?: (info: SessionInfo) => void) {
    if (callback) {
      this.callbacks.push(callback);
    }

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      const info = await this.checkSessionStatus();
      console.log('[SESSION_MONITOR] Session status:', info);
      
      // Notify all callbacks
      this.callbacks.forEach(cb => cb(info));
      
      // Auto-recovery logic
      if (info.hasSession && !info.sessionValid) {
        console.warn('[SESSION_MONITOR] Invalid session detected, attempting recovery...');
        await this.attemptSessionRecovery();
      }
    }, intervalMs);

    console.log('[SESSION_MONITOR] Started monitoring with interval:', intervalMs);
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.callbacks = [];
    console.log('[SESSION_MONITOR] Stopped monitoring');
  }

  // Attempt to recover an invalid session
  private async attemptSessionRecovery(): Promise<boolean> {
    try {
      console.log('[SESSION_MONITOR] Attempting session recovery...');
      
      // Try to refresh the session
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        console.warn('[SESSION_MONITOR] Session refresh failed:', error);
        
        // Force sign out if refresh fails
        await supabase.auth.signOut();
        return false;
      }
      
      console.log('[SESSION_MONITOR] Session recovery successful');
      return true;
    } catch (error) {
      console.error('[SESSION_MONITOR] Session recovery failed:', error);
      return false;
    }
  }

  // Validate a session by making a test API call
  private async validateSession(session: Session): Promise<boolean> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.warn('[SESSION_MONITOR] Session validation failed:', error);
        return false;
      }
      
      // Additional validation: check if user ID matches
      return user.id === session.user.id;
    } catch (error) {
      console.warn('[SESSION_MONITOR] Session validation error:', error);
      return false;
    }
  }

  // Extract timestamp from JWT token
  private extractTokenTimestamp(token: string): number | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.iat ? decoded.iat * 1000 : null;
    } catch (error) {
      return null;
    }
  }

  // Extract refresh token expiry (approximation)
  private extractRefreshTokenExpiry(refreshToken: string): Date | null {
    try {
      // Refresh tokens typically last much longer, but we can't decode them
      // Return an approximation based on typical Supabase settings
      return new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)); // 30 days
    } catch (error) {
      return null;
    }
  }

  // Get diagnostic information for debugging
  async getDiagnosticInfo(): Promise<any> {
    const sessionInfo = await this.checkSessionStatus();
    
    return {
      session: sessionInfo,
      environment: {
        userAgent: navigator.userAgent,
        localStorage: !!window.localStorage,
        sessionStorage: !!window.sessionStorage,
        cookiesEnabled: navigator.cookieEnabled,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
      },
      supabaseKeys: {
        hasUrl: !!process.env.VITE_SUPABASE_URL,
        hasAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY,
      },
      storageData: this.getStorageData()
    };
  }

  // Get relevant data from browser storage
  private getStorageData() {
    const data: any = {};
    
    try {
      // Check localStorage for Supabase data
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          data[`localStorage.${key}`] = localStorage.getItem(key)?.substring(0, 100) + '...';
        }
      });
      
      // Check sessionStorage for Supabase data
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          data[`sessionStorage.${key}`] = sessionStorage.getItem(key)?.substring(0, 100) + '...';
        }
      });
    } catch (error) {
      data.storageError = 'Unable to access storage';
    }
    
    return data;
  }
}

// Export singleton instance
export const sessionMonitor = SessionMonitor.getInstance();

// Helper function to log session diagnostics
export const logSessionDiagnostics = async () => {
  const diagnostics = await sessionMonitor.getDiagnosticInfo();
  console.group('🔍 [SESSION_DIAGNOSTICS]');
  console.log('Full diagnostic information:', diagnostics);
  console.groupEnd();
  return diagnostics;
};