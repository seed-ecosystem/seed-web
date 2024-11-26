export interface GetMessageKeyUsecase {
  (nonce: number): Promise<string | undefined>;
}
