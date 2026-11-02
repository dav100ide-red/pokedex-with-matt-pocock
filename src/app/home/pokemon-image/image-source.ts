/** The Placeholder image: shown when a Pokémon has no Image, or its Image can't be loaded. */
export const PLACEHOLDER_IMAGE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

/** What to show for a Pokémon's Image. */
export type ImageSource =
  | { kind: 'image'; url: string }
  | { kind: 'placeholder'; url: string; reason: 'missing' | 'failed' }
  /** Even the placeholder failed to load (it's on the same host as the seed sprites). */
  | { kind: 'unavailable' };

/** Picks what to show for `imageUrl`, skipping the URLs that already failed to load. */
export function resolveImageSource(imageUrl: string, failedUrls: ReadonlySet<string>): ImageSource {
  if (imageUrl && !failedUrls.has(imageUrl)) {
    return { kind: 'image', url: imageUrl };
  }
  if (!failedUrls.has(PLACEHOLDER_IMAGE_URL)) {
    return {
      kind: 'placeholder',
      url: PLACEHOLDER_IMAGE_URL,
      reason: imageUrl ? 'failed' : 'missing',
    };
  }
  return { kind: 'unavailable' };
}
