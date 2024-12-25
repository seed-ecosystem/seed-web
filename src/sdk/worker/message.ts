export interface Message {
  key: string;
  chatId: string;
  nonce: number;
  content: MessageContent;
}

export type MessageContent = {
  type: "regular";
  title: string;
  text: string;
} | {
  type: "unknown";
};
