/**
 * Get the keys of the object in a way friendly to
 * the typescript compiler.
 * Taken from https://github.com/Microsoft/TypeScript/pull/12253#issuecomment-353494273
 * @param o The object to get the keys of.
 */
export function typed_keys<O>(o: O): Array<keyof O> {
  return Object.keys(o) as Array<keyof O>;
}
