/**
 * COMPONENTE DEBUG TRACKING STATUS
 * Mostra status do sistema de tracking e força inicialização
 */

import React, { useEffect, useState } from 'react';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { useEnterpriseTracking } from '@/contexts/EnterpriseTrackingContext';

interface TrackingStatus {
  analyticsActive: boolean;
  enterpriseActive: boolean;
  uniqueUserId: string | null;
  sessionId: string | null;
  isTracking: boolean;
  pageViews: number;
  errors: string[];
}

export const DebugTrackingStatus: React.FC = () => {
  const [status, setStatus] = useState<TrackingStatus>({
    analyticsActive: false,
    enterpriseActive: false,
    uniqueUserId: null,
    sessionId: null,
    isTracking: false,
    pageViews: 0,
    errors: []
  });

  // Tentar usar contextos
  let analytics = null;
  let enterprise = null;

  try {
    analytics = useAnalytics();
  } catch (error) {
    console.error('❌ [DEBUG] Analytics context not available:', error);
  }

  try {
    enterprise = useEnterpriseTracking();
  } catch (error) {
    console.error('❌ [DEBUG] Enterprise context not available:', error);
  }

  useEffect(() => {
    const updateStatus = () => {
      const newStatus: TrackingStatus = {
        analyticsActive: !!analytics,
        enterpriseActive: !!enterprise,
        uniqueUserId: analytics?.uniqueUserId || enterprise?.uniqueUserId || null,
        sessionId: analytics?.sessionId || enterprise?.sessionId || null,
        isTracking: analytics?.isTracking || enterprise?.isTracking || false,
        pageViews: 0,
        errors: []
      };

      // Verificar localStorage
      const storedUserId = localStorage.getItem('uti_user_id');
      if (storedUserId) {
        console.log('🆔 [DEBUG] Found stored user ID:', storedUserId);
      } else {
        console.log('❌ [DEBUG] No stored user ID found');
        newStatus.errors.push('No stored user ID');
      }

      // Testar tracking
      if (analytics?.trackPageView) {
        try {
          analytics.trackPageView('/debug-test');
          newStatus.pageViews++;
          console.log('✅ [DEBUG] Analytics page view tracked');
        } catch (error) {
          console.error('❌ [DEBUG] Analytics tracking failed:', error);
          newStatus.errors.push(`Analytics error: ${error}`);
        }
      }

      if (enterprise?.trackPageView) {
        try {
          enterprise.trackPageView('/debug-test');
          console.log('✅ [DEBUG] Enterprise page view tracked');
        } catch (error) {
          console.error('❌ [DEBUG] Enterprise tracking failed:', error);
          newStatus.errors.push(`Enterprise error: ${error}`);
        }
      }

      setStatus(newStatus);
    };

    updateStatus();

    // Atualizar a cada 5 segundos
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, [analytics, enterprise]);

  // Forçar inicialização se necessário
  useEffect(() => {
    if (!status.uniqueUserId) {
      console.log('🔄 [DEBUG] Forcing user ID generation...');
      
      // Gerar ID manualmente se necessário
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      const fingerprint = btoa(navigator.userAgent + screen.width + screen.height).substr(0, 8);
      const forcedUserId = `user_${timestamp}_${random}_${fingerprint}`;
      
      localStorage.setItem('uti_user_id', forcedUserId);
      console.log('🆔 [DEBUG] Forced user ID:', forcedUserId);
      
      // Recarregar página para ativar tracking
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }, [status.uniqueUserId]);

  // Só mostrar em desenvolvimento ou quando há problemas
  if (process.env.NODE_ENV === 'production' && status.analyticsActive && status.enterpriseActive) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: status.errors.length > 0 ? '#fee2e2' : '#f0f9ff',
        border: `2px solid ${status.errors.length > 0 ? '#ef4444' : '#3b82f6'}`,
        borderRadius: '8px',
        padding: '12px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        maxWidth: '300px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
        🔍 Debug Tracking Status
      </div>
      
      <div style={{ display: 'grid', gap: '4px' }}>
        <div>
          <span style={{ color: status.analyticsActive ? '#059669' : '#dc2626' }}>
            {status.analyticsActive ? '✅' : '❌'}
          </span>
          <span style={{ marginLeft: '4px' }}>Analytics Context</span>
        </div>
        
        <div>
          <span style={{ color: status.enterpriseActive ? '#059669' : '#dc2626' }}>
            {status.enterpriseActive ? '✅' : '❌'}
          </span>
          <span style={{ marginLeft: '4px' }}>Enterprise Context</span>
        </div>
        
        <div>
          <span style={{ color: status.isTracking ? '#059669' : '#dc2626' }}>
            {status.isTracking ? '✅' : '❌'}
          </span>
          <span style={{ marginLeft: '4px' }}>Tracking Active</span>
        </div>
        
        {status.uniqueUserId && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontWeight: 'bold', color: '#374151' }}>User ID:</div>
            <div style={{ 
              background: '#f3f4f6', 
              padding: '4px', 
              borderRadius: '4px',
              wordBreak: 'break-all',
              fontSize: '10px'
            }}>
              {status.uniqueUserId}
            </div>
          </div>
        )}
        
        {status.sessionId && (
          <div style={{ marginTop: '4px' }}>
            <div style={{ fontWeight: 'bold', color: '#374151' }}>Session ID:</div>
            <div style={{ 
              background: '#f3f4f6', 
              padding: '4px', 
              borderRadius: '4px',
              wordBreak: 'break-all',
              fontSize: '10px'
            }}>
              {status.sessionId}
            </div>
          </div>
        )}
        
        {status.errors.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontWeight: 'bold', color: '#dc2626' }}>Errors:</div>
            {status.errors.map((error, index) => (
              <div key={index} style={{ 
                color: '#dc2626', 
                fontSize: '10px',
                marginTop: '2px'
              }}>
                • {error}
              </div>
            ))}
          </div>
        )}
        
        <div style={{ 
          marginTop: '8px', 
          padding: '4px', 
          background: '#f9fafb',
          borderRadius: '4px',
          fontSize: '10px',
          color: '#6b7280'
        }}>
          Page Views: {status.pageViews} | 
          Updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

