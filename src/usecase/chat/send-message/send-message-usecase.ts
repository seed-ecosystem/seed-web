export interface SendMessageUsecase {
  (
    options: {
      text: string;
      chatId: string;
    }
  ): Promise<boolean>;
}
