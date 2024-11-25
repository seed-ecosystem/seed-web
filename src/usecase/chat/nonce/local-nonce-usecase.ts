
// Used for messages that are not sent to the server yet.
// They appear under all sent messages
export interface LocalNonceUsecase {
  incrementAndGet(): number;
}
