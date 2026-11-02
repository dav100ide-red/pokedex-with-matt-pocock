/** Reads a file into a `data:` URL, so it can be kept without a backend. */
export function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('The file was not read as a data URL.'));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
