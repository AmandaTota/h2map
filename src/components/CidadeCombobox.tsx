import { useState, useEffect } from "react";

interface Municipio {
  id: number;
  nome: string;
}

interface CidadeComboboxProps {
  cidades: Municipio[];
  value: string;
  onValueChange: (id: string, nome: string) => void;
  loading?: boolean;
  placeholder?: string;
}

const CidadeCombobox = ({
  cidades,
  value,
  onValueChange,
  loading = false,
  placeholder = "Digite ou selecione a cidade",
}: CidadeComboboxProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Sincronizar inputValue quando value mudar (seleção via lista)
  useEffect(() => {
    if (value) {
      const cidadeObj = cidades.find((c) => c.id.toString() === value);
      if (cidadeObj) {
        setInputValue(cidadeObj.nome);
      }
    } else {
      setInputValue("");
    }
  }, [value, cidades]);

  // Filtrar cidades baseado no input do usuário
  const filteredCidades = cidades.filter((cidade) =>
    cidade.nome.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelectCidade = (cidade: Municipio) => {
    setInputValue(cidade.nome);
    onValueChange(cidade.id.toString(), cidade.nome);
    setShowDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowDropdown(true);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder={loading ? "Carregando cidades..." : placeholder}
        disabled={loading}
        className="w-full h-12 px-3 py-2 border border-emerald-200 rounded-md focus:border-emerald-500 focus:outline-none bg-white text-slate-900 placeholder-slate-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
      />
      {showDropdown && inputValue && filteredCidades.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-emerald-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          {filteredCidades.map((cidade) => (
            <button
              key={cidade.id}
              type="button"
              onClick={() => handleSelectCidade(cidade)}
              className="w-full text-left px-3 py-2 hover:bg-emerald-50 text-slate-900 text-sm transition-colors"
            >
              {cidade.nome}
            </button>
          ))}
        </div>
      )}
      {showDropdown && inputValue && filteredCidades.length === 0 && cidades.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-emerald-200 rounded-md shadow-lg z-50 p-3">
          <p className="text-sm text-slate-600">Nenhuma cidade encontrada</p>
        </div>
      )}
    </div>
  );
};

export default CidadeCombobox;
