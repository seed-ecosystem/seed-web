export interface Chat {
  id: string;
  title: string;
  initialKey: string;
  initialNonce: number;
  lastMessageDate: Date;
  unreadCount: number;
  serverUrl: string;
}
