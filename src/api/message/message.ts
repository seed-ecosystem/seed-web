export interface Message {
  chatId: string;
  nonce: number;
  signature: string;
  content: string;
  contentIV: string;
}
