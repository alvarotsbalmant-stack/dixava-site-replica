
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { handleSupabaseRetry, logSupabaseError, invalidateSupabaseCache } from '@/utils/supabaseErrorHandler';
import { sessionMonitor, logSessionDiagnostics } from '@/utils/sessionMonitor';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<Session | null>;
  clearAuthCache: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const { toast } = useToast();

  // Improved admin role checking with retry logic
  const checkAdminRole = useCallback(async (userId: string) => {
    return handleSupabaseRetry(
      async () => {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', userId)
          .single();
        
        if (error) throw error;
        return profile?.role === 'admin';
      },
      'Admin Role Check',
      2
    );
  }, []);

  // Session validation function
  const validateSession = useCallback(async (currentSession: Session | null) => {
    if (!currentSession) return false;
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.warn('[AUTH] Session validation failed:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.warn('[AUTH] Session validation error:', error);
      return false;
    }
  }, []);

  // Session refresh function
  const refreshSession = useCallback(async () => {
    try {
      console.log('[AUTH] Refreshing session...');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        logSupabaseError(error, 'Session Refresh');
        throw error;
      }
      
      console.log('[AUTH] Session refreshed successfully');
      return data.session;
    } catch (error) {
      console.error('[AUTH] Failed to refresh session:', error);
      // Clear invalid session
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      throw error;
    }
  }, []);

  // Clear auth cache function
  const clearAuthCache = useCallback(() => {
    console.log('[AUTH] Clearing auth cache...');
    invalidateSupabaseCache();
    setSession(null);
    setUser(null);
    setIsAdmin(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    
    // Enhanced auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        
        console.log(`[AUTH] Auth state change: ${event}`, {
          hasSession: !!newSession,
          userId: newSession?.user?.id
        });
        
        // Handle specific events
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          console.log(`[AUTH] Handling ${event}`);
        }
        
        // Update session and user state immediately (synchronous only)
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setSessionChecked(true);
        
        if (newSession?.user) {
          // Defer admin role check to avoid auth deadlock
          setTimeout(async () => {
            if (!mounted) return;
            
            try {
              const isAdminUser = await checkAdminRole(newSession.user.id);
              if (mounted) {
                setIsAdmin(isAdminUser);
                setLoading(false);
              }
            } catch (error) {
              logSupabaseError(error, 'Admin Role Check');
              if (mounted) {
                setIsAdmin(false);
                setLoading(false);
              }
            }
          }, 100);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    // Initialize session with better error handling
    const initializeSession = async () => {
      try {
        console.log('[AUTH] Initializing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logSupabaseError(error, 'Session Initialization');
          throw error;
        }
        
        if (!session) {
          console.log('[AUTH] No initial session found');
          if (mounted) {
            setLoading(false);
            setSessionChecked(true);
          }
          return;
        }

        // Validate the session
        const isValid = await validateSession(session);
        if (!isValid) {
          console.warn('[AUTH] Invalid session detected, clearing...');
          clearAuthCache();
          return;
        }

        console.log('[AUTH] Valid session found');
        // Session state will be set by onAuthStateChange
        
      } catch (error) {
        console.error('[AUTH] Session initialization failed:', error);
        if (mounted) {
          clearAuthCache();
        }
      }
    };

    initializeSession();

    // Start session monitoring in development or when debugging
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        sessionMonitor.startMonitoring(60000, (info) => {
          if (!info.sessionValid && info.hasSession) {
            console.warn('[AUTH] Session health issue detected:', info);
            logSessionDiagnostics();
          }
        });
      }, 5000);
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
      sessionMonitor.stopMonitoring();
    };
  }, [checkAdminRole, validateSession, clearAuthCache]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Verificar se o email foi confirmado
      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Email não confirmado",
          description: "Verifique seu email e clique no link de confirmação antes de acessar.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/`
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar sua conta.",
      });
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Clear state immediately
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      
      toast({
        title: "Logout realizado com sucesso!",
      });
    } catch (error: any) {
      // Even if server logout fails, clear local state
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      
      toast({
        title: "Logout realizado com sucesso!",
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAdmin,
      loading,
      signIn,
      signUp,
      signOut,
      refreshSession,
      clearAuthCache,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
