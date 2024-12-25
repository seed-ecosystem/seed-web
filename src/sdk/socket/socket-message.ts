export type SocketMessage = {
  type: "event",
  event: unknown
} | {
  type: "response",
  response: unknown
};
