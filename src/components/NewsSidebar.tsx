import { useState } from 'react';

export default function NewsSidebar() {
  const [loading] = useState(false);

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20 bg-white rounded-xl shadow-md p-4 max-h-[75vh] overflow-auto mt-[22px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900">Notícias Recentes</h3>
        </div>

        {loading && <p className="text-sm text-slate-500">Carregando...</p>}
        
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Funcionalidade de notícias temporariamente indisponível.</p>
        </div>
      </div>
    </aside>
  );
}
