export interface EncryptedMessage {
  chatId: string;
  nonce: number;
  signature: string;
  content: string;
  contentIV: string;
}
