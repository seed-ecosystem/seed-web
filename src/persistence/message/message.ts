export interface Message {
  nonce: number;
  signature: string;
  author: string;
  content: string;
  key: string;
}
