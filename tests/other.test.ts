import { describe, expect, it } from 'vitest'

import { Analyzer } from '../src/analyzer'
import { defaultDatabase, defaultSystems, defaultSettings } from '../src/data/bundledData'

describe('Other ingredient analysis', () => {
  const analyzer = new Analyzer({
    database: defaultDatabase,
    systems: defaultSystems,
    settings: defaultSettings
  })

  describe('Parabens', () => {
    it('should detect methylparaben as a paraben', () => {
      const result = analyzer.analyze('methylparaben', 'curly_default')
      const match = result.matches[0]
      expect(match.categories).toContain('parabens')
      expect(match.flags).toContain('parabens')
    })

    it('should detect propylparaben as a paraben', () => {
      const result = analyzer.analyze('propylparaben', 'curly_default')
      const match = result.matches[0]
      expect(match.categories).toContain('parabens')
      expect(match.flags).toContain('parabens')
    })

    it('should detect butylparaben as a paraben', () => {
      const result = analyzer.analyze('butylparaben', 'curly_default')
      const match = result.matches[0]
      expect(match.categories).toContain('parabens')
      expect(match.flags).toContain('parabens')
    })

    it('should flag parabens category when parabens are found', () => {
      const result = analyzer.analyze('methylparaben, propylparaben', 'curly_default')
      expect(result.flags.flaggedCategories).toContain('parabens')
    })
  })

  describe('Witch Hazel', () => {
    it('should detect witch hazel as an astringent', () => {
      const result = analyzer.analyze('witch hazel', 'curly_default')
      const match = result.matches[0]
      expect(match.categories).toContain('astringents')
      expect(match.flags).toContain('witch_hazel')
    })

    it('should detect witch hazel by synonym hamamelis', () => {
      const result = analyzer.analyze('hamamelis', 'curly_default')
      const match = result.matches[0]
      expect(match.categories).toContain('astringents')
      expect(match.flags).toContain('witch_hazel')
    })

    it('should flag astringents category when witch hazel is found', () => {
      const result = analyzer.analyze('witch hazel', 'curly_default')
      expect(result.flags.flaggedCategories).toContain('astringents')
    })
  })
})
