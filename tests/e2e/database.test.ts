import { getBundledDatabase } from '../../src/data/bundledData';
import type {
  Reference,
  Category,
  Group,
  Ingredient,
  IngredientDatabase,
} from '../../src/types';

describe('Reference Validation', () => {
  const database = getBundledDatabase();

  it('should have properly typed references for all ingredients', () => {
    const warnings: string[] = [];

    (Object.entries(database.ingredients) as [string, Ingredient][]).forEach(
      ([id, ingredient]) => {
        if (ingredient.references) {
          ingredient.references.forEach(
            (reference: Reference, index: number) => {
              // Check required url field
              if (!reference.url) {
                warnings.push(
                  `Ingredient "${ingredient.name}" (${id}) reference #${
                    index + 1
                  } is missing required 'url' field`,
                );
              }

              // Check that only allowed fields are present
              const allowedFields = [
                'url',
                'title',
                'description',
                'type',
                'status',
                'author',
                'date',
                'source',
              ];
              Object.keys(reference).forEach((field) => {
                if (!allowedFields.includes(field)) {
                  warnings.push(
                    `Ingredient "${ingredient.name}" (${id}) reference #${
                      index + 1
                    } has invalid field '${field}'`,
                  );
                }
              });

              // Check field types
              if (reference.url && typeof reference.url !== 'string') {
                warnings.push(
                  `Ingredient "${ingredient.name}" (${id}) reference #${
                    index + 1
                  } 'url' must be a string`,
                );
              }
              if (reference.title && typeof reference.title !== 'string') {
                warnings.push(
                  `Ingredient "${ingredient.name}" (${id}) reference #${
                    index + 1
                  } 'title' must be a string`,
                );
              }
              if (
                reference.description &&
                typeof reference.description !== 'string'
              ) {
                warnings.push(
                  `Ingredient "${ingredient.name}" (${id}) reference #${
                    index + 1
                  } 'description' must be a string`,
                );
              }
              if (reference.type && typeof reference.type !== 'string') {
                warnings.push(
                  `Ingredient "${ingredient.name}" (${id}) reference #${
                    index + 1
                  } 'type' must be a string`,
                );
              }
              if (reference.status && typeof reference.status !== 'string') {
                warnings.push(
                  `Ingredient "${ingredient.name}" (${id}) reference #${
                    index + 1
                  } 'status' must be a string`,
                );
              }
              if (reference.author && typeof reference.author !== 'string') {
                warnings.push(
                  `Ingredient "${ingredient.name}" (${id}) reference #${
                    index + 1
                  } 'author' must be a string`,
                );
              }
              if (reference.date && typeof reference.date !== 'string') {
                warnings.push(
                  `Ingredient "${ingredient.name}" (${id}) reference #${
                    index + 1
                  } 'date' must be a string`,
                );
              }
              if (reference.source && typeof reference.source !== 'string') {
                warnings.push(
                  `Ingredient "${ingredient.name}" (${id}) reference #${
                    index + 1
                  } 'source' must be a string`,
                );
              }

              // Check enum values
              if (
                reference.type &&
                !['science', 'hairpro', 'author', 'other', 'industry'].includes(
                  reference.type,
                )
              ) {
                warnings.push(
                  `Ingredient "${ingredient.name}" (${id}) reference #${
                    index + 1
                  } has invalid type '${reference.type}'`,
                );
              }
              if (
                reference.status &&
                !['ok', 'caution', 'warning', 'good'].includes(reference.status)
              ) {
                warnings.push(
                  `Ingredient "${ingredient.name}" (${id}) reference #${
                    index + 1
                  } has invalid status '${reference.status}'`,
                );
              }
            },
          );
        }
      },
    );

    expect(warnings).toEqual([]);
  });

  it('should have properly typed notes for all categories', () => {
    const warnings: string[] = [];

    (Object.entries(database.categories) as [string, Category][]).forEach(
      ([id, category]) => {
        if (category.notes) {
          category.notes.forEach((reference: Reference, index: number) => {
            // Check required url field
            if (!reference.url) {
              warnings.push(
                `Category "${category.name}" (${id}) note #${
                  index + 1
                } is missing required 'url' field`,
              );
            }

            // Check that only allowed fields are present
            const allowedFields = [
              'url',
              'title',
              'description',
              'type',
              'status',
              'author',
              'date',
              'source',
            ];
            Object.keys(reference).forEach((field) => {
              if (!allowedFields.includes(field)) {
                warnings.push(
                  `Category "${category.name}" (${id}) note #${
                    index + 1
                  } has invalid field '${field}'`,
                );
              }
            });

            // Check field types and enum values (same as ingredient references)
            if (
              reference.type &&
              !['science', 'hairpro', 'author', 'other', 'industry'].includes(
                reference.type,
              )
            ) {
              warnings.push(
                `Category "${category.name}" (${id}) note #${
                  index + 1
                } has invalid type '${reference.type}'`,
              );
            }
            if (
              reference.status &&
              !['ok', 'caution', 'warning', 'good'].includes(reference.status)
            ) {
              warnings.push(
                `Category "${category.name}" (${id}) note #${
                  index + 1
                } has invalid status '${reference.status}'`,
              );
            }
          });
        }
      },
    );

    expect(warnings).toEqual([]);
  });

  it('should have properly typed notes for all groups', () => {
    const warnings: string[] = [];

    (Object.entries(database.groups) as [string, Group][]).forEach(
      ([id, group]) => {
        if (group.notes) {
          group.notes.forEach((reference: Reference, index: number) => {
            // Check required url field
            if (!reference.url) {
              warnings.push(
                `Group "${group.name}" (${id}) note #${
                  index + 1
                } is missing required 'url' field`,
              );
            }

            // Check that only allowed fields are present
            const allowedFields = [
              'url',
              'title',
              'description',
              'type',
              'status',
              'author',
              'date',
              'source',
            ];
            Object.keys(reference).forEach((field) => {
              if (!allowedFields.includes(field)) {
                warnings.push(
                  `Group "${group.name}" (${id}) note #${
                    index + 1
                  } has invalid field '${field}'`,
                );
              }
            });

            // Check field types and enum values (same as ingredient references)
            if (
              reference.type &&
              !['science', 'hairpro', 'author', 'other', 'industry'].includes(
                reference.type,
              )
            ) {
              warnings.push(
                `Group "${group.name}" (${id}) note #${
                  index + 1
                } has invalid type '${reference.type}'`,
              );
            }
            if (
              reference.status &&
              !['ok', 'caution', 'warning', 'good'].includes(reference.status)
            ) {
              warnings.push(
                `Group "${group.name}" (${id}) note #${
                  index + 1
                } has invalid status '${reference.status}'`,
              );
            }
          });
        }
      },
    );

    expect(warnings).toEqual([]);
  });

  it('should not have references field in categories', () => {
    (Object.entries(database.categories) as [string, Category][]).forEach(
      ([_, category]) => {
        expect(category).not.toHaveProperty('references');
      },
    );
  });

  it('should not have references field in groups', () => {
    (Object.entries(database.groups) as [string, Group][]).forEach(
      ([_, group]) => {
        expect(group).not.toHaveProperty('references');
      },
    );
  });
});
