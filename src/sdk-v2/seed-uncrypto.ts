import { EncryptContentResult } from "./seed-crypto";

/**
  * This is only used when we do want [content] to be accessible
  * for the server. Primarily used for key exchange, where content
  * is encrypted using other's side public key.
  */
export function plainTextContent(content: string): EncryptContentResult {
  const contentIV = "AAAAAAAAAAAAAAAA";
  const signature = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

  return {
    content,
    contentIV,
    signature,
  };
}

