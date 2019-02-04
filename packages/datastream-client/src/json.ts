/**
 * Tries to parse a string as JSON and returns the original
 * value if it fails.
 */
export function tryParseJSON(value: string): string | object {
  if (typeof value !== 'string') {
    return value;
  }
  try {
    return JSON.parse(value);
    // tslint:disable-next-line: no-empty
  } catch {}
  return value;
}
