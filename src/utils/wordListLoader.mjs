import * as fs from 'fs';

export function loadWordList(filePath = 'word_list.txt') {
  try {
    const fileContent = fs.readFileSync(filePath).toString();
    return fileContent.split("\n").filter(word => word.trim().length > 0);
  } catch (error) {
    console.error(`Error loading word list from ${filePath}:`, error);
    return [];
  }
}