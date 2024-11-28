export interface SendMessageUsecase {
  (
    options: {
      text: string;
      chatId: string;
    }
  ): void;
}
