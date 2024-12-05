export interface Category {
  name: string;
  description: string;
  impact: 'good' | 'caution' | 'bad';
  notes?: string;
  source?: string[];
}

export interface CategoryGroup {
  name: string;
  description: string;
  categories: Record<string, Category>;
}

export type CategoryGroups = Record<string, CategoryGroup>;