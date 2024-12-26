# Partial Ingredient Matching

## Overview

The ingredient matching system uses a multi-step approach to find the best match for an ingredient name:

1. First tries exact matches
2. If no exact match is found, tries partial matches
3. Falls back to default ingredients if no matches are found

## Partial Matching Logic

When doing partial matches, the system:

1. Collects all possible matches rather than returning the first match
2. Calculates a "coverage" score for each match (how much of the search term the match covers)
3. Sorts matches by coverage and term length to find the best match

```typescript
// Example: Searching for "stearyl alcohol coconut derived"
const partialMatches: {
  ingredient: Ingredient;
  term: string;
  coverage: number;
}[] = [];

// For each potential match, calculate coverage
const coverage = normalizedTerm.length / normalizedSearchTermSpaces.length;
partialMatches.push({ ingredient, term: normalizedTerm, coverage });

// Sort matches to find the best one
const bestMatch = partialMatches.sort((a, b) => {
  // First compare by coverage
  const coverageDiff = b.coverage - a.coverage;
  if (coverageDiff !== 0) return coverageDiff;
  // If coverage is the same, prefer longer terms
  return b.term.length - a.term.length;
})[0];
```

## Why This Approach?

This approach solves several problems:

1. **Substring Matching**: Previously, shorter substrings would match first. For example, searching for "stearyl alcohol coconut derived" would match "alcohol" from "sd_alcohol" because it was checked first.

2. **Match Quality**: By calculating coverage (match length / search term length), we prefer matches that cover more of the search term. This helps find the most specific match.

3. **Tie Breaking**: When matches have the same coverage, we prefer longer terms. This helps choose between similar matches like "stearyl alcohol" vs just "alcohol".

## Example

Given the search term "stearyl alcohol coconut derived":

```typescript
// These would be the coverage scores:
"alcohol" -> coverage = 7/31 ≈ 0.23
"stearyl alcohol" -> coverage = 14/31 ≈ 0.45

// The system chooses "stearyl alcohol" because:
// 1. It has higher coverage (0.45 > 0.23)
// 2. Even if coverage was equal, it's longer (14 > 7)
```

## Implementation Details

1. Normalize spaces in both terms before comparing
2. Filter out "unknown" terms before matching
3. Sort terms by length before attempting matches
4. Calculate coverage for all possible matches
5. Sort by coverage first, then by term length
6. Return the best match found
