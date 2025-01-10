import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Reference, ReferenceUsage } from '../src/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../data');

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

// Load groups
function loadGroups() {
  const groupsPath = join(DATA_DIR, 'groups.json');
  try {
    const data = JSON.parse(readFileSync(groupsPath, 'utf-8'));
    return data;
  } catch (error) {
    console.error('Error loading groups:', error);
    process.exit(1);
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
  const groupsData = loadGroups();

  // Process each group's references
  for (const group of groupsData.groups) {
    if (!group.references) continue;

    const newRefs: ReferenceUsage[] = [];
    for (const ref of group.references) {
      const { referenceUsage, newReferences } = convertReference(
        ref,
        references,
      );
      references = newReferences;
      newRefs.push(referenceUsage);
    }
    group.references = newRefs;
  }

  // Write updated files
  writeFileSync(
    join(DATA_DIR, 'references.references.json'),
    JSON.stringify({ references }, null, 2),
  );
  writeFileSync(
    join(DATA_DIR, 'groups.json'),
    JSON.stringify(groupsData, null, 2),
  );

  console.log('Migration complete!');
}

migrateReferences();
