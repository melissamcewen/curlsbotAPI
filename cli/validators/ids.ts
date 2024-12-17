import type { IngredientDatabase } from '../../src/types';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export function validateIds(database: IngredientDatabase): string[] {
  const errors: string[] = [];

  // Check ingredient IDs
  Object.keys(database.ingredients).forEach((id) => {
    if (id.includes('-')) {
      errors.push(
        `❌ Invalid ingredient ID "${id}": IDs should use underscores instead of hyphens`,
      );
    }
  });

  // Check category IDs
  Object.keys(database.categories).forEach((id) => {
    if (id.includes('-')) {
      errors.push(
        `❌ Invalid category ID "${id}": IDs should use underscores instead of hyphens`,
      );
    }
  });

  // Check group IDs
  Object.keys(database.groups).forEach((id) => {
    if (id.includes('-')) {
      errors.push(
        `❌ Invalid group ID "${id}": IDs should use underscores instead of hyphens`,
      );
    }
  });

  return errors;
}

export function fixIds(database: IngredientDatabase): IngredientDatabase {
  const newDatabase = JSON.parse(JSON.stringify(database));

  // Fix ingredient IDs and their category references
  const ingredientIdMap = new Map<string, string>();
  Object.entries(newDatabase.ingredients).forEach(([oldId, ingredient]) => {
    const newId = oldId.replace(/-/g, '_');
    ingredientIdMap.set(oldId, newId);
    ingredient.id = newId;
    ingredient.categories = ingredient.categories.map((cat) =>
      cat.replace(/-/g, '_'),
    );
  });

  // Fix category IDs and their references
  const categoryIdMap = new Map<string, string>();
  Object.entries(newDatabase.categories).forEach(([oldId, category]) => {
    const newId = oldId.replace(/-/g, '_');
    categoryIdMap.set(oldId, newId);
    category.id = newId;
    if (category.defaultIngredient) {
      category.defaultIngredient = category.defaultIngredient.replace(/-/g, '_');
    }
  });

  // Fix group IDs and their references
  Object.entries(newDatabase.groups).forEach(([oldId, group]) => {
    const newId = oldId.replace(/-/g, '_');
    group.id = newId;
    if (group.defaultIngredient) {
      group.defaultIngredient = group.defaultIngredient.replace(/-/g, '_');
    }
  });

  // Rebuild objects with new IDs
  newDatabase.ingredients = Object.fromEntries(
    Object.entries(newDatabase.ingredients).map(([oldId, value]) => [
      ingredientIdMap.get(oldId) || oldId,
      value,
    ]),
  );

  newDatabase.categories = Object.fromEntries(
    Object.entries(newDatabase.categories).map(([oldId, value]) => [
      categoryIdMap.get(oldId) || oldId,
      value,
    ]),
  );

  return newDatabase;
}

export function fixIdsInFiles(dataDir: string): void {
  const configDir = join(dataDir, 'config');
  const ingredientsDir = join(dataDir, 'ingredients');

  // Fix settings.json
  const settingsPath = join(configDir, 'settings.json');
  if (existsSync(settingsPath)) {
    const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
    // Fix settings IDs and references
    const updatedSettings = Object.fromEntries(
      Object.entries(settings).map(([key, value]) => [
        key.replace(/-/g, '_'),
        {
          ...value,
          id: value.id?.replace(/-/g, '_'),
          group: value.group?.replace(/-/g, '_'),
          category: value.category?.replace(/-/g, '_'),
        },
      ]),
    );
    writeFileSync(settingsPath, JSON.stringify(updatedSettings, null, 2) + '\n');
    console.log('✅ Updated settings.json');
  }

  // Fix ingredient files
  const files = readdirSync(ingredientsDir).filter((file) =>
    file.endsWith('.ingredients.json'),
  );

  files.forEach((file) => {
    const filePath = join(ingredientsDir, file);
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));

    // Fix ingredient IDs and category references
    data.ingredients = data.ingredients.map((ingredient) => ({
      ...ingredient,
      id: ingredient.id?.replace(/-/g, '_'),
      categories: ingredient.categories?.map((cat) => cat.replace(/-/g, '_')),
    }));

    writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    console.log(`✅ Updated ${file}`);
  });

  // Fix categories.json
  const categoriesPath = join(dataDir, 'categories.json');
  if (existsSync(categoriesPath)) {
    const categories = JSON.parse(readFileSync(categoriesPath, 'utf-8'));
    // Fix category IDs and references
    const updatedCategories = Object.fromEntries(
      Object.entries(categories).map(([key, value]) => [
        key.replace(/-/g, '_'),
        {
          ...value,
          id: value.id?.replace(/-/g, '_'),
          group: value.group?.replace(/-/g, '_'),
          defaultIngredient: value.defaultIngredient?.replace(/-/g, '_'),
        },
      ]),
    );
    writeFileSync(
      categoriesPath,
      JSON.stringify(updatedCategories, null, 2) + '\n',
    );
    console.log('✅ Updated categories.json');
  }

  // Fix groups.json
  const groupsPath = join(dataDir, 'groups.json');
  if (existsSync(groupsPath)) {
    const groups = JSON.parse(readFileSync(groupsPath, 'utf-8'));
    // Fix group IDs and references
    const updatedGroups = Object.fromEntries(
      Object.entries(groups).map(([key, value]) => [
        key.replace(/-/g, '_'),
        {
          ...value,
          id: value.id?.replace(/-/g, '_'),
          defaultIngredient: value.defaultIngredient?.replace(/-/g, '_'),
        },
      ]),
    );
    writeFileSync(groupsPath, JSON.stringify(updatedGroups, null, 2) + '\n');
    console.log('✅ Updated groups.json');
  }
}
