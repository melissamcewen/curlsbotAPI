import { describe, expect, it } from 'vitest'

import { Analyzer } from '../src/analyzer'
import { defaultDatabase, defaultSystems, defaultSettings } from '../src/data/bundledData'

describe('Settings analysis', () => {
  it('handles mild_detergents_only setting correctly', () => {
    const analyzer = new Analyzer({
      database: defaultDatabase,
      systems: defaultSystems,
      settings: defaultSettings
    })

    // Test with a harsh surfactant - should be flagged
    const resultHarsh = analyzer.analyze('Sodium Laureth Sulfate', 'curly_default')
    const harshMatch = resultHarsh.matches[0]
    expect(harshMatch.categories).toContain('sulfates')
    expect(harshMatch.flags).toContain('sulfates')

    // Test with a mild surfactant - should not be flagged
    const resultMild = analyzer.analyze('Cocamidopropyl Betaine', 'curly_default')
    const mildMatch = resultMild.matches[0]
    expect(mildMatch.categories).toContain('mild_detergents')
    expect(mildMatch.flags).not.toContain('mild_detergents_only')

    // Test with a non-surfactant - should not be flagged
    const resultNonSurfactant = analyzer.analyze('Glycerin', 'curly_default')
    expect(resultNonSurfactant.matches[0].flags).not.toContain('mild_detergents_only')
  })

  it('mild_detergents_only setting only affects surfactants', () => {
    const analyzer = new Analyzer({
      database: defaultDatabase,
      systems: defaultSystems,
      settings: defaultSettings
    })

    // Test with a non-surfactant ingredient
    const result = analyzer.analyze('Dimethicone', 'curly_default')
    expect(result.matches[0].flags).not.toContain('mild_detergents_only')
  })
})
