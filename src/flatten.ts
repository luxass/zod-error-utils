/**
 * Flattens the error path into a string representation.
 * @param {(string | number)[]} errorPath - The error path to flatten.
 * @returns {string} The flattened error path as a string.
 */
export function flattenErrorPath(errorPath: (string | number)[]): string {
  return errorPath.join('.')
}
