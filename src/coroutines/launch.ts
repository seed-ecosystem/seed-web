
export function launch(block: () => Promise<void>): void {
  return block();
}
