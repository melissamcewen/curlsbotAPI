import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Reference } from '../src/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../data');

function convertReferences(content: string): string {
  // Parse JSON while preserving the original formatting
  const lines = content.split('\n');
  const output: string[] = [];
  let inReferences = false;
  let indentation = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Detect when we enter a references array
    if (trimmedLine === '"references": [') {
      inReferences = true;
      indentation = line.match(/^\s*/)?.[0] || '';
      output.push(line);
      continue;
    }

    // If we're in references array and find a URL
    if (inReferences && trimmedLine.startsWith('"http')) {
      // Extract URL (remove quotes and comma)
      const url = trimmedLine.replace(/^"|"(?:,)?$/g, '');
      // Create new reference object with proper indentation
      const referenceObj = {
        url
      };
      const lastLine = i === lines.length - 1 || lines[i + 1].trim() === ']';
      output.push(`${indentation}  ${JSON.stringify(referenceObj)}${lastLine ? '' : ','}`);
      continue;
    }

    // Detect when we exit references array
    if (inReferences && trimmedLine === ']') {
      inReferences = false;
    }

    output.push(line);
  }

  return output.join('\n');
}

function processDirectory(dirPath: string) {
  const files = readdirSync(dirPath).filter(file => file.endsWith('.json'));

  for (const file of files) {
    const filePath = join(dirPath, file);
    const content = readFileSync(filePath, 'utf-8');

    // Only process and write if the file contains references
    if (content.includes('"references"')) {
      console.log(`Processing ${file}...`);
      const updatedContent = convertReferences(content);
      writeFileSync(filePath, updatedContent);
      console.log(`Updated ${file}`);
    }
  }
}

// Process ingredients directory
const ingredientsDir = join(DATA_DIR, 'ingredients');
console.log('Processing ingredients directory...');
processDirectory(ingredientsDir);

// Process categories file if it exists
const categoriesPath = join(DATA_DIR, 'categories.json');
if (readFileSync(categoriesPath, 'utf-8').includes('"references"')) {
  console.log('Processing categories.json...');
  const content = readFileSync(categoriesPath, 'utf-8');
  const updatedContent = convertReferences(content);
  writeFileSync(categoriesPath, updatedContent);
  console.log('Updated categories.json');
}
