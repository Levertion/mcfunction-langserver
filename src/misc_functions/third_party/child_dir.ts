import { sep } from "path";

/**
 * Calculates if a path is inside another path. Taken from:
 *
 * https://stackoverflow.com/a/42355848/8728461
 * @param child The child path
 * @param parent The parent path.
 */
export function isChildOf(
  child: string,
  parent: string,
  seperator: string = sep
): boolean {
  if (child === parent) {
    return false;
  }
  const parentTokens = parent.split(seperator).filter(i => i.length); // Has same effect as len>0
  const splitChild = child.split(seperator).filter(i => i.length);
  return parentTokens.every((t, i) => splitChild[i] === t);
}
