export function TODO(reason?: string): never {
  throw new Error(reason != null ? `Not implemented error: ${reason}` : "Not implemented error");
}
