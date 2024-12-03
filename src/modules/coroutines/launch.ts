
export function launch(block: () => Promise<unknown>): void {
  // noinspection JSIgnoredPromiseFromCall
  block();
}
