import { describe, expect, it } from 'vitest'

import { Analyzer } from '../src/analyzer'
import { defaultDatabase, defaultSystems, defaultSettings } from '../src/data/bundledData'

describe('Sulfates ingredient analysis', () => {
  const analyzer = new Analyzer({
    database: defaultDatabase,
    systems: defaultSystems,
    settings: defaultSettings
  })

  describe('Bad sulfates', () => {
    it('should detect sodium laureth sulfate as a sulfate', () => {
      const result = analyzer.analyze('Sodium Laureth Sulfate', 'curly_default')
      const match = result.matches[0]
      // expect the ingredient to be sodium laureth sulfate
      expect(match.ingredient?.name).toBe('Sodium Laureth Sulfate')
      expect(match.categories).toContain('sulfates')
      expect(match.flags).toContain('sulfates')
    })

    it('should flag sulfates category when sulfates are found', () => {
      const result = analyzer.analyze('Sodium Laureth Sulfate', 'curly_default')
      expect(result.flags.flaggedCategories).toContain('sulfates')
    })
  })

  describe('Mild detergents', () => {
    it('should detect cocamidopropyl betaine as a mild detergent', () => {
      const result = analyzer.analyze('Cocamidopropyl Betaine', 'curly_default')
      const match = result.matches[0]
      expect(match.categories).toContain('mild_detergents')
      expect(match.flags).not.toContain('sulfates')
    })

    it('should detect sodium cocoyl isethionate as a mild detergent', () => {
      const result = analyzer.analyze('Sodium Cocoyl Isethionate', 'curly_default')
      const match = result.matches[0]
      expect(match.categories).toContain('mild_detergents')
      expect(match.flags).not.toContain('sulfates')
    })

    it('should not flag sulfates category for mild detergents', () => {
      const result = analyzer.analyze('Cocamidopropyl Betaine, Sodium Cocoyl Isethionate', 'curly_default')
      expect(result.flags.flaggedCategories).not.toContain('sulfates')
    })
  })

  describe('Misspelled sulfates', () => {
    it('should detect misspelled sodium laureth sulfate', () => {
      const result = analyzer.analyze('Sodium Laureth Sulfuate', 'curly_default')
      const match = result.matches[0]
      expect(match.normalized).toBe('sodium laureth sulfuate')
      expect(match.ingredient?.name).toBe('Sodium Laureth Sulfate')
    })

    it('should still detect mild detergents when sulfates are misspelled', () => {
      const result = analyzer.analyze('Sodium Laureth Sulfuate, Cocamidopropyl Betaine', 'curly_default')
      const mildMatch = result.matches.find(m => m.normalized === 'cocamidopropyl betaine')
      expect(mildMatch?.categories).toContain('mild_detergents')
      expect(mildMatch?.flags).not.toContain('sulfates')
    })
  })

  describe('Sulfonates', () => {
    it('should detect sodium c14-16 olefin sulfonate', () => {
      const result = analyzer.analyze('Sodium c14-16 olefin sulfonate', 'curly_default')
      const match = result.matches[0]
      expect(match.categories).toContain('sulfonates')
      expect(match.flags).toContain('sulfonates')
    })

    it('should flag sulfonates category', () => {
      const result = analyzer.analyze('Sodium c14-16 olefin sulfonate', 'curly_default')
      expect(result.flags.flaggedCategories).toContain('sulfonates')
    })
  })
})
