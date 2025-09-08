import React, { useState, useEffect } from 'react';
import { useCacheStats } from '@/hooks/useProductCache';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw, Database, TrendingUp, Clock, HardDrive } from 'lucide-react';

interface CacheDebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CacheDebugPanel: React.FC<CacheDebugPanelProps> = ({ isOpen, onClose }) => {
  const { stats, clearCache } = useCacheStats();
  const [refreshKey, setRefreshKey] = useState(0);

  // Forçar atualização das estatísticas
  const updateStats = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    if (isOpen) {
      // Atualizar a cada 2 segundos quando o painel estiver aberto
      const interval = setInterval(updateStats, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleClearCache = () => {
    clearCache();
    updateStats();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Cache Debug Panel
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalRequests}
              </div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats.hits}
              </div>
              <div className="text-sm text-gray-600">Cache Hits</div>
            </div>
            
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {stats.misses}
              </div>
              <div className="text-sm text-gray-600">Cache Misses</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {stats.hitRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Hit Rate</div>
            </div>
          </div>

          {/* Informações do Cache */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Cache Info (Novo Sistema)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="text-sm text-gray-600">Cache Size</div>
                <div className="text-xl font-bold">{stats.cacheSize}</div>
                <div className="text-xs text-gray-500">produtos em cache</div>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="text-sm text-gray-600">TTL</div>
                <div className="text-xl font-bold text-blue-600">5min</div>
                <div className="text-xs text-gray-500">tempo de vida</div>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="text-sm text-gray-600">Sistema</div>
                <div className="text-xl font-bold text-green-600">Ativo</div>
                <div className="text-xs text-gray-500">cache unificado</div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="text-sm text-gray-600">Cache Efficiency</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.hitRate}%` }}
                    ></div>
                  </div>
                  <Badge variant={stats.hitRate > 80 ? "default" : stats.hitRate > 50 ? "secondary" : "destructive"}>
                    {stats.hitRate > 80 ? "Excellent" : stats.hitRate > 50 ? "Good" : "Poor"}
                  </Badge>
                </div>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="text-sm text-gray-600">Cache Status</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${stats.cacheSize > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">
                    {stats.cacheSize > 0 ? 'Active' : 'Empty'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Actions</h3>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={updateStats}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Stats
              </Button>
              
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleClearCache}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear Cache
              </Button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">🚀 Novo Sistema de Cache</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Cache unificado com TTL de 5 minutos</li>
              <li>• Request deduplication automático</li>
              <li>• Produtos relacionados otimizados</li>
              <li>• Hit rate acima de 80% é excelente</li>
              <li>• Cache em memória para máxima velocidade</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

