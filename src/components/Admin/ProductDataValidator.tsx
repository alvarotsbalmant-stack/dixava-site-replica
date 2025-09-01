import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, RefreshCw, Database, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ValidationResult {
  total_products: number;
  products_with_tags: number;
  products_without_tags: number;
  orphaned_product_tags: number;
  invalid_tag_references: number;
  integrity_issues: string[];
}

interface DiagnosticResult {
  integrity_check: ValidationResult;
  view_product_count: number;
  direct_product_count: number;
  count_mismatch: boolean;
  timestamp: string;
}

export const ProductDataValidator: React.FC = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);

  const runValidation = async () => {
    setIsValidating(true);
    try {
      const { data, error } = await supabase.rpc('validate_product_integrity');
      
      if (error) {
        console.error('Validation error:', error);
        toast.error('Erro ao validar integridade dos dados');
        return;
      }

      setValidationResult(data[0]);
      toast.success('Validação concluída');
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Erro ao executar validação');
    } finally {
      setIsValidating(false);
    }
  };

  const runDiagnostic = async () => {
    setIsDiagnosing(true);
    try {
      const { data, error } = await supabase.rpc('diagnose_product_data');
      
      if (error) {
        console.error('Diagnostic error:', error);
        toast.error('Erro ao executar diagnóstico');
        return;
      }

      setDiagnosticResult(data as unknown as DiagnosticResult);
      toast.success('Diagnóstico concluído');
    } catch (error) {
      console.error('Diagnostic error:', error);
      toast.error('Erro ao executar diagnóstico');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const runCleanup = async () => {
    if (!confirm('Tem certeza que deseja limpar dados órfãos? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsCleaning(true);
    try {
      const { data, error } = await supabase.rpc('cleanup_orphaned_data');
      
      if (error) {
        console.error('Cleanup error:', error);
        toast.error('Erro ao limpar dados órfãos');
        return;
      }

      const cleanupResult = data as any;
      toast.success(`Limpeza concluída: ${cleanupResult.orphaned_product_tags_removed} product_tags órfãos removidos, ${cleanupResult.invalid_tag_refs_removed} referências inválidas removidas`);
      
      // Revalidar após limpeza
      await runValidation();
      await runDiagnostic();
    } catch (error) {
      console.error('Cleanup error:', error);
      toast.error('Erro ao executar limpeza');
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Validador de Dados de Produtos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runValidation} 
              disabled={isValidating}
              variant="outline"
            >
              {isValidating ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Validar Integridade
            </Button>
            
            <Button 
              onClick={runDiagnostic} 
              disabled={isDiagnosing}
              variant="outline"
            >
              {isDiagnosing ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Executar Diagnóstico
            </Button>
            
            <Button 
              onClick={runCleanup} 
              disabled={isCleaning}
              variant="destructive"
            >
              {isCleaning ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Limpar Órfãos
            </Button>
          </div>
        </CardContent>
      </Card>

      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Resultado da Validação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {validationResult.total_products}
                </div>
                <div className="text-sm text-gray-600">Total de Produtos</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {validationResult.products_with_tags}
                </div>
                <div className="text-sm text-gray-600">Com Tags</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {validationResult.products_without_tags}
                </div>
                <div className="text-sm text-gray-600">Sem Tags</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {validationResult.orphaned_product_tags}
                </div>
                <div className="text-sm text-gray-600">Tags Órfãs</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {validationResult.invalid_tag_references}
                </div>
                <div className="text-sm text-gray-600">Refs Inválidas</div>
              </div>
            </div>
            
            {validationResult.integrity_issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Problemas Encontrados:
                </h4>
                {validationResult.integrity_issues.map((issue, index) => (
                  <Badge key={index} variant="destructive" className="mr-2">
                    {issue}
                  </Badge>
                ))}
              </div>
            )}
            
            {validationResult.integrity_issues.length === 0 && (
              <Badge variant="default" className="bg-green-500">
                ✅ Nenhum problema de integridade encontrado
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      {diagnosticResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Resultado do Diagnóstico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {diagnosticResult.view_product_count}
                </div>
                <div className="text-sm text-gray-600">Via View</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {diagnosticResult.direct_product_count}
                </div>
                <div className="text-sm text-gray-600">Direto da Tabela</div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Badge 
                variant={diagnosticResult.count_mismatch ? "destructive" : "default"}
                className={diagnosticResult.count_mismatch ? "" : "bg-green-500"}
              >
                {diagnosticResult.count_mismatch ? 
                  "❌ Discrepância encontrada entre view e tabela" : 
                  "✅ Contagens consistentes"
                }
              </Badge>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              Executado em: {new Date(diagnosticResult.timestamp).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};