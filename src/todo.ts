export function TODO(reason?: String): never {
  throw new Error(reason != null ? `Not implemented error: ${reason}` : "Not implemented error");
}
