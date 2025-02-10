export interface ChatMessage {
  nonce: number;
  queueId: string;
  url: string;
  content: MessageContent;
}

export type MessageContent = {
  type: "regular";
  title: string;
  text: string;
} | {
  type: "unknown";
};
