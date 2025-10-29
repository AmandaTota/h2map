import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ImportMunicipalities = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string; total?: number; inserted?: number } | null>(null);
  const { toast } = useToast();

  const handleImport = async () => {
    setIsImporting(true);
    setImportResult(null);

    try {
      // Fetch the CSV file from the project
      const response = await fetch('/src/data/municipios.csv');
      const csvText = await response.text();

      // Call the edge function to import the data
      const { data, error } = await supabase.functions.invoke('import-municipalities', {
        body: { csvData: csvText },
      });

      if (error) {
        throw error;
      }

      setImportResult({
        success: data.success,
        message: data.message,
        total: data.total,
        inserted: data.inserted,
      });

      if (data.success) {
        toast({
          title: 'Importação concluída!',
          description: `${data.inserted} municípios foram importados com sucesso.`,
        });
      } else {
        toast({
          title: 'Erro na importação',
          description: data.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setImportResult({
        success: false,
        message: errorMessage,
      });
      toast({
        title: 'Erro na importação',
        description: 'Ocorreu um erro ao importar os municípios.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Importar Municípios
            </h1>
            <p className="text-slate-600">
              Importe todos os municípios brasileiros do arquivo CSV para o banco de dados
            </p>
          </div>

          <div className="space-y-6">
            <Button
              onClick={handleImport}
              disabled={isImporting}
              className="w-full h-14 text-lg"
              size="lg"
            >
              {isImporting ? (
                <>
                  <Upload className="w-5 h-5 mr-2 animate-pulse" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Iniciar Importação
                </>
              )}
            </Button>

            {importResult && (
              <Card className={`p-6 ${importResult.success ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'}`}>
                <div className="flex items-start space-x-3">
                  {importResult.success ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg mb-2 ${importResult.success ? 'text-emerald-800' : 'text-red-800'}`}>
                      {importResult.success ? 'Importação Concluída!' : 'Erro na Importação'}
                    </h3>
                    <p className={importResult.success ? 'text-emerald-700' : 'text-red-700'}>
                      {importResult.message}
                    </p>
                    {importResult.total && (
                      <div className="mt-3 space-y-1 text-sm">
                        <p className="text-slate-700">
                          <strong>Total de municípios processados:</strong> {importResult.total}
                        </p>
                        <p className="text-slate-700">
                          <strong>Municípios importados:</strong> {importResult.inserted}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                ℹ️ Informações
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• O arquivo contém todos os municípios brasileiros com coordenadas</li>
                <li>• A importação pode levar alguns segundos para ser concluída</li>
                <li>• Municípios duplicados serão atualizados automaticamente</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ImportMunicipalities;
