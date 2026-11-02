import { describe, expect, it } from 'vitest';
import { matchesValues } from './match-values';

describe('matchesValues', () => {
  const charmander = ['Fire'];
  const charizard = ['Fire', 'Flying'];
  const pidgey = ['Normal', 'Flying'];
  const bulbasaur = ['Grass', 'Poison'];

  it('matches everything when nothing is selected, in either mode', () => {
    expect(matchesValues(bulbasaur, [], 'any')).toBe(true);
    expect(matchesValues(bulbasaur, [], 'all')).toBe(true);
  });

  describe("in 'any' mode", () => {
    it('matches an item that has at least one selected value', () => {
      expect(matchesValues(charmander, ['Fire', 'Flying'], 'any')).toBe(true);
      expect(matchesValues(pidgey, ['Fire', 'Flying'], 'any')).toBe(true);
      expect(matchesValues(charizard, ['Fire', 'Flying'], 'any')).toBe(true);
    });

    it('rejects an item that has none of the selected values', () => {
      expect(matchesValues(bulbasaur, ['Fire', 'Flying'], 'any')).toBe(false);
    });
  });

  describe("in 'all' mode", () => {
    it('matches only an item that has every selected value', () => {
      expect(matchesValues(charizard, ['Fire', 'Flying'], 'all')).toBe(true);
      expect(matchesValues(charmander, ['Fire', 'Flying'], 'all')).toBe(false);
      expect(matchesValues(pidgey, ['Fire', 'Flying'], 'all')).toBe(false);
    });

    it('allows the item to have other values too', () => {
      expect(matchesValues(bulbasaur, ['Poison'], 'all')).toBe(true);
    });

    it('rejects an item with fewer values than are selected', () => {
      expect(matchesValues(charizard, ['Fire', 'Flying', 'Water'], 'all')).toBe(false);
    });
  });
});
