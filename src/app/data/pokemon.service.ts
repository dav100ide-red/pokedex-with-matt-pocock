import { Injectable, signal } from '@angular/core';
import { POKEMONS } from './pokemon.data';
import { Pokemon } from './pokemon.model';

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly state = signal<Pokemon[]>(POKEMONS);

  readonly pokemons = this.state.asReadonly();

  getById(id: number): Pokemon | undefined {
    return this.state().find((pokemon) => pokemon.id === id);
  }

  create(pokemon: Omit<Pokemon, 'id'>): Pokemon {
    const id = Math.max(0, ...this.state().map((current) => current.id)) + 1;
    const created: Pokemon = { ...pokemon, id };
    this.state.update((pokemons) => [...pokemons, created]);
    return created;
  }

  update(pokemon: Pokemon): void {
    this.state.update((pokemons) =>
      pokemons.map((current) => (current.id === pokemon.id ? pokemon : current)),
    );
  }

  delete(id: number): void {
    this.state.update((pokemons) => pokemons.filter((pokemon) => pokemon.id !== id));
  }
}
