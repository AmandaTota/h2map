import { useState } from 'react';
import { ChevronDown, Calendar, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Scenario {
  id: string;
  label: string;
  years: number;
  power: number;
  description: string;
  color: string;
}

const scenarios: Scenario[] = [
  {
    id: '1',
    label: 'Cenário 1 Ano',
    years: 1,
    power: 100,
    description: 'Projeto piloto com capacidade inicial',
    color: 'bg-emerald-500'
  },
  {
    id: '3',
    label: 'Cenário 3 Anos',
    years: 3,
    power: 300,
    description: 'Expansão moderada com aumento de capacidade',
    color: 'bg-blue-500'
  },
  {
    id: '5',
    label: 'Cenário 5 Anos',
    years: 5,
    power: 500,
    description: 'Operação comercial em larga escala',
    color: 'bg-purple-500'
  }
];

interface ScenarioSelectorProps {
  selectedScenario: string;
  onScenarioChange: (scenarioId: string) => void;
  className?: string;
  variant?: 'dropdown' | 'cards' | 'pills';
  showDescriptions?: boolean;
}

export const ScenarioSelector = ({
  selectedScenario,
  onScenarioChange,
  className,
  variant = 'dropdown',
  showDescriptions = true
}: ScenarioSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedScenarioData = scenarios.find(s => s.id === selectedScenario);

  const handleSelect = (scenarioId: string) => {
    onScenarioChange(scenarioId);
    setIsOpen(false);
  };

  if (variant === 'cards') {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onScenarioChange(scenario.id)}
            className={cn(
              "relative p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg",
              "text-left focus:outline-none focus:ring-2 focus:ring-offset-2",
              selectedScenario === scenario.id
                ? "border-emerald-500 bg-white shadow-md"
                : "border-gray-200 bg-white hover:border-gray-300"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", scenario.color)}>
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                selectedScenario === scenario.id
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-gray-100 text-gray-600"
              )}>
                {scenario.power} kW
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {scenario.label}
            </h3>
            
            {showDescriptions && (
              <p className="text-sm text-gray-600 mb-3">
                {scenario.description}
              </p>
            )}
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {scenario.years} {scenario.years === 1 ? 'ano' : 'anos'}
              </span>
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="font-medium text-gray-700">
                  {scenario.power} kW
                </span>
              </div>
            </div>
            
            {selectedScenario === scenario.id && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onScenarioChange(scenario.id)}
            className={cn(
              "px-4 py-2 rounded-full border transition-all duration-200 flex items-center space-x-2",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              selectedScenario === scenario.id
                ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
            )}
          >
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{scenario.label}</span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs",
              selectedScenario === scenario.id
                ? "bg-emerald-400 text-white"
                : "bg-gray-100 text-gray-600"
            )}>
              {scenario.power} kW
            </span>
          </button>
        ))}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full min-w-[200px] px-4 py-3 bg-white border-2 border-gray-200 rounded-lg",
          "flex items-center justify-between space-x-3",
          "hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
          "transition-all duration-200"
        )}
      >
        <div className="flex items-center space-x-3">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", selectedScenarioData?.color)}>
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-900">
              {selectedScenarioData?.label}
            </div>
            <div className="text-sm text-gray-500">
              {selectedScenarioData?.power} kW • {selectedScenarioData?.years} {selectedScenarioData?.years === 1 ? 'ano' : 'anos'}
            </div>
          </div>
        </div>
        <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="py-2">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => handleSelect(scenario.id)}
                className={cn(
                  "w-full px-4 py-3 flex items-center space-x-3",
                  "hover:bg-gray-50 focus:outline-none focus:bg-gray-50",
                  "transition-colors duration-150"
                )}
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", scenario.color)}>
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">
                    {scenario.label}
                  </div>
                  <div className="text-sm text-gray-500">
                    {scenario.power} kW • {scenario.years} {scenario.years === 1 ? 'ano' : 'anos'}
                  </div>
                  {showDescriptions && (
                    <div className="text-xs text-gray-400 mt-1">
                      {scenario.description}
                    </div>
                  )}
                </div>
                {selectedScenario === scenario.id && (
                  <div className="w-5 h-5 text-emerald-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioSelector;