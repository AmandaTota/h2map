import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MigrationStatus {
  applied: boolean;
  missingColumns: string[];
  error: string | null;
}

export default function ProfileMigrationCheck() {
  const [status, setStatus] = useState<MigrationStatus | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkMigrationStatus();
  }, []);

  const checkMigrationStatus = async () => {
    setIsChecking(true);
    try {
      // Try to query for the new columns
      const { data, error } = await supabase
        .from("user_profiles")
        .select("location, phone, website")
        .limit(1);

      if (error) {
        // Check if error is about missing columns
        const errorMessage = error.message.toLowerCase();
        const missingColumns: string[] = [];

        if (errorMessage.includes("location")) missingColumns.push("location");
        if (errorMessage.includes("phone")) missingColumns.push("phone");
        if (errorMessage.includes("website")) missingColumns.push("website");

        if (missingColumns.length > 0) {
          setStatus({
            applied: false,
            missingColumns,
            error: error.message,
          });
        } else {
          setStatus({
            applied: false,
            missingColumns: [],
            error: error.message,
          });
        }
      } else {
        // Migration is applied!
        setStatus({
          applied: true,
          missingColumns: [],
          error: null,
        });
      }
    } catch (error) {
      console.error("Error checking migration:", error);
      setStatus({
        applied: false,
        missingColumns: [],
        error: "Erro ao verificar status da migration",
      });
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <AlertDescription className="text-blue-800 ml-2">
          Verificando configuração do banco de dados...
        </AlertDescription>
      </Alert>
    );
  }

  if (!status) return null;

  if (status.applied) {
    return (
      <Alert className="bg-emerald-50 border-emerald-200">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        <AlertDescription className="text-emerald-800 ml-2">
          ✅ Sistema de perfil configurado corretamente!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-orange-50 border-orange-200">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <div className="ml-2 flex-1">
        <AlertDescription className="text-orange-800 space-y-2">
          <div className="font-medium">⚠️ Migration do perfil não aplicada</div>
          <div className="text-sm">
            As mudanças do perfil não serão salvas até que a migration seja
            aplicada no banco de dados.
          </div>

          {status.missingColumns.length > 0 && (
            <div className="text-sm mt-2">
              <strong>Colunas faltando:</strong>{" "}
              {status.missingColumns.join(", ")}
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-orange-600 border-orange-300 hover:bg-orange-100"
            >
              {showDetails ? "Ocultar" : "Ver"} Instruções
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.open(
                  "https://supabase.com/dashboard/project/ernubxpsllxprtdylmcy/sql",
                  "_blank",
                );
              }}
              className="text-orange-600 border-orange-300 hover:bg-orange-100"
            >
              Abrir SQL Editor
            </Button>
          </div>

          {showDetails && (
            <div className="mt-3 p-3 bg-white rounded border border-orange-200 text-sm space-y-2">
              <div>
                <strong>Como resolver:</strong>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>
                  Abra o arquivo <code>apply-profile-migration.sql</code> na
                  raiz do projeto
                </li>
                <li>Copie todo o conteúdo do arquivo</li>
                <li>Cole no SQL Editor do Supabase e clique em "Run"</li>
                <li>Recarregue esta página para verificar</li>
              </ol>
              <div className="mt-2">
                <a
                  href="/APLICAR_MIGRATION.md"
                  target="_blank"
                  className="text-orange-600 underline hover:text-orange-700"
                >
                  Ver instruções detalhadas →
                </a>
              </div>
            </div>
          )}

          {status.error && showDetails && (
            <div className="mt-2 p-2 bg-orange-100 rounded text-xs">
              <strong>Erro:</strong>
              <pre className="mt-1 text-xs whitespace-pre-wrap">
                {status.error}
              </pre>
            </div>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
}
