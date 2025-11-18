// Simple bracket and parentheses balance check
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src/pages/FeasibilityAnalysis.tsx');

try {
  const content = fs.readFileSync(filePath, 'utf8');
  
  let bracketCount = 0;
  let parenCount = 0;
  let jsxExprCount = 0;
  
  for (let char of content) {
    switch (char) {
      case '{': bracketCount++; break;
      case '}': bracketCount--; break;
      case '(': parenCount++; break;
      case ')': parenCount--; break;
    }
  }
  
  console.log('=== Balance Check ===');
  console.log(`Brackets: ${bracketCount}`);
  console.log(`Parentheses: ${parenCount}`);
  
  if (bracketCount === 0 && parenCount === 0) {
    console.log('✅ All brackets and parentheses are balanced!');
  } else {
    console.log('⚠️  Imbalance detected');
  }
  
} catch (error) {
  console.error('Error:', error.message);
}