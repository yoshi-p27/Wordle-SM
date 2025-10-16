import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function loadWordList(filePath = 'word_list.txt') {
  try {
    const resolvedPath = filePath.startsWith('/') 
      ? filePath 
      : join(__dirname, '../../', filePath);
    
    const fileContent = fs.readFileSync(resolvedPath).toString();
    return fileContent.split("\n").filter(word => word.trim().length > 0);
  } catch (error) {
    console.error(`Error loading word list from ${filePath}:`, error);
    return [];
  }
}