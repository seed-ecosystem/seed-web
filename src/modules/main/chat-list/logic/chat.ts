export interface Chat {
  id: string;
  title: string;
  unreadCount: number;
  lastMessage?: {
    title: string;
    text: string;
  };
}

export interface UiChat extends Chat {
  isActive: boolean;
}
