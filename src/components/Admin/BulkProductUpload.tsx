import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Info, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { generateProductTemplate, generateImportTutorial, validateProductData, processProductImport } from './BulkProductUpload/bulkProductUtilsV2';
import type { ImportedProduct, ValidationError } from './BulkProductUpload/types';

const BulkProductUpload: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importedProducts, setImportedProducts] = useState<ImportedProduct[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleDownloadTemplate = () => {
    try {
      const template = generateProductTemplate();
      const wb = XLSX.utils.book_new();
      
      // Planilha principal de produtos
      const ws = XLSX.utils.json_to_sheet(template.data);
      
      // Configurar larguras das colunas
      const columnWidths = template.columns.map(col => ({ wch: col.width || 15 }));
      ws['!cols'] = columnWidths;
      
      // Adicionar comentários/instruções nas células do cabeçalho
      template.columns.forEach((col, index) => {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
        if (!ws[cellRef]) ws[cellRef] = { t: 's', v: col.key };
        
        if (col.instructions) {
          ws[cellRef].c = [{
            a: 'Lovable',
            t: col.instructions
          }];
        }
      });

      XLSX.utils.book_append_sheet(wb, ws, 'Produtos');
      
      // Planilha de instruções
      const instructionsWs = XLSX.utils.json_to_sheet(template.instructions);
      XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instruções');
      
      // Planilha de exemplos
      const examplesWs = XLSX.utils.json_to_sheet(template.examples);
      XLSX.utils.book_append_sheet(wb, examplesWs, 'Exemplos');

      XLSX.writeFile(wb, 'template-produtos-massa.xlsx');
      
      toast({
        title: "Template baixado com sucesso!",
        description: "Preencha o arquivo Excel e faça o upload para importar os produtos.",
      });
    } catch (error) {
      console.error('Erro ao gerar template:', error);
      toast({
        title: "Erro ao baixar template",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadTutorial = async () => {
    try {
      const tutorialContent = await generateImportTutorial();
      
      // Criar arquivo de texto
      const blob = new Blob([tutorialContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // Criar link para download
      const link = document.createElement('a');
      link.href = url;
      link.download = `tutorial-importacao-produtos-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpar URL
      URL.revokeObjectURL(url);
      
      toast({
        title: "Tutorial baixado com sucesso!",
        description: "O tutorial inclui produtos mestres, tags e plataformas disponíveis.",
      });
    } catch (error) {
      console.error('Erro ao gerar tutorial:', error);
      toast({
        title: "Erro ao baixar tutorial",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls).",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Ler a planilha principal
      const worksheet = workbook.Sheets['Produtos'] || workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Processar dados
      const [headers, ...rows] = jsonData as string[][];
      const products: ImportedProduct[] = rows
        .filter(row => row.some(cell => cell != null && cell !== ''))
        .map((row, index) => {
          const product: any = {};
          headers.forEach((header, colIndex) => {
            if (header && row[colIndex] != null) {
              product[header] = row[colIndex];
            }
          });
          return { ...product, _rowIndex: index + 2 } as ImportedProduct;
        });

      // Validar dados
      setUploadProgress(50);
      const errors = validateProductData(products);
      
      setImportedProducts(products);
      setValidationErrors(errors);
      setUploadProgress(100);
      setShowPreview(true);

      if (errors.length === 0) {
        toast({
          title: "Arquivo processado com sucesso!",
          description: `${products.length} produtos prontos para importação.`,
        });
      } else {
        toast({
          title: "Arquivo processado com avisos",
          description: `${products.length} produtos encontrados, ${errors.length} erros de validação.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast({
        title: "Erro ao processar arquivo",
        description: "Verifique se o arquivo está no formato correto.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImportProducts = async () => {
    const criticalErrors = validationErrors.filter(e => e.severity === 'error');
    
    if (criticalErrors.length > 0) {
      toast({
        title: "Corrija os erros antes de importar",
        description: "Existem erros de validação que precisam ser corrigidos.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    
    try {
      const result = await processProductImport(importedProducts, (progress) => {
        setUploadProgress(progress);
      });

      if (result.success) {
        toast({
          title: "Produtos importados com sucesso!",
          description: `${result.created} produtos criados, ${result.updated} atualizados.`,
        });
        
        // Limpar dados
        setImportedProducts([]);
        setValidationErrors([]);
        setShowPreview(false);
      } else {
        toast({
          title: "Erro na importação",
          description: result.error || "Erro desconhecido durante a importação.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao importar produtos:', error);
      toast({
        title: "Erro ao importar produtos",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const criticalErrors = validationErrors.filter(e => e.severity === 'error');
  const warnings = validationErrors.filter(e => e.severity === 'warning');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Importação em Massa de Produtos
        </h2>
        <p className="text-gray-400">
          Importe múltiplos produtos usando uma planilha Excel. Suporta produtos simples e sistema de SKUs.
        </p>
      </div>

      {/* Etapa 1: Download do Template */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="w-5 h-5" />
            1. Baixar Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300">
            Baixe o template Excel pré-configurado com todas as colunas necessárias para produtos completos.
          </p>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              O template inclui instruções detalhadas e exemplos para facilitar o preenchimento.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button onClick={handleDownloadTemplate} className="bg-blue-600 hover:bg-blue-700">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Baixar Template Excel
            </Button>
            
            <Button onClick={handleDownloadTutorial} variant="outline" className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white">
              <Download className="w-4 h-4 mr-2" />
              Baixar Tutorial Completo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Etapa 2: Upload do Arquivo */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="w-5 h-5" />
            2. Upload da Planilha Preenchida
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300">
            Após preencher o template, faça o upload para validar e importar os produtos.
          </p>

          <div className="flex flex-col gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Processando...' : 'Selecionar Arquivo Excel'}
            </Button>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Processando arquivo...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Etapa 3: Preview e Confirmação */}
      {importedProducts.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5" />
              3. Preview e Confirmação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  {importedProducts.length} produtos encontrados
                </Badge>
                
                {criticalErrors.length > 0 && (
                  <Badge variant="destructive">
                    {criticalErrors.length} erros críticos
                  </Badge>
                )}
                
                {warnings.length > 0 && (
                  <Badge variant="secondary">
                    {warnings.length} avisos
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Preview
                </Button>
                
                <Button
                  onClick={handleImportProducts}
                  disabled={criticalErrors.length > 0 || processing}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {processing ? 'Importando...' : 'Importar Produtos'}
                </Button>
              </div>
            </div>

            {processing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Criando produtos...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Resumo dos erros */}
            {validationErrors.length > 0 && (
              <Alert variant={criticalErrors.length > 0 ? "destructive" : "default"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {criticalErrors.length > 0
                    ? `${criticalErrors.length} erros críticos encontrados. Corrija-os antes de importar.`
                    : `${warnings.length} avisos encontrados. Você pode prosseguir com a importação.`
                  }
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog de Preview */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Preview dos Produtos</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh]">
            <div className="space-y-6">
              {/* Erros de Validação */}
              {validationErrors.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Validações</h3>
                  
                  {criticalErrors.length > 0 && (
                    <div>
                      <h4 className="text-red-400 font-medium mb-2">Erros Críticos:</h4>
                      <div className="space-y-2">
                        {criticalErrors.map((error, index) => (
                          <Alert key={index} variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Linha {error.row}:</strong> {error.message}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}

                  {warnings.length > 0 && (
                    <div>
                      <h4 className="text-yellow-400 font-medium mb-2">Avisos:</h4>
                      <div className="space-y-2">
                        {warnings.map((error, index) => (
                          <Alert key={index}>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Linha {error.row}:</strong> {error.message}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Separator />
                </div>
              )}

              {/* Lista de Produtos */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Produtos para Importar</h3>
                <div className="grid gap-4">
                  {importedProducts.slice(0, 10).map((product, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h4 className="font-medium">{product.name || 'Nome não informado'}</h4>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>Preço: R$ {product.price || 'N/A'}</span>
                            <span>Estoque: {product.stock || 'N/A'}</span>
                            {product.is_master_product && (
                              <Badge variant="outline">Produto Mestre</Badge>
                            )}
                            {product.parent_product_id && (
                              <Badge variant="secondary">Variação</Badge>
                            )}
                          </div>
                        </div>
                        
                        <Badge variant="outline">
                          Linha {product._rowIndex}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                  
                  {importedProducts.length > 10 && (
                    <div className="text-center text-gray-500">
                      ... e mais {importedProducts.length - 10} produtos
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BulkProductUpload;