import {SocketRequest} from "@/modules/socket/request/socket-request.ts";

export interface BindRequest {
  type: string;
  prepare(): Promise<Omit<SocketRequest<unknown>, "type">>;
}
