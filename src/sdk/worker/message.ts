export interface Message {
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
