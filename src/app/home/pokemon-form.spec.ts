import { describe, expect, it } from 'vitest';
import { Pokemon } from '../data/pokemon.model';
import {
  createPokemonForm,
  errorMessage,
  suggestMoves,
  toFormValue,
  toPokemonDraft,
} from './pokemon-form';

const bulbasaur: Pokemon = {
  id: 1,
  name: 'Bulbasaur',
  types: ['Grass', 'Poison'],
  level: 12,
  capturedAt: new Date('2025-01-14'),
  favorite: true,
  moves: ['Tackle', 'Vine Whip'],
  imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
};

const charmander: Pokemon = {
  id: 4,
  name: 'Charmander',
  types: ['Fire'],
  level: 9,
  capturedAt: new Date('2025-01-08'),
  favorite: false,
  moves: ['Scratch', 'Ember'],
  imageUrl: '',
};

const allPokemons = () => [bulbasaur, charmander];

describe('toFormValue', () => {
  it('starts a new Pokémon empty, captured today and not a favorite', () => {
    expect(toFormValue(null, new Date(2026, 10, 2, 15, 45))).toEqual({
      name: '',
      types: [],
      level: null,
      capturedAt: new Date(2026, 10, 2),
      favorite: false,
      moves: [],
    });
  });

  it('fills in an existing Pokémon, with its capture date as a local date', () => {
    expect(toFormValue(bulbasaur)).toEqual({
      name: 'Bulbasaur',
      types: ['Grass', 'Poison'],
      level: 12,
      capturedAt: new Date(2025, 0, 14),
      favorite: true,
      moves: ['Tackle', 'Vine Whip'],
    });
  });
});

describe('toPokemonDraft', () => {
  it('trims the text and stores the capture date as a calendar day', () => {
    const draft = toPokemonDraft(
      {
        name: '  Pikachu ',
        types: ['Electric'],
        level: 5,
        capturedAt: new Date(2026, 10, 2),
        favorite: true,
        moves: [' Thunder Shock ', 'Growl'],
      },
      '',
    );

    expect(draft).toEqual({
      name: 'Pikachu',
      types: ['Electric'],
      level: 5,
      capturedAt: new Date('2026-11-02'),
      favorite: true,
      moves: ['Thunder Shock', 'Growl'],
      imageUrl: '',
    });
  });
});

describe('the Pokémon form', () => {
  const newForm = () => createPokemonForm(null, allPokemons);

  it('accepts an existing Pokémon as it is', () => {
    expect(createPokemonForm(bulbasaur, allPokemons).valid).toBe(true);
  });

  it('rejects a blank name', () => {
    const { name } = newForm().controls;
    name.setValue('   ');

    expect(name.errors).toEqual({ required: true });
  });

  it('rejects a name another Pokémon has, ignoring case and spaces at either end', () => {
    const { name } = newForm().controls;
    name.setValue(' bulbasaur ');

    expect(name.errors).toEqual({ nameTaken: { name: 'Bulbasaur' } });
  });

  it("accepts a Pokémon's own name when editing it", () => {
    const { name } = createPokemonForm(bulbasaur, allPokemons).controls;
    name.setValue('BULBASAUR');

    expect(name.valid).toBe(true);
  });

  it('needs one or two types', () => {
    const { types } = newForm().controls;
    expect(types.valid).toBe(false);

    types.setValue(['Fire', 'Flying']);
    expect(types.valid).toBe(true);

    types.setValue(['Fire', 'Flying', 'Water']);
    expect(types.valid).toBe(false);
  });

  it('needs a whole level from 1 to 100', () => {
    const { level } = newForm().controls;

    for (const valid of [1, 100]) {
      level.setValue(valid);
      expect(level.valid).toBe(true);
    }
    for (const invalid of [null, 0, 101, 12.5]) {
      level.setValue(invalid);
      expect(level.valid).toBe(false);
    }
  });

  it('rejects a capture date after today', () => {
    const { capturedAt } = newForm().controls;
    expect(capturedAt.valid).toBe(true);

    capturedAt.setValue(new Date(2999, 0, 1));
    expect(capturedAt.errors).toEqual({ future: true });
  });

  it('needs one to four moves, each listed once ignoring case', () => {
    const { moves } = newForm().controls;
    expect(moves.valid).toBe(false);

    moves.setValue(['Tackle', 'Growl', 'Ember', 'Scratch']);
    expect(moves.valid).toBe(true);

    moves.setValue(['Tackle', 'Growl', 'Ember', 'Scratch', 'Bite']);
    expect(moves.valid).toBe(false);

    moves.setValue(['Tackle', 'tackle']);
    expect(moves.errors).toEqual({ duplicates: true });
  });
});

describe('errorMessage', () => {
  it('names the Pokémon that already has the name', () => {
    expect(errorMessage('name', { nameTaken: { name: 'Bulbasaur' } })).toBe(
      'A Pokémon named Bulbasaur already exists.',
    );
  });

  it('has no message for a field without errors', () => {
    expect(errorMessage('level', null)).toBeNull();
  });
});

describe('suggestMoves', () => {
  const knownMoves = ['Growl', 'Tackle', 'Thunder', 'Thunder Punch', 'Thunder Wave', 'Thunderbolt'];

  it('offers what was typed first, so Enter adds it', () => {
    expect(suggestMoves('Hyper Beam', knownMoves, [])).toEqual(['Hyper Beam']);
    expect(suggestMoves('Thun', knownMoves, [])).toEqual([
      'Thun',
      'Thunder',
      'Thunder Punch',
      'Thunder Wave',
      'Thunderbolt',
    ]);
  });

  it('offers a known move typed in another case first, with its usual spelling', () => {
    expect(suggestMoves('thunderbolt', knownMoves, [])).toEqual(['Thunderbolt']);
    expect(suggestMoves(' thunder ', knownMoves, [])).toEqual([
      'Thunder',
      'Thunder Punch',
      'Thunder Wave',
      'Thunderbolt',
    ]);
  });

  it('leaves out moves the Pokémon already knows, ignoring case', () => {
    expect(suggestMoves('thunder', knownMoves, ['Thunder'])).toEqual([
      'Thunder Punch',
      'Thunder Wave',
      'Thunderbolt',
    ]);
    expect(suggestMoves('hyper beam', knownMoves, ['Hyper Beam'])).toEqual([]);
  });

  it('suggests nothing for blank input', () => {
    expect(suggestMoves('  ', knownMoves, [])).toEqual([]);
  });
});
