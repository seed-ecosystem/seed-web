export interface SendMessageUsecase {
  (
    text: string,
    previousMessageId: string | null,
    chatId: string,
  ): Promise<void>;
}
