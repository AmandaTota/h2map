#!/usr/bin/env python3
import re

with open('src/pages/FeasibilityAnalysis.tsx', 'r') as f:
    lines = f.readlines()

output = []
for line in lines:
    # Pular linhas que contêm arrow functions (callbacks)
    if '=>' in line and '(' in line.split('=>')[0]:
        output.append(line)
        continue
    
    # Substituir .toFixed(n) por Math.ceil() apenas em valores de exibição
    # Padrão: {variavel.toFixed(n)}
    line = re.sub(r'\{(\w+)\.toFixed\([0-2]\)\}', r'{Math.ceil(\1)}', line)
    
    # Padrão: {(expressão).toFixed(n)}
    line = re.sub(r'\{(\([^)]+\))\.toFixed\([0-2]\)\}', r'{Math.ceil(\1)}', line)
    
    # Substituir ton por t (tonelada)
    line = re.sub(r'\bton\b', 't', line)
    line = re.sub(r'\bton/', 't/', line)
    
    output.append(line)

with open('src/pages/FeasibilityAnalysis.tsx', 'w') as f:
    f.writelines(output)

print("✅ Formatação concluída!")
