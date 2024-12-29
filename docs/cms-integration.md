# CMS Integration Strategy

## Overview

This document outlines our hybrid approach to managing ingredient data using both a CMS (Content Management System) and code-based data. This strategy optimizes for both content management and performance.

## Data Split

### CMS-Managed Data

Content that benefits from an admin UI and content management workflows:

- Ingredient metadata
  - Descriptions
  - References
  - Status (ok/caution/warning)
  - Categories
- Category information
  - Names
  - Descriptions
  - Group associations
- Group definitions
  - Names
  - Descriptions
- Product data
  - Names
  - Brands
  - Ingredient lists
  - URLs
  - Pricing

### Code-Managed Data

Performance-critical data needed for ingredient analysis:

- Matching patterns
- Normalization rules
- Synonyms
- Analysis logic
- Performance-optimized lookup tables

## Implementation Guide

### 1. CMS Setup (Payload)

#### Collections Structure

```typescript
// Ingredient Collection
{
  name: 'ingredients',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    {
      name: 'status',
      type: 'select',
      options: ['ok', 'caution', 'warning'],
      required: true,
    },
    {
      name: 'references',
      type: 'array',
      fields: [
        {
          name: 'url',
          type: 'text',
        },
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'type',
          type: 'select',
          options: ['science', 'hairpro', 'author', 'industry', 'other'],
        },
      ],
    },
  ],
}
```

### 2. Build Process Integration

1. Create a build script that:
   - Fetches data from CMS
   - Combines it with code-based matching data
   - Generates bundled data files

Example:

```typescript
async function generateBundledData() {
  // Fetch from CMS
  const cmsData = await fetchFromCMS();

  // Load code-based data
  const matchingData = loadMatchingData();

  // Combine data
  const combinedData = {
    ingredients: mergeCMSAndCodeData(cmsData.ingredients, matchingData),
    categories: cmsData.categories,
    groups: cmsData.groups,
  };

  // Generate bundle
  generateBundle(combinedData);
}
```

### 3. Development Workflow

1. Content Updates:

   - Edit through CMS interface
   - Changes tracked in CMS
   - Build process pulls latest content

2. Matching Logic Updates:
   - Edit in code repository
   - Version controlled with code
   - Changes reviewed through PRs

### 4. Deployment Strategy

1. CMS Deployment:

   - Host Payload CMS separately
   - Set up proper authentication
   - Configure CORS for API access

2. Build Process:
   - Run as part of CI/CD pipeline
   - Generate new bundles on content updates
   - Deploy updated bundles with code releases

### 5. Local Development

For local development, provide two options:

1. Connected Mode:

   ```bash
   npm run dev:cms  # Uses live CMS data
   ```

2. Offline Mode:
   ```bash
   npm run dev      # Uses local JSON files
   ```

## Migration Path

1. Initial Setup:

   - Set up Payload CMS
   - Create collections matching current data structure
   - Implement authentication

2. Data Migration:

   - Script to migrate current JSON data to CMS
   - Verify data integrity
   - Keep JSON files as backup

3. Build Process Update:

   - Modify bundleData.ts to pull from CMS
   - Add fallback to JSON files
   - Test bundle generation

4. Testing:
   - Verify analyzer performance
   - Test content updates
   - Validate build process

## Considerations

### Performance

- Cache CMS data during builds
- Keep matching logic in-memory
- Monitor build times

### Security

- Implement proper CMS authentication
- Secure API endpoints
- Regular backups

### Maintenance

- Document CMS schema changes
- Version control build scripts
- Monitor CMS updates

## Future Enhancements

1. Real-time Updates:

   - WebSocket notifications for content changes
   - Automatic bundle regeneration

2. Preview Environment:

   - Test content changes before production
   - Staging environment for content

3. Analytics:
   - Track content updates
   - Monitor performance metrics
   - Usage statistics
