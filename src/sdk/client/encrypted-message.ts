export type EncryptedMessage = {
  nonce: number;
  signature: string;
  content: string;
  contentIV: string;
} & ({
  // todo: deprecate
  chatId: string;
} | {
  queueId: string;
})
