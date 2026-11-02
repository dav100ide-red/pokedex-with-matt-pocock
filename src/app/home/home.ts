import { DatePipe } from '@angular/common';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { MultiSelect } from 'primeng/multiselect';
import { SelectButton } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Toolbar } from 'primeng/toolbar';
import { Tooltip } from 'primeng/tooltip';

import { POKEMON_TYPES } from '../data/pokemon.data';
import { Pokemon } from '../data/pokemon.model';
import { PokemonService } from '../data/pokemon.service';
import { MatchMode, matchesValues } from '../shared/filtering/match-values';
import { ThemeToggle } from '../theme/theme-toggle';
import { PokemonFormDialog } from './pokemon-form-dialog/pokemon-form-dialog';
import { PokemonImage } from './pokemon-image/pokemon-image';

@Component({
  selector: 'app-home',
  imports: [
    DatePipe,
    FormsModule,
    Button,
    MultiSelect,
    SelectButton,
    TableModule,
    Tag,
    Toolbar,
    Tooltip,
    PokemonFormDialog,
    PokemonImage,
    ThemeToggle,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly pokemonService = inject(PokemonService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  protected readonly types = POKEMON_TYPES;
  protected readonly matchModes: { label: string; value: MatchMode }[] = [
    { label: 'Any', value: 'any' },
    { label: 'All', value: 'all' },
  ];

  // The Type filter. The MultiSelect's clear button sets null, which the template turns into [].
  protected readonly selectedTypes = signal<string[]>([]);
  protected readonly typeMatchMode = signal<MatchMode>('any');

  /*
   * Filtered here rather than through PrimeNG's table filters: the table re-runs those, and jumps
   * back to page 1, whenever its data changes, which would happen on every save and delete.
   * filter() also gives the table a new array, which matters because the table sorts it in place.
   */
  protected readonly visiblePokemons = computed(() => {
    const types = this.selectedTypes();
    const mode = this.typeMatchMode();
    return this.pokemonService
      .pokemons()
      .filter((pokemon) => matchesValues(pokemon.types, types, mode));
  });

  /** Index of the table's first row; back to page 1 whenever the Type filter changes. */
  protected readonly first = linkedSignal({
    source: () => [this.selectedTypes(), this.typeMatchMode()],
    computation: () => 0,
  });

  /** What the form dialog is open for: a Pokémon to edit, 'new', or null when it's closed. */
  protected readonly formTarget = signal<Pokemon | 'new' | null>(null);

  protected confirmDelete(pokemon: Pokemon): void {
    this.confirmationService.confirm({
      header: 'Delete Pokémon',
      message: `Delete ${pokemon.name}? This can't be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      defaultFocus: 'reject',
      accept: () => {
        this.pokemonService.delete(pokemon.id);
        this.messageService.add({ severity: 'success', summary: `${pokemon.name} deleted` });
      },
    });
  }
}
