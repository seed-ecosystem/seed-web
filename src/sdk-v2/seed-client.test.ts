import { expect, test } from "vitest";
import { createSeedClient, SeedClient } from "./seed-client";
import { randomAESKey } from "@/sdk/crypto/subtle-crypto";
import { encryptContent } from "@/sdk/crypto/encrypt-content";

test("seed-reconnect", async () => {
  const client = connectClient();
  await new Promise(resolve => setTimeout(resolve, 4_000));
});

test("seed-subscribe", async () => {
  const client = connectClient();
  client.subscribe(
    "wss://meetacy.app/seed-go",
    {
      queueId: await randomAESKey(),
      nonce: 0,
    },
  );
  await new Promise(resolve => setTimeout(resolve, 4_000));
});

test("seed-client-send", async () => {
  const client = connectClient();

  const chatId = await randomAESKey();

  const { content, contentIV, signature } = await encryptContent({
    content: "Random Stuff in Here",
    key: await randomAESKey(),
  });

  await new Promise(resolve => setTimeout(resolve, 2_000));

  console.log("After timeout");

  const goResult = await client.send(
    "wss://meetacy.app/seed-go",
    {
      nonce: 0,
      signature,
      content,
      contentIV,
      queueId: chatId,
    },
  );

  const ktResult = await client.send(
    "wss://meetacy.app/seed-kt",
    {
      nonce: 0,
      signature,
      content,
      contentIV,
      queueId: chatId,
    },
  );

  expect(goResult, "Message is not sent").toBe(true);
  expect(ktResult, "Message is not sent").toBe(true);
});

test("subscribe-send-combination", async () => {
  const client = connectClient();

  const chatId = await randomAESKey();

  const { content, contentIV, signature } = await encryptContent({
    content: "Random Stuff in Here",
    key: await randomAESKey(),
  });


  client.subscribe("wss://meetacy.app/seed-kt", {
    queueId: chatId, nonce: 0,
  });

  const promise = new Promise<void>(resolve => {
    const cancel = client.events.subscribe(event => {
      if (event.type !== "new") return;
      resolve();
      cancel();
    });
  });

  await client.send("wss://meetacy.app/seed-kt", {
    nonce: 0,
    signature,
    content,
    contentIV,
    queueId: chatId,
  });

  await promise;
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

