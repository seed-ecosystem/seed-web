export interface SendMessageUsecase {
  (
    options: {
      title: string;
      text: string;
      chatId: string;
    }
  ): Promise<boolean>;
}
