import {SocketRequest} from "@/sdk/socket/socket-request.ts";
import {EncryptedMessageRequest} from "@/sdk/client/encrypted-message-response.ts";

export interface SendMessageRequest extends SocketRequest<SendMessageResponse> {
  type: "send";
  message: EncryptedMessageRequest;
}

export interface SendMessageResponse {
  // Can be false in case of a race condition
  // if messageId was simultaneously generated on
  // two clients and one of them made a faster request.
  // In case if status is false, you should resend message-content
  // providing messageId from the last received message-content
  status: boolean;
}
