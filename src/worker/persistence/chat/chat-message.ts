export interface ChatMessage {
  nonce: number;
  chatId: string;
  content: MessageContent
}

export type MessageContent = {
  type: "regular";
  title: string;
  text: string;
} | {
  type: "unknown";
};
