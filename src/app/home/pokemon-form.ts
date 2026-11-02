import { FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Pokemon } from '../data/pokemon.model';
import { fromCalendarDay, toCalendarDay } from '../shared/calendar-day';

export const MAX_TYPES = 2;
export const MAX_MOVES = 4;
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 100;

/** The form's value. The capture date is a local date, the way the date picker uses it. */
export interface PokemonFormValue {
  name: string;
  types: string[];
  level: number | null;
  capturedAt: Date | null;
  favorite: boolean;
  moves: string[];
}

export type PokemonFormField = keyof PokemonFormValue;

export type PokemonForm = FormGroup<{
  [Field in PokemonFormField]: FormControl<PokemonFormValue[Field]>;
}>;

/** The form for a new Pokémon (`null`) or an existing one. Names are checked against `allPokemons`. */
export function createPokemonForm(
  pokemon: Pokemon | null,
  allPokemons: () => readonly Pokemon[],
): PokemonForm {
  const value = toFormValue(pokemon);
  return new FormGroup({
    name: new FormControl(value.name, {
      nonNullable: true,
      validators: [requiredText, uniqueName(allPokemons, pokemon?.id ?? null)],
    }),
    types: new FormControl(value.types, {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(MAX_TYPES)],
    }),
    level: new FormControl(value.level, [
      Validators.required,
      Validators.min(MIN_LEVEL),
      Validators.max(MAX_LEVEL),
      Validators.pattern(/^\d+$/),
    ]),
    capturedAt: new FormControl(value.capturedAt, [Validators.required, notAfterToday()]),
    favorite: new FormControl(value.favorite, { nonNullable: true }),
    moves: new FormControl(value.moves, {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(MAX_MOVES), distinctIgnoringCase],
    }),
  });
}

/** The form value for a new Pokémon (`null`): captured today and not a favorite. Otherwise, the Pokémon's own values. */
export function toFormValue(pokemon: Pokemon | null, now = new Date()): PokemonFormValue {
  if (!pokemon) {
    return {
      name: '',
      types: [],
      level: null,
      capturedAt: fromCalendarDay(toCalendarDay(now)),
      favorite: false,
      moves: [],
    };
  }
  return {
    name: pokemon.name,
    types: [...pokemon.types],
    level: pokemon.level,
    capturedAt: fromCalendarDay(pokemon.capturedAt),
    favorite: pokemon.favorite,
    moves: [...pokemon.moves],
  };
}

/** The Pokémon to save, from a valid form value and its image (empty when it has none). */
export function toPokemonDraft(value: PokemonFormValue, imageUrl: string): Omit<Pokemon, 'id'> {
  if (value.level === null || value.capturedAt === null) {
    throw new Error('Only a valid form value can be saved.');
  }
  return {
    name: value.name.trim(),
    types: value.types,
    level: value.level,
    capturedAt: toCalendarDay(value.capturedAt),
    favorite: value.favorite,
    moves: value.moves.map((move) => move.trim()),
    imageUrl,
  };
}

/** The message for a field's errors, or null when it has none. */
export function errorMessage(
  field: PokemonFormField,
  errors: ValidationErrors | null,
): string | null {
  if (!errors) {
    return null;
  }
  switch (field) {
    case 'name':
      return errors['nameTaken']
        ? `A Pokémon named ${errors['nameTaken'].name} already exists.`
        : 'Name is required.';
    case 'types':
      return errors['required'] ? 'Choose at least one type.' : 'Choose at most two types.';
    case 'level':
      return errors['required']
        ? 'Level is required.'
        : `Level must be a whole number from ${MIN_LEVEL} to ${MAX_LEVEL}.`;
    case 'capturedAt':
      return errors['required']
        ? 'Capture date is required.'
        : "Capture date can't be in the future.";
    case 'moves':
      if (errors['required']) {
        return 'Add at least one move.';
      }
      return errors['maxlength']
        ? 'A Pokémon can know at most four moves.'
        : 'Each move can only be added once.';
    case 'favorite':
      return null;
  }
}

/**
 * Suggestions for the moves field. Any move can be typed, so the typed text comes first, where
 * Enter adds it. A known move typed in another case comes first instead, with its usual spelling.
 * Moves the Pokémon already knows are not suggested.
 */
export function suggestMoves(
  query: string,
  knownMoves: readonly string[],
  selected: readonly string[],
): string[] {
  const typed = query.trim();
  if (!typed) {
    return [];
  }
  const wanted = normalize(typed);
  const taken = new Set(selected.map(normalize));
  const matches = knownMoves.filter(
    (move) => normalize(move).includes(wanted) && !taken.has(normalize(move)),
  );
  const known = matches.find((move) => normalize(move) === wanted);
  if (known) {
    return [known, ...matches.filter((move) => move !== known)];
  }
  return taken.has(wanted) ? matches : [typed, ...matches];
}

/** Required, where text made only of spaces counts as empty. */
export const requiredText: ValidatorFn = (control) =>
  typeof control.value === 'string' && control.value.trim() ? null : { required: true };

/** No other Pokémon has this name, ignoring case and spaces at either end. */
export function uniqueName(
  allPokemons: () => readonly Pokemon[],
  ownId: number | null,
): ValidatorFn {
  return (control) => {
    const name = normalize(control.value);
    const clash = allPokemons().find(
      (other) => other.id !== ownId && normalize(other.name) === name,
    );
    return clash ? { nameTaken: { name: clash.name } } : null;
  };
}

/** The date is not later than today. */
export function notAfterToday(now: () => Date = () => new Date()): ValidatorFn {
  return (control) => {
    const date: unknown = control.value;
    return date instanceof Date &&
      toCalendarDay(date).getTime() > toCalendarDay(now()).getTime()
      ? { future: true }
      : null;
  };
}

/** No value is listed twice, ignoring case and spaces at either end. */
export const distinctIgnoringCase: ValidatorFn = (control) => {
  const values: string[] = control.value ?? [];
  return new Set(values.map(normalize)).size === values.length ? null : { duplicates: true };
};

function normalize(text: string): string {
  return text.trim().toLocaleLowerCase();
}
