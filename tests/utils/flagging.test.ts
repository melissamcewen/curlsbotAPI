import type { AnalysisResult, Flag } from '../../src/types';
import { flag, processFlags } from '../../src/utils/flagging';
import { testSystems, testSettings, testDatabase } from '../fixtures/test_bundled_data';

describe('flagging', () => {
  describe('flag', () => {
    it('should flag ingredients in avoided categories', () => {
      const analysisResult: AnalysisResult = {
        uuid: '123',
        input: 'test input',
        normalized: ['test'],
        system: 'sulfate_free_system',
        status: 'pass',
        settings: [],
        matches: [
          {
            uuid: '456',
            input: 'sodium laureth sulfate',
            normalized: 'sodium_laureth_sulfate',
            categories: ['sulfates'],
            flags: [],
          },
        ],
        categories: ['sulfates'],
        groups: [],
        flags: [],
      };

      const result = flag(analysisResult, testSystems[0], testSettings, testDatabase);
      expect(result.status).toBe('fail');
      expect(result.matches[0].flags).toHaveLength(1);
      expect(result.matches[0].flags![0]).toEqual({
        type: 'category',
        flag_type: 'avoid',
        id: 'sulfates',
      });
      expect(result.flags).toHaveLength(1);
      expect(result.flags[0]).toEqual({
        type: 'category',
        flag_type: 'avoid',
        id: 'sulfates',
      });
    });

    it('should not flag ingredients not in avoided categories', () => {
      const analysisResult: AnalysisResult = {
        uuid: '123',
        input: 'test input',
        normalized: ['test'],
        system: 'sulfate_free_system',
        status: 'pass',
        settings: [],
        matches: [
          {
            uuid: '456',
            input: 'cetyl alcohol',
            normalized: 'cetyl_alcohol',
            categories: ['emollient_alcohols'],
            flags: [],
          },
        ],
        categories: ['emollient_alcohols'],
        groups: [],
        flags: [],
      };

      const result = flag(analysisResult, testSystems[0], testSettings, testDatabase);
      expect(result.status).toBe('pass');
      expect(result.matches[0].flags).toHaveLength(0);
      expect(result.flags).toHaveLength(0);
    });

    it('should handle avoid_others_in_group flag type', () => {
      const analysisResult: AnalysisResult = {
        uuid: '123',
        input: 'test input',
        normalized: ['test'],
        system: 'mild_detergents_system',
        status: 'pass',
        settings: [],
        matches: [
          {
            uuid: '456',
            input: 'sodium laureth sulfate',
            normalized: 'sodium_laureth_sulfate',
            categories: ['surfactants'],
            groups: ['detergents'],
            flags: [],
          },
          {
            uuid: '457',
            input: 'sodium cocoyl isethionate',
            normalized: 'sodium_cocoyl_isethionate',
            categories: ['mild_detergents'],
            groups: ['detergents'],
            flags: [],
          }
        ],
        categories: ['surfactants', 'mild_detergents'],
        groups: ['detergents'],
        flags: [],
      };

      const result = flag(analysisResult, testSystems[2], testSettings, testDatabase);
      expect(result.status).toBe('fail');
      // The non-mild detergent should be flagged
      expect(result.matches[0].flags).toHaveLength(1);
      expect(result.matches[0].flags![0].flag_type).toBe('avoid_others_in_group');
      // The mild detergent should not be flagged
      expect(result.matches[1].flags).toHaveLength(0);
    });

    it('should handle caution flag type', () => {
      const analysisResult: AnalysisResult = {
        uuid: '123',
        input: 'test input',
        normalized: ['test'],
        system: 'detergents_caution_system',
        status: 'pass',
        settings: [],
        matches: [
          {
            uuid: '456',
            input: 'sodium laureth sulfate',
            normalized: 'sodium_laureth_sulfate',
            categories: ['surfactants'],
            groups: ['detergents'],
            flags: [],
          },
        ],
        categories: ['surfactants'],
        groups: ['detergents'],
        flags: [],
      };

      const result = flag(analysisResult, testSystems[3], testSettings, testDatabase);
      expect(result.status).toBe('pass'); // Caution doesn't fail
      expect(result.matches[0].flags).toHaveLength(1);
      expect(result.matches[0].flags![0].flag_type).toBe('caution');
    });

    it('should always process ingredient-type flags', () => {
      const analysisResult: AnalysisResult = {
        uuid: '123',
        input: 'test input',
        normalized: ['test'],
        system: 'test_system',
        status: 'pass',
        settings: [],
        matches: [
          {
            uuid: '456',
            input: 'test ingredient',
            normalized: 'test_ingredient',
            flags: [],
          },
        ],
        categories: [],
        groups: [],
        flags: [],
      };

      const ingredientFlag: Flag = {
        type: 'ingredient',
        flag_type: 'avoid',
        id: 'test_ingredient'
      };

      // We can test this by checking if the flag gets added to the result
      // If shouldProcessFlag returns false, the flag wouldn't be added
      const result = processFlags([ingredientFlag], analysisResult, testDatabase);
      expect(result.flags).toHaveLength(1);
      expect(result.flags[0]).toEqual(ingredientFlag);
    });

    it('should handle avoid_others_in_group with non-preferred ingredient in same group', () => {
      const analysisResult: AnalysisResult = {
        uuid: '123',
        input: 'test input',
        normalized: ['test'],
        system: 'mild_detergents_system',
        status: 'pass',
        settings: [],
        matches: [
          {
            uuid: '456',
            input: 'sodium laureth sulfate',
            normalized: 'sodium_laureth_sulfate',
            categories: ['surfactants'],
            groups: ['detergents'],
            flags: [],
          }
        ],
        categories: ['surfactants'],
        groups: ['detergents'],
        flags: [],
      };

      const result = flag(analysisResult, testSystems[2], testSettings, testDatabase);
      expect(result.status).toBe('fail');
      expect(result.matches[0].flags).toHaveLength(1);
      expect(result.matches[0].flags![0]).toEqual({
        type: 'category',
        flag_type: 'avoid_others_in_group',
        id: 'mild_detergents'
      });
    });
  });
});
