import { describe, expect, it } from 'vitest';
import { PLACEHOLDER_IMAGE_URL, resolveImageSource } from './image-source';

describe('resolveImageSource', () => {
  const sprite = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png';
  const none = new Set<string>();

  it("shows the Pokémon's image", () => {
    expect(resolveImageSource(sprite, none)).toEqual({ kind: 'image', url: sprite });
  });

  it('shows the placeholder when the Pokémon has no image', () => {
    expect(resolveImageSource('', none)).toEqual({
      kind: 'placeholder',
      url: PLACEHOLDER_IMAGE_URL,
      reason: 'missing',
    });
  });

  it("shows the placeholder when the Pokémon's image failed to load", () => {
    expect(resolveImageSource(sprite, new Set([sprite]))).toEqual({
      kind: 'placeholder',
      url: PLACEHOLDER_IMAGE_URL,
      reason: 'failed',
    });
  });

  it('gives up when the placeholder failed to load too', () => {
    expect(resolveImageSource(sprite, new Set([sprite, PLACEHOLDER_IMAGE_URL]))).toEqual({
      kind: 'unavailable',
    });
    expect(resolveImageSource('', new Set([PLACEHOLDER_IMAGE_URL]))).toEqual({
      kind: 'unavailable',
    });
  });
});
