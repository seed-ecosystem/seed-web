import {JsonEncoded} from "@/api/json/json-encoded.ts";

export interface SocketEventResponse {
  type: "response";
  response: JsonEncoded;
}
