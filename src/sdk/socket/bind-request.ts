import {SocketRequest} from "@/sdk/socket/socket-request.ts";

export interface BindRequest {
  type: string;
  prepare(): Promise<Omit<SocketRequest<unknown>, "type">>;
}
