import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Reference, ReferenceUsage } from '../src/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../data');
const INGREDIENTS_DIR = join(DATA_DIR, 'ingredients');

// Load existing references
function loadReferences(): Record<string, Reference> {
  const referencesPath = join(DATA_DIR, 'references.references.json');
  try {
    const data = JSON.parse(readFileSync(referencesPath, 'utf-8'));
    return data.references || {};
  } catch (error) {
    console.error('Error loading references:', error);
    return {};
  }
}

// Find reference by URL
function findReferenceByUrl(
  references: Record<string, Reference>,
  url: string,
): string | null {
  for (const [id, ref] of Object.entries(references)) {
    if (ref.url === url) {
      return id;
    }
  }
  return null;
}

// Get next available ID
function getNextId(references: Record<string, Reference>): string {
  const ids = Object.keys(references).map((id) => parseInt(id));
  const maxId = Math.max(...ids, 0);
  return (maxId + 1).toString();
}

// Convert a reference to the new format
function convertReference(
  oldRef: any,
  references: Record<string, Reference>,
): {
  referenceUsage: ReferenceUsage;
  newReferences: Record<string, Reference>;
} {
  const newReferences = { ...references };

  // Find existing reference or create new one
  let refId = findReferenceByUrl(references, oldRef.url);
  if (!refId) {
    refId = getNextId(newReferences);
    newReferences[refId] = {
      id: refId,
      url: oldRef.url,
      title: oldRef.title,
      description: oldRef.description,
      type: oldRef.type,
      author: oldRef.author,
      date: oldRef.date,
      source: oldRef.source,
      status: oldRef.status,
    };
  }

  // Create reference usage with only id, status, and notes
  const referenceUsage: ReferenceUsage = {
    id: refId,
  };
  if (oldRef.status) referenceUsage.status = oldRef.status;
  if (oldRef.description) referenceUsage.notes = oldRef.description;

  return { referenceUsage, newReferences };
}

function migrateReferences() {
  let references = loadReferences();
  const ingredientFiles = readdirSync(INGREDIENTS_DIR).filter((file) =>
    file.endsWith('.ingredients.json'),
  );

  // Process each ingredients file
  for (const file of ingredientFiles) {
    const filePath = join(INGREDIENTS_DIR, file);
    console.log(`Processing ${file}...`);

    try {
      const data = JSON.parse(readFileSync(filePath, 'utf-8'));

      // Process each ingredient's references
      for (const ingredient of data.ingredients) {
        if (!ingredient.references) continue;

        const newRefs: ReferenceUsage[] = [];
        for (const ref of ingredient.references) {
          const { referenceUsage, newReferences } = convertReference(
            ref,
            references,
          );
          references = newReferences;
          newRefs.push(referenceUsage);
        }
        ingredient.references = newRefs;
      }

      // Write updated ingredient file
      writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
      process.exit(1);
    }
  }

  // Write updated references file
  writeFileSync(
    join(DATA_DIR, 'references.references.json'),
    JSON.stringify({ references }, null, 2),
  );

  console.log('Migration complete!');
}

migrateReferences();
