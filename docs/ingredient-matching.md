# Ingredient Matching

## Database Structure

The ingredient database has a hierarchical structure:

- Groups contain Categories (e.g., the "alcohols" group contains "emollient_alcohols", "volatile_alcohols", etc.)
- Categories contain Ingredients
- Ingredients have an array of categories they belong to

```typescript
interface Ingredient {
  id: string;
  name: string;
  categories: string[]; // e.g., ["emollient_alcohols"]
  synonyms?: string[];
  // ...other fields
}

interface Category {
  id: string;
  name: string;
  group: string; // e.g., "alcohols"
  // ...other fields
}
```

## Testing Ingredient Matches

When writing tests for ingredient matching:

1. Check the ingredient's categories array, not its group:

```typescript
// ❌ Wrong - checking group
expect(ingredientMatch?.ingredient?.group).toBe('emollient_alcohols');

// ✅ Correct - checking categories array
expect(ingredientMatch?.ingredient?.categories).toContain('emollient_alcohols');
```

2. The `category` in test expectations should match one of the ingredient's categories:

```typescript
const expectedResults = [
  {
    normalized: 'stearyl alcohol coconut derived',
    ingredientId: 'stearyl_alcohol',
    category: 'emollient_alcohols', // Should match a category in the ingredient
    status: 'ok',
    reason: undefined,
  },
];
```

## Common Gotchas

1. Groups vs Categories

   - An ingredient belongs to one or more categories (e.g., "emollient_alcohols")
   - Categories belong to a group (e.g., "alcohols")
   - Don't confuse the group name with the category name in tests

2. Testing Category Membership

   - Use `toContain()` instead of direct equality when checking categories
   - This allows for ingredients that belong to multiple categories

3. Database Structure
   - Always check the actual database entries when writing tests
   - Categories and groups are defined separately from ingredients
   - Ingredients reference categories, but not groups directly
