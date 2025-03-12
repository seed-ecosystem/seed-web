import { launch } from "@/coroutines/launch";
import { arrayBufferToBase64 } from "@/crypto/base-64";
import { encryptRSA4096, randomAESKey, randomRSA4096KeyPair } from "@/crypto/subtle";
import { createSeedClient } from "@/sdk-v2/seed-client";
import { encryptContent } from "@/sdk-v2/seed-crypto";
import { plainTextContent } from "@/sdk-v2/seed-uncrypto";
import { test } from "vitest";


test("share-chat", async () => {
  const { privateKey, publicKey } = await randomRSA4096KeyPair();
  const queueId = await randomAESKey();

  const serverKt = "wss://meetacy.app/seed-go";

  const sender = senderLogic(privateKey, publicKey, queueId, serverKt);
  const receiver = receiverLogic(publicKey, queueId, serverKt);

  await Promise.all([sender, receiver]);
});

async function senderLogic(
  privateKey: string,
  publicKey: string,
  queueId: string,
  serverUrl: string,
) {
  const client = connectClient(serverUrl);
  client.subscribe(serverUrl, { queueId, nonce: 0 });
  const response = await new Promise((resolve) => {
    const cancel = client.events.subscribe(event => {
      if (event.type !== "new") return;
      if (event.url !== serverUrl) return;
      resolve(event.message.content);
      cancel();
    });
  });
  console.log(`doo: ${response}`);
}

async function receiverLogic(
  publicKey: string,
  queueId: string,
  serverUrl: string,
) {
  const client = connectClient(serverUrl);

  const {
    privateKey: receiverPrivateKey,
    publicKey: receiverPublicKey,
  } = await randomRSA4096KeyPair();

  console.log(receiverPublicKey);

  // FIXME: data is too big
  const encryptedPublicKey = await encryptRSA4096({
    publicKey,
    data: receiverPublicKey,
  });

  const content = plainTextContent(encryptedPublicKey);

  await client.send(serverUrl, {
    nonce: 0,
    queueId,
    ...content,
  });
}

function connectClient(url: string) {
  const client = createSeedClient({
    engine: {
      mainUrl: url,
    },
  });
  client.setForeground(true);
  return client;
}

