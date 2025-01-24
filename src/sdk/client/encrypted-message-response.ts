export type EncryptedMessageResponse = {
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

export type EncryptedMessageRequest = {
  nonce: number;
  signature: string;
  content: string;
  contentIV: string;
  chatId: string;
  queueId: string;
}
