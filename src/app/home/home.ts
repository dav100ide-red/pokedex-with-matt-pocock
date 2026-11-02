import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PokemonService } from '../data/pokemon.service';

@Component({
  selector: 'app-home',
  imports: [JsonPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly pokemonService = inject(PokemonService);

  protected readonly pokemons = this.pokemonService.pokemons;
}
