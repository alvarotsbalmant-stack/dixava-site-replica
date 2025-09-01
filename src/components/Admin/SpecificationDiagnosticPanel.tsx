import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle, Play, Wrench, Zap } from 'lucide-react';
import { 
  runSpecificationDiagnostic, 
  testSpecificationValidation,
  type DiagnosticResult 
} from '@/utils/specificationDiagnostic';
import { 
  runSpecificationFix, 
  runAdvancedSpecificationFix,
  type SpecificationFixResult 
} from '@/utils/specificationFixer';
import { toast } from '@/hooks/use-toast';

export function SpecificationDiagnosticPanel() {
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [fixResult, setFixResult] = useState<SpecificationFixResult | null>(null);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [isRunningFix, setIsRunningFix] = useState(false);
  const [isRunningAdvancedFix, setIsRunningAdvancedFix] = useState(false);

  const runDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    try {
      const result = await runSpecificationDiagnostic();
      setDiagnosticResult(result);
      
      if (result.success) {
        toast({
          title: "Diagnóstico concluído",
          description: "Teste de especificações executado com sucesso",
        });
      } else {
        toast({
          title: "Diagnóstico falhou",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro no diagnóstico:', error);
      toast({
        title: "Erro no diagnóstico",
        description: "Erro inesperado durante o teste",
        variant: "destructive"
      });
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const runBasicFix = async () => {
    setIsRunningFix(true);
    try {
      const result = await runSpecificationFix();
      setFixResult(result);
    } catch (error) {
      console.error('Erro na correção básica:', error);
    } finally {
      setIsRunningFix(false);
    }
  };

  const runAdvancedFix = async () => {
    setIsRunningAdvancedFix(true);
    try {
      const result = await runAdvancedSpecificationFix();
      setFixResult(result);
      
      if (result.success) {
        toast({
          title: "Correção avançada concluída",
          description: result.message,
        });
      } else {
        toast({
          title: "Erro na correção avançada",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro na correção avançada:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado durante a correção avançada",
        variant: "destructive"
      });
    } finally {
      setIsRunningAdvancedFix(false);
    }
  };

  const runValidationTest = () => {
    const results = testSpecificationValidation();
    console.log('Resultados do teste de validação:', results);
    toast({
      title: "Teste de validação executado",
      description: `Testadas ${results.stats.total} categorias. ${results.stats.valid} válidas, ${results.stats.fallback} com fallback.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Painel de Diagnóstico de Especificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              onClick={runDiagnostic}
              disabled={isRunningDiagnostic}
              className="h-20 flex flex-col items-center justify-center"
            >
              <Play className="h-5 w-5 mb-2" />
              {isRunningDiagnostic ? "Executando..." : "Teste Diagnóstico"}
            </Button>
            
            <Button 
              onClick={runValidationTest}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <CheckCircle className="h-5 w-5 mb-2" />
              Teste de Validação
            </Button>
            
            <Button 
              onClick={runBasicFix}
              disabled={isRunningFix}
              variant="secondary"
              className="h-20 flex flex-col items-center justify-center"
            >
              <Wrench className="h-5 w-5 mb-2" />
              {isRunningFix ? "Corrigindo..." : "Correção Básica"}
            </Button>
            
            <Button 
              onClick={runAdvancedFix}
              disabled={isRunningAdvancedFix}
              className="h-20 flex flex-col items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Zap className="h-5 w-5 mb-2" />
              {isRunningAdvancedFix ? "Corrigindo..." : "Correção Avançada"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {diagnosticResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {diagnosticResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Resultado do Diagnóstico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={diagnosticResult.success ? "default" : "destructive"}>
                  {diagnosticResult.success ? "SUCESSO" : "FALHA"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {diagnosticResult.message}
                </span>
              </div>
              
              {diagnosticResult.categoriesFound && diagnosticResult.categoriesFound.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Categorias Encontradas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {diagnosticResult.categoriesFound.map((category, index) => (
                      <Badge key={index} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {diagnosticResult.details && (
                <div>
                  <h4 className="font-medium mb-2">Detalhes:</h4>
                  <ScrollArea className="h-32 w-full rounded border p-2">
                    <pre className="text-xs">
                      {JSON.stringify(diagnosticResult.details, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {fixResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {fixResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Resultado da Correção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={fixResult.success ? "default" : "destructive"}>
                  {fixResult.success ? "SUCESSO" : "FALHA"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {fixResult.message}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {fixResult.details.totalSpecs}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total de Specs
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {fixResult.details.fixedSpecs}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Specs Corrigidas
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {fixResult.details.categoriesUpdated.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Categorias Atualizadas
                  </div>
                </div>
              </div>
              
              {fixResult.details.categoriesUpdated.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Alterações Realizadas:</h4>
                  <ScrollArea className="h-40 w-full rounded border p-2">
                    <div className="space-y-1">
                      {fixResult.details.categoriesUpdated.map((update, index) => (
                        <div key={index} className="text-xs font-mono p-1 bg-muted rounded">
                          {update}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              {fixResult.details.errors && fixResult.details.errors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-red-600">Erros:</h4>
                  <ScrollArea className="h-32 w-full rounded border p-2">
                    <div className="space-y-1">
                      {fixResult.details.errors.map((error, index) => (
                        <div key={index} className="text-xs text-red-600 p-1 bg-red-50 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}