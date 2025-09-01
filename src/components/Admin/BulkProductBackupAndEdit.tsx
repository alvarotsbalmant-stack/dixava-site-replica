import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Eye,
  Save,
  FileDown,
  FileText,
  AlertTriangle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Utilitários
import { generateBackupExcel, getBackupColumns } from './BulkProductUpload/backupUtils';
import { 
  validateBulkEditData, 
  processBulkEdit, 
  generateBulkEditTutorial,
  type BulkEditResult 
} from './BulkProductUpload/bulkEditUtils';
import type { ImportedProduct, ValidationError } from './BulkProductUpload/types';
import { SkippedProductsModal } from './BulkProductUpload/SkippedProductsModal';

const BulkProductBackupAndEdit: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para backup
  const [generatingBackup, setGeneratingBackup] = useState(false);
  
  // Estados para edição em massa
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importedProducts, setImportedProducts] = useState<ImportedProduct[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [editResult, setEditResult] = useState<BulkEditResult | null>(null);
  const [showSkippedModal, setShowSkippedModal] = useState(false);

  // Função para gerar backup
  const handleGenerateBackup = async () => {
    setGeneratingBackup(true);
    try {
      await generateBackupExcel();
      toast({
        title: "Backup gerado com sucesso!",
        description: "O arquivo Excel foi baixado com todos os produtos cadastrados.",
      });
    } catch (error) {
      console.error('Erro ao gerar backup:', error);
      toast({
        title: "Erro ao gerar backup",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setGeneratingBackup(false);
    }
  };

  // Função para baixar modelo de edição
  const handleDownloadEditTemplate = () => {
    try {
      const columns = getBackupColumns();
      const template = {
        data: [{}], // Linha vazia para preenchimento
        columns
      };
      
      const wb = XLSX.utils.book_new();
      
      // Planilha principal
      const ws = XLSX.utils.json_to_sheet(template.data);
      
      // Configurar larguras das colunas
      const columnWidths = template.columns.map(col => ({ wch: col.width || 15 }));
      ws['!cols'] = columnWidths;
      
      // Adicionar cabeçalhos usando os códigos corretos (key) em vez dos rótulos
      const headers = template.columns.map(col => col.key);
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });
      
      // Adicionar comentários/instruções nas células do cabeçalho
      template.columns.forEach((col, index) => {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
        if (col.instructions) {
          if (!ws[cellRef]) ws[cellRef] = { t: 's', v: col.key };
          ws[cellRef].c = [{
            a: 'Sistema',
            t: `${col.label}: ${col.instructions}`
          }];
        }
      });

      XLSX.utils.book_append_sheet(wb, ws, 'Edição em Massa');
      
      // Planilha de instruções
      const instructions = [
        { Campo: 'IMPORTANTE', Instrução: 'Leia todas as instruções antes de usar' },
        { Campo: 'Código SKU', Instrução: 'OBRIGATÓRIO - identifica o produto (não altere)' },
        { Campo: 'Campos vazios', Instrução: 'Não apagam dados existentes' },
        { Campo: 'Booleanos', Instrução: 'Use TRUE/FALSE, 1/0, SIM/NÃO' },
        { Campo: 'Arrays', Instrução: 'Separe itens com ponto e vírgula (;)' },
        { Campo: 'URLs', Instrução: 'Use URLs completas para imagens' }
      ];
      const instructionsWs = XLSX.utils.json_to_sheet(instructions);
      XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instruções');

      XLSX.writeFile(wb, 'modelo-edicao-massa-produtos.xlsx');
      
      toast({
        title: "Modelo baixado com sucesso!",
        description: "Preencha apenas os campos que deseja alterar.",
      });
    } catch (error) {
      console.error('Erro ao gerar modelo:', error);
      toast({
        title: "Erro ao baixar modelo",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  // Função para baixar tutorial
  const handleDownloadTutorial = () => {
    try {
      const tutorialContent = generateBulkEditTutorial();
      
      const blob = new Blob([tutorialContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `tutorial-edicao-massa-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Tutorial baixado com sucesso!",
        description: "Consulte o arquivo para instruções detalhadas.",
      });
    } catch (error) {
      console.error('Erro ao baixar tutorial:', error);
      toast({
        title: "Erro ao baixar tutorial",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  // Função para processar upload de arquivo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setValidationErrors([]);
    setEditResult(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setUploadProgress(50);

      // Mapear dados para ImportedProduct
      const products: ImportedProduct[] = jsonData.map((row: any, index) => ({
        ...row,
        _rowIndex: index + 2
      }));

      setUploadProgress(75);

      // Validar dados
      const errors = validateBulkEditData(products);
      setValidationErrors(errors);
      setImportedProducts(products);
      setShowPreview(true);
      setUploadProgress(100);

      toast({
        title: "Arquivo processado com sucesso!",
        description: `${products.length} produtos encontrados para edição.`,
      });

    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast({
        title: "Erro ao processar arquivo",
        description: "Verifique se o arquivo está no formato correto.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Função para confirmar edição em massa
  const handleConfirmEdit = async () => {
    if (importedProducts.length === 0) return;

    setProcessing(true);
    setUploadProgress(0);

    try {
      const result = await processBulkEdit(
        importedProducts,
        (progress, current, total) => {
          setUploadProgress(progress);
        }
      );

      setEditResult(result);
      setShowPreview(false);

      if (result.success) {
        toast({
          title: "Edição em massa concluída!",
          description: `${result.updated} produtos atualizados, ${result.skipped} ignorados.`,
        });
      } else {
        toast({
          title: "Edição concluída com erros",
          description: `${result.updated} produtos atualizados, ${result.errors.length} erros.`,
          variant: "destructive",
        });
      }

      // Mostrar modal de produtos ignorados se houver algum
      if (result.skipped > 0 && result.skipped_logs.length > 0) {
        setShowSkippedModal(true);
      }

    } catch (error) {
      console.error('Erro na edição em massa:', error);
      toast({
        title: "Erro na edição em massa",
        description: "Ocorreu um erro durante o processamento.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      setUploadProgress(0);
    }
  };

  const errorCount = validationErrors.filter(e => e.severity === 'error').length;
  const warningCount = validationErrors.filter(e => e.severity === 'warning').length;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="backup" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="backup">Backup de Produtos</TabsTrigger>
          <TabsTrigger value="edit">Edição em Massa</TabsTrigger>
        </TabsList>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="h-5 w-5" />
                Backup de Produtos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Gere um backup completo de todos os produtos cadastrados em formato Excel.
                  Esta planilha pode ser usada como backup de segurança ou base para edições futuras.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleGenerateBackup}
                disabled={generatingBackup}
                className="w-full"
                size="lg"
              >
                <FileDown className="mr-2 h-5 w-5" />
                {generatingBackup ? 'Gerando Backup...' : 'Gerar Backup Completo'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Edição em Massa de Produtos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Esta ferramenta edita produtos existentes baseado no código SKU.
                  Campos vazios na planilha NÃO apagam dados existentes.
                </AlertDescription>
              </Alert>

              {/* Botões de download */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={handleDownloadEditTemplate}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Modelo
                </Button>
                
                <Button 
                  onClick={handleDownloadTutorial}
                  variant="outline"
                  className="w-full"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Baixar Tutorial
                </Button>
              </div>

              {/* Upload de arquivo */}
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || processing}
                  className="w-full"
                  size="lg"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  {uploading ? 'Processando arquivo...' : 'Enviar Planilha de Edição'}
                </Button>

                {uploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground text-center">
                      Processando arquivo... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>

              {/* Resultado da edição */}
              {editResult && (
                <Alert className={editResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  {editResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold">
                        {editResult.success ? 'Edição concluída com sucesso!' : 'Edição concluída com problemas'}
                      </p>
                       <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>✅ Produtos atualizados: {editResult.updated}</div>
                        <div className="flex items-center gap-2">
                          ⏭️ Produtos ignorados: {editResult.skipped}
                          {editResult.skipped > 0 && editResult.skipped_logs.length > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowSkippedModal(true)}
                              className="h-6 px-2 text-xs"
                            >
                              Ver Detalhes
                            </Button>
                          )}
                        </div>
                       </div>
                      {editResult.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-red-600">Erros encontrados:</p>
                          <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                            {editResult.errors.slice(0, 3).map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                            {editResult.errors.length > 3 && (
                              <li>... e mais {editResult.errors.length - 3} erros</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Preview */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview da Edição em Massa
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Resumo */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{importedProducts.length}</div>
                <div className="text-sm text-muted-foreground">Produtos na planilha</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{warningCount}</div>
                <div className="text-sm text-muted-foreground">Avisos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-muted-foreground">Erros</div>
              </div>
            </div>

            {/* Erros e avisos */}
            {validationErrors.length > 0 && (
              <ScrollArea className="h-48 border rounded-md p-4">
                <div className="space-y-2">
                  {validationErrors.map((error, index) => (
                    <div key={index} className="flex items-start gap-2">
                      {error.severity === 'error' ? (
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                      )}
                      <div className="text-sm">
                        <Badge variant={error.severity === 'error' ? 'destructive' : 'secondary'} className="mr-2">
                          Linha {error.row}
                        </Badge>
                        <strong>{error.field}:</strong> {error.message}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Botões de ação */}
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowPreview(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmEdit}
                disabled={processing || errorCount > 0}
              >
                {processing ? 'Processando...' : 'Confirmar Edição'}
              </Button>
            </div>

            {processing && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  Editando produtos... {uploadProgress.toFixed(0)}%
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Produtos Ignorados */}
      <SkippedProductsModal
        open={showSkippedModal}
        onOpenChange={setShowSkippedModal}
        skippedLogs={editResult?.skipped_logs || []}
      />
    </div>
  );
};

export default BulkProductBackupAndEdit;