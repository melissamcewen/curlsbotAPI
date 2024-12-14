import { describe, expect, it } from 'vitest'
import { join } from 'path'

import { Analyzer } from '../../src/analyzer'
import type { AnalysisResult } from '../../src/types'

describe('Alcohol ingredient analysis', () => {
  const analyzer = new Analyzer({
    configDir: join(__dirname, '../../src/config'),
    dataDir: join(__dirname, '../../src/data')
  })

  it('should detect drying alcohols', () => {
    const list = "Isobutane, Propane, SD Alcohol 40-B (Alcohol Denat.), Aluminum Starch Octenylsuccinate, Citrus Grandis (Grapefruit) Fruit Extract*, Citrus Tangerina (Tangerine) Peel Extract*, Butane, Isopropyl Myristate, Silica, Fragrance, Amyl Cinnamal, Benzyl Alcohol, Butylphenyl Methylpropional, Citronellol, Geraniol, Hexyl Cinnamal, Limonene, Linalool., denatured alcohol (sd alcohol 40)"

    const result = analyzer.analyze(list, 'curly_default')

    // Check for bad alcohols
    const dryingAlcohols = result.matches.filter(match =>
      match.flags.includes('drying_alcohols')
    )
    console.log('Drying alcohols:', dryingAlcohols)
    expect(dryingAlcohols).toHaveLength(3) // alcohol denat, denatured alcohol (sd alcohol 40), sd alcohol 40-b (alcohol denat)

    // Check for good alcohols
    expect(result.matches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          input: 'benzyl alcohol',
          normalized: 'benzyl alcohol',
          flags: expect.not.arrayContaining(['drying_alcohols'])
        })
      ])
    )
  })

  it('should allow OK alcohols', () => {
    const list = "Water (Aqua), Cetearyl Alcohol, PPG-3 Benzyl Ether Ethylhexanoate, Quaternium-91, Glycerin, Distearyldimonium Chloride, Polyquaternium-72, Mangifera Indica (Mango) Seed Butter, Gardenia Taitensis Flower Extract, Behentrimonium Chloride, Myristyl Myristate, Hydroxyethylcellulose, Fragrance (Parfum), Phenoxyethanol, Ethylhexylglycerin., Triisopropanolamine"

    const result = analyzer.analyze(list, 'curly_default')

    // Check for good alcohols
    expect(result.matches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          input: 'cetearyl alcohol',
          normalized: 'cetearyl alcohol',
          flags: expect.not.arrayContaining(['drying_alcohols'])
        })
      ])
    )

    // Verify no drying alcohols
    const dryingAlcohols = result.matches.filter(match =>
      match.flags.includes('drying_alcohols')
    )
    expect(dryingAlcohols).toHaveLength(0)
  })

  it('should detect weird variations of alcohols', () => {
    const list = "alcohol denat., alcohol, denatured alcohol (sd alcohol 40), sd alcohol 40-b (alcohol denat), hello alcohol, Steareth Alcohol-15, denatured alcohol (sd alcohol 40), lauryl alcohol diphosphonic acid, benzyl alcohol benzyl benzoate"

    const result = analyzer.analyze(list, 'curly_default')

    // Check for bad alcohols
    const dryingAlcohols = result.matches.filter(match =>
      match.flags.includes('drying_alcohols')
    )
    console.log('Drying alcohols:', dryingAlcohols)
    expect(dryingAlcohols).toHaveLength(4) // alcohol denat, alcohol, denatured alcohol, sd alcohol 40

    // Check for good alcohols
    const goodAlcohols = ['steareth alcohol-15', 'lauryl alcohol diphosphonic acid', 'benzyl alcohol benzyl benzoate']
    goodAlcohols.forEach(alcohol => {
      expect(result.matches).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            input: alcohol,
            normalized: alcohol,
            flags: expect.not.arrayContaining(['drying_alcohols'])
          })
        ])
      )
    })

    // Check for unknown alcohols
    const unknownMatch = result.matches.find(match => match.input === 'hello alcohol')
    expect(unknownMatch).toBeDefined()
    expect(unknownMatch).toEqual(
      expect.objectContaining({
        input: 'hello alcohol',
        normalized: 'hello alcohol',
        categories: expect.any(Array),
        groups: expect.any(Array),
        flags: expect.any(Array)
      })
    )
  })
})
