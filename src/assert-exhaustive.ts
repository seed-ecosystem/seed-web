/**
 * Typescript doesn't have exhaustive switches.
 * This can help to emulate them
 */
export function assertExhaustive(x: never): never {
  throw new Error("Assert is not exhaustive");
}
