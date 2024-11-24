export interface Message {
  nonce: {
    server: number;
  } | {
    local: number; // message is loading
  };
  title: string;
  text: string;
  isAuthor: boolean;
  isSending: boolean; // might be true only if isAuthor is true
}
