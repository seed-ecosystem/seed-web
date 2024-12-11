export interface Chat {
  id: string;
  title: string;
  lastMessage: {
    title: string;
    text: string;
  };
}
