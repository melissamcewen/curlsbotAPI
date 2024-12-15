import { describe, expect, it } from 'vitest'

import { Analyzer } from '../src/analyzer'

describe('Settings analysis', () => {
  it('handles mild_detergents_only setting correctly', () => {
    const analyzer = new Analyzer()

    // Test with a harsh surfactant - should be flagged
    const resultHarsh = analyzer.analyze('Sodium Laureth Sulfate', 'curly_default')
    expect(resultHarsh.matches[0].flags).toContain('mild_detergents_only')

    // Test with a mild surfactant - should not be flagged
    const resultMild = analyzer.analyze('Cocamidopropyl Betaine', 'curly_default')
    expect(resultMild.matches[0].flags).not.toContain('mild_detergents_only')

    // Test with a non-surfactant - should not be flagged
    const resultNonSurfactant = analyzer.analyze('Glycerin', 'curly_default')
    expect(resultNonSurfactant.matches[0].flags).not.toContain('mild_detergents_only')

    // Test with multiple ingredients
    const resultMixed = analyzer.analyze('Sodium Laureth Sulfate, Cocamidopropyl Betaine, Glycerin', 'curly_default')
    expect(resultMixed.matches[0].flags).toContain('mild_detergents_only') // SLES should be flagged
    expect(resultMixed.matches[1].flags).not.toContain('mild_detergents_only') // CAPB should not be flagged
    expect(resultMixed.matches[2].flags).not.toContain('mild_detergents_only') // Glycerin should not be flagged
  })

  it('mild_detergents_only setting only affects surfactants', () => {
    const analyzer = new Analyzer()

    // Test with a non-surfactant ingredient
    const result = analyzer.analyze('Dimethicone', 'curly_default')
    expect(result.matches[0].flags).not.toContain('mild_detergents_only')
  })
})
