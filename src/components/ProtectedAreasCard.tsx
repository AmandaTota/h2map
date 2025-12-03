import { useState } from "react";
import { TreePine, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProtectedAreasCard() {
  // Componente desabilitado - tabela areas_protegidas não existe ainda
  const [results] = useState<Array<any>>([]);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 overflow-hidden">
      <div className="px-6 py-4 flex items-center">
        <TreePine className="w-6 h-6 text-emerald-600 mr-3" />
        <h2 className="text-2xl font-bold text-slate-900">
          Áreas de Proteção Ambiental
        </h2>
        <Badge className="ml-auto bg-amber-100 text-amber-800 border-amber-200">
          Em breve
        </Badge>
      </div>

      <div className="px-6 pb-6">
        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <p className="text-sm text-amber-800">
            Funcionalidade de busca de áreas protegidas será disponibilizada em breve.
          </p>
        </div>
      </div>
    </Card>
  );
}
