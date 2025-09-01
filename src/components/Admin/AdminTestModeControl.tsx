import React, { useState, useEffect } from 'react';
import { Settings, TestTube, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const AdminTestModeControl: React.FC = () => {
  const { user } = useAuth();
  const [testMode, setTestMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar se é admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      setIsAdmin(data?.role === 'admin');
    };
    
    checkAdminStatus();
  }, [user]);

  // Carregar estado atual do modo de teste
  useEffect(() => {
    const loadTestMode = async () => {
      try {
        const { data } = await supabase
          .from('coin_system_config')
          .select('setting_value')
          .eq('setting_key', 'test_mode_enabled')
          .single();
        
        setTestMode(data?.setting_value === 'true');
      } catch (error) {
        console.error('Error loading test mode:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAdmin) {
      loadTestMode();
    }
  }, [isAdmin]);

  const toggleTestMode = async () => {
    if (updating) return;
    
    try {
      setUpdating(true);
      const newValue = !testMode;
      
      const { error } = await supabase
        .from('coin_system_config')
        .update({ setting_value: newValue.toString() })
        .eq('setting_key', 'test_mode_enabled');
      
      if (error) throw error;
      
      setTestMode(newValue);
      console.log(`Test mode ${newValue ? 'ENABLED' : 'DISABLED'}`);
    } catch (error) {
      console.error('Error updating test mode:', error);
    } finally {
      setUpdating(false);
    }
  };

  // Não mostrar para usuários não-admin
  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
          <span className="text-sm text-yellow-700">Carregando configurações...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-4 ${
      testMode 
        ? 'bg-yellow-50 border-yellow-200' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            testMode ? 'bg-yellow-200' : 'bg-gray-200'
          }`}>
            <TestTube className={`w-4 h-4 ${
              testMode ? 'text-yellow-700' : 'text-gray-600'
            }`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              Modo de Teste - Daily Bonus
            </h3>
            <p className="text-sm text-gray-600">
              {testMode 
                ? 'Cooldown de 60 segundos (modo teste ativo)'
                : 'Cooldown padrão 20h-20h Brasília (modo produção)'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            testMode 
              ? 'bg-yellow-200 text-yellow-800' 
              : 'bg-gray-200 text-gray-700'
          }`}>
            {testMode ? 'TESTE' : 'PRODUÇÃO'}
          </div>
          
          <button
            onClick={toggleTestMode}
            disabled={updating}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              testMode
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {updating ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            ) : testMode ? (
              <RotateCcw className="w-3 h-3" />
            ) : (
              <Settings className="w-3 h-3" />
            )}
            {updating 
              ? 'Atualizando...' 
              : testMode 
                ? 'Desativar Teste' 
                : 'Ativar Teste'
            }
          </button>
        </div>
      </div>
      
      {testMode && (
        <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
          <p className="text-xs text-yellow-800">
            ⚠️ <strong>Modo de teste ativo:</strong> O bônus diário pode ser resgatado a cada 60 segundos.
            Desative antes de colocar em produção.
          </p>
        </div>
      )}
    </div>
  );
};