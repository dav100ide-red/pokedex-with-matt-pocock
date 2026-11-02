import { describe, expect, it } from 'vitest';
import { readFileAsDataUrl } from './read-file-as-data-url';

describe('readFileAsDataUrl', () => {
  it('reads a file into a data URL with its type and base64 content', async () => {
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });

    await expect(readFileAsDataUrl(file)).resolves.toBe('data:image/png;base64,aGVsbG8=');
  });
});
