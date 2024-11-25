
export function launch(block: () => Promise<void>): void {
  // noinspection JSIgnoredPromiseFromCall
  block();
}
