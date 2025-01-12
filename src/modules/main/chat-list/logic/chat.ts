export interface Chat {
  id: string;
  title: string;
  isActive?: boolean;
  lastMessage?: {
    title: string;
    text: string;
  };
}
