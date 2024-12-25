import {hmacSha256} from "@/sdk/crypto/subtle-crypto.ts";

export interface DeriveNextKeyOptions {
  key: string;
}

export function deriveNextKey({key}: DeriveNextKeyOptions): Promise<string> {
  return hmacSha256({
    data: "NEXT-KEY",
    key: key
  });
}
