import { expect, test } from "vitest";
import { createSeedClient, SeedClient } from "./seed-client";
import { randomAESKey } from "@/sdk/crypto/subtle-crypto";
import { encryptContent } from "@/sdk/crypto/encrypt-content";

test("seed-client-send", async () => {
  const client = connectClient();

  const chatId = await randomAESKey();

  const { content, contentIV, signature } = await encryptContent({
    content: "Random Stuff in Here",
    key: await randomAESKey(),
  });

  const result = await client.send(
    "wss://meetacy.app/seed-go",
    {
      nonce: 0,
      signature,
      content,
      contentIV,
      queueId: chatId,
    },
  );

  expect(result, "Message is not sent").toBe(true);
});

function connectClient(): SeedClient {
  const client = createSeedClient({
    engine: {
      mainUrl: "wss://meetacy.app/seed-kt",
    },
  });
  client.setForeground(true);
  client.addServer("wss://meetacy.app/seed-kt");
  client.addServer("wss://meetacy.app/seed-go");
  return client;
}

