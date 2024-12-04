export interface Message {
  localNonce: number;
  content: MessageContent;
  loading: boolean;
  failure: boolean;
}

export type MessageContent = {
  type: "regular";
  author: boolean;
  title: string;
  text: string;
} | {
  type: "unknown";
};
