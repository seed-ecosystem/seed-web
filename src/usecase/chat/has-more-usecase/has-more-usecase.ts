export interface HasMoreUsecase {
  (onHasNoMore: () => void): void;
  setHasNoMore(): void;
}
