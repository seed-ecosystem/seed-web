import {JsonEncoded} from "@/api/json/json-encoded.ts";

export interface SocketMessageResponse {
  type: "response";
  response: JsonEncoded;
}
