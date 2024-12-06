import { Category, CategoryGroups } from '../types/category';

// Assuming a dynamic structure for categories
let categoryGroups: CategoryGroups = {};

// Function to add or update a category in a group
export function addCategoryToGroup(groupName: string, categoryName: string, categoryInfo: Category): void {
  if (!categoryGroups[groupName]) {
    categoryGroups[groupName] = {
      name: groupName,
      description: '',  // Add a default empty description
      categories: {}
    };
  }
  categoryGroups[groupName].categories[categoryName] = categoryInfo;
}

// Function to remove a category
export function removeCategoryFromGroup(groupName: string, categoryName: string): boolean {
  if (categoryGroups[groupName] && categoryGroups[groupName].categories[categoryName]) {
    delete categoryGroups[groupName].categories[categoryName];
    // Remove the group if it's empty
    if (Object.keys(categoryGroups[groupName].categories).length === 0) {
      delete categoryGroups[groupName];
    }
    return true;
  }
  return false;
}

// Function to get category info
export function getCategoryInfo(categoryName: string): Category | undefined {
  for (const group of Object.values(categoryGroups)) {
    if (categoryName in group.categories) {
      return group.categories[categoryName];
    }
  }
  return undefined;
}

// Function to get the group a category belongs to
export function getCategoryGroup(categoryName: string): string | undefined {
  for (const [groupName, group] of Object.entries(categoryGroups)) {
    if (categoryName in group.categories) {
      return groupName;
    }
  }
  return undefined;
}

// Function to get all category names
export function getAllCategories(): string[] {
  return Object.values(categoryGroups).flatMap(group =>
    Object.keys(group.categories)
  ).sort();
}

// Function to get all groups and their categories
export function getCategoryGroups(): CategoryGroups {
  return categoryGroups;
}

// Function to reset categories (optional utility)
export function resetCategoryGroups(): void {
  categoryGroups = {};
}
