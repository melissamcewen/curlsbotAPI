import { Category, CategoryGroups } from '../types/category';
import { categories } from '../data/categories';

export function getCategoryInfo(categoryName: string): Category | undefined {
  // Search through all category groups
  for (const group of Object.values(categories)) {
    if (categoryName in group.categories) {
      return group.categories[categoryName];
    }
  }
  return undefined;
}

export function getCategoryGroup(categoryName: string): string | undefined {
  // Find which group contains this category
  for (const [groupName, group] of Object.entries(categories)) {
    if (categoryName in group.categories) {
      return groupName;
    }
  }
  return undefined;
}

export function getAllCategories(): string[] {
  // Get a flat list of all category names
  return Object.values(categories).flatMap(group => 
    Object.keys(group.categories)
  ).sort();
}

export function getCategoryGroups(): CategoryGroups {
  return categories;
}