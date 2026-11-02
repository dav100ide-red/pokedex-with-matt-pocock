import {
  Component,
  ElementRef,
  OnInit,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AutoComplete } from 'primeng/autocomplete';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { FileUpload } from 'primeng/fileupload';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { MultiSelect } from 'primeng/multiselect';
import { Tag } from 'primeng/tag';
import { ToggleSwitch } from 'primeng/toggleswitch';
import type { AutoCompleteCompleteEvent } from 'primeng/types/autocomplete';
import type { FileSelectEvent } from 'primeng/types/fileupload';

import { POKEMON_MOVES, POKEMON_TYPES } from '../../data/pokemon.data';
import { Pokemon } from '../../data/pokemon.model';
import { PokemonService } from '../../data/pokemon.service';
import { fromCalendarDay, toCalendarDay } from '../../shared/calendar-day';
import { readFileAsDataUrl } from '../../shared/image/read-file-as-data-url';
import {
  MAX_LEVEL,
  MAX_TYPES,
  MIN_LEVEL,
  PokemonForm,
  PokemonFormField,
  createPokemonForm,
  errorMessage,
  suggestMoves,
  toPokemonDraft,
} from '../pokemon-form';
import { PokemonImage } from '../pokemon-image/pokemon-image';

const MAX_IMAGE_BYTES = 1024 * 1024;

const IMAGE_ERRORS = {
  tooLarge: 'This image is larger than 1 MB. Choose a smaller file.',
  wrongType: "This file type isn't supported. Choose a PNG, JPEG, GIF or WebP image.",
  unreadable: "This image couldn't be read. Try another file.",
};

const KNOWN_MOVES = new Set(POKEMON_MOVES);

/**
 * Creates or edits a Pokémon. One instance serves one opening of the dialog:
 * it opens when created and emits `closed` once it has hidden.
 */
@Component({
  selector: 'app-pokemon-form-dialog',
  imports: [
    ReactiveFormsModule,
    AutoComplete,
    Button,
    DatePicker,
    Dialog,
    FileUpload,
    InputNumber,
    InputText,
    Message,
    MultiSelect,
    Tag,
    ToggleSwitch,
    PokemonImage,
  ],
  templateUrl: './pokemon-form-dialog.html',
  styleUrl: './pokemon-form-dialog.scss',
})
export class PokemonFormDialog implements OnInit {
  /** The Pokémon to edit, or null for a new one. */
  readonly pokemon = input.required<Pokemon | null>();
  readonly closed = output<void>();

  private readonly pokemonService = inject(PokemonService);
  private readonly messageService = inject(MessageService);
  private readonly imageControls = viewChild.required<ElementRef<HTMLElement>>('imageControls');

  protected readonly types = POKEMON_TYPES;
  protected readonly maxTypes = MAX_TYPES;
  protected readonly minLevel = MIN_LEVEL;
  protected readonly maxLevel = MAX_LEVEL;
  protected readonly maxImageBytes = MAX_IMAGE_BYTES;
  /** The latest capture date the date picker offers. */
  protected readonly today = fromCalendarDay(toCalendarDay(new Date()));

  protected readonly visible = signal(true);
  protected readonly isNew = computed(() => this.pokemon() === null);
  protected readonly submitted = signal(false);
  protected readonly moveSuggestions = signal<string[]>([]);
  /** The image to save. Like the rest of the form, it's only stored on Save. */
  protected readonly imageUrl = linkedSignal(() => this.pokemon()?.imageUrl ?? '');
  protected readonly imageError = signal<string | null>(null);

  protected form!: PokemonForm;

  ngOnInit(): void {
    this.form = createPokemonForm(this.pokemon(), this.pokemonService.pokemons);
  }

  /** The error to show under a field, once it has been touched or the user has tried to save. */
  protected errorFor(field: PokemonFormField): string | null {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitted())
      ? errorMessage(field, control.errors)
      : null;
  }

  protected searchMoves(event: AutoCompleteCompleteEvent): void {
    this.moveSuggestions.set(
      suggestMoves(event.query, POKEMON_MOVES, this.form.controls.moves.value),
    );
  }

  protected isNewMove(move: string): boolean {
    return !KNOWN_MOVES.has(move);
  }

  protected async onImageSelect(event: FileSelectEvent, uploader: FileUpload): Promise<void> {
    // `currentFiles` holds the file only if it passed the type and size checks.
    const accepted: File | undefined = event.currentFiles[0];
    const chosen: File | undefined = event.files[0];
    // Drops PrimeNG's own error message and file list: errors are shown under the field instead.
    uploader.clear();

    if (!accepted) {
      this.imageError.set(
        chosen && chosen.size > MAX_IMAGE_BYTES ? IMAGE_ERRORS.tooLarge : IMAGE_ERRORS.wrongType,
      );
      return;
    }
    try {
      this.imageUrl.set(await readFileAsDataUrl(accepted));
      this.imageError.set(null);
    } catch {
      this.imageError.set(IMAGE_ERRORS.unreadable);
    }
  }

  protected removeImage(): void {
    this.imageUrl.set('');
    this.imageError.set(null);
    // The Remove button disappears, so move focus to the upload button.
    this.imageControls()
      .nativeElement.querySelector<HTMLElement>('.p-fileupload-choose-button')
      ?.focus();
  }

  protected save(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      return;
    }
    const draft = toPokemonDraft(this.form.getRawValue(), this.imageUrl());
    const pokemon = this.pokemon();
    if (pokemon) {
      this.pokemonService.update({ id: pokemon.id, ...draft });
      this.messageService.add({ severity: 'success', summary: `${draft.name} updated` });
    } else {
      this.pokemonService.create(draft);
      this.messageService.add({ severity: 'success', summary: `${draft.name} added` });
    }
    this.visible.set(false);
  }
}
