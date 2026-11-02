import { Component, computed, input, linkedSignal } from '@angular/core';
import { Image } from 'primeng/image';
import { resolveImageSource } from './image-source';

const POKEAPI_SPRITES = 'https://raw.githubusercontent.com/PokeAPI/sprites/';

/** From this size up, pixel-art sprites are drawn with crisp pixels instead of being smoothed. */
const PIXELATED_FROM_PX = 96;

/**
 * A Pokémon's Image, falling back to the Placeholder image when it has none or it fails to load.
 * If the placeholder fails too, an icon is shown instead.
 */
@Component({
  selector: 'app-pokemon-image',
  imports: [Image],
  template: `
    @let current = source();
    @if (current.kind === 'unavailable') {
      <span class="pi pi-image unavailable" role="img" aria-label="Image unavailable"></span>
    } @else {
      <p-image
        [src]="current.url"
        [alt]="altText()"
        [width]="sizePx()"
        [height]="sizePx()"
        [imageStyle]="imageStyle()"
        [preview]="preview() && current.kind === 'image'"
        [pt]="{ mask: { 'aria-label': alt() }, original: { alt: alt() } }"
        (onImageError)="onError()"
      />
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
    }

    .unavailable {
      font-size: 1.5rem;
      color: var(--p-text-muted-color);
    }
  `,
  host: {
    class: 'pokemon-image',
    '[class.pokemon-image--sprite]': 'isSprite()',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
  },
})
export class PokemonImage {
  readonly imageUrl = input.required<string>();
  /** Describes the Pokémon's own image; the placeholder and the icon have fixed descriptions. */
  readonly alt = input.required<string>();
  readonly size = input(48);
  /** Lets the user open the Pokémon's own image enlarged. */
  readonly preview = input(false);

  /** URLs that failed to load; forgotten when the image changes. */
  private readonly failedUrls = linkedSignal<string, ReadonlySet<string>>({
    source: this.imageUrl,
    computation: () => new Set(),
  });

  protected readonly source = computed(() =>
    resolveImageSource(this.imageUrl(), this.failedUrls()),
  );

  protected readonly altText = computed(() => {
    const source = this.source();
    if (source.kind === 'image') {
      return this.alt();
    }
    return source.kind === 'placeholder' && source.reason === 'missing'
      ? 'No image'
      : 'Image unavailable';
  });

  protected readonly sizePx = computed(() => String(this.size()));

  protected readonly isSprite = computed(() => {
    const source = this.source();
    return source.kind !== 'unavailable' && source.url.startsWith(POKEAPI_SPRITES);
  });

  protected readonly imageStyle = computed(() => ({
    'object-fit': 'contain',
    'image-rendering': this.isSprite() && this.size() >= PIXELATED_FROM_PX ? 'pixelated' : 'auto',
  }));

  protected onError(): void {
    const source = this.source();
    if (source.kind !== 'unavailable') {
      this.failedUrls.update((failed) => new Set(failed).add(source.url));
    }
  }
}
