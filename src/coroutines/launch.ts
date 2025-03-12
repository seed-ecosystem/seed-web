export function launch(block: () => Promise<unknown>): void {
  void block();
}
