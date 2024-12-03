import {JsonEncoded} from "@/modules/socket/json/json-encoded.ts";

export interface SocketMessageResponse {
  type: "response";
  response: JsonEncoded;
}
