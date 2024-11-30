import {describe, expect, it} from "vitest";
import {createPersistence} from "@/persistence/create-persistence.ts";
import {Message} from "@/persistence/message/message.ts";
import {randomAESKey} from "@/crypto/subtle-crypto.ts";
import {createMessageCoder} from "@/crypto/create-message-coder.ts";

describe('persistence checks', () => {
  it('check can add messages', async () => {
    const storage = await createPersistence();
    const key = await randomAESKey();

    const chatId = await randomAESKey();

    const message: Message = {
      key,
      chatId: chatId,
      nonce: 0,
      content: {
        type: "regular",
        text: "Hello world!",
        title: "Alex Sokol!",
      }
    };

    await storage.message.add(message);

    const result = await storage.message.list({ chatId: chatId });

    expect(result[0]).toStrictEqual(message);
  });

  it('check last message', async () => {
    const storage = await createPersistence();
    const key = await randomAESKey();

    const chat = { chatId: await randomAESKey() };

    expect(await storage.message.lastMessageNonce(chat)).toStrictEqual(undefined);

    async function getMessage(): Promise<Message> {
      const message = await storage.message.lastMessageNonce(chat);

      let nonce

      if (message == null) {
        nonce = 0
      } else {
        nonce = message + 1;
      }

      return {
        ...chat,
        key,
        nonce: nonce,
        content: {
          type: "regular",
          text: "Hello world!",
          title: "Alex Sokol!",
        }
      };
    }

    await storage.message.add(await getMessage());
    await storage.message.add(await getMessage());

    expect((await storage.message.lastMessageNonce(chat))!).toBe(2);
  });

  it('check pagination messages', async () => {
    const storage = await createPersistence();

    const chatId = await randomAESKey();
    const key = await randomAESKey();

    function getMessage(nonce: number): Message {
      return {
        chatId, key, nonce,
        content: {
          type: "regular",
          text: "Hello world!",
          title: "Alex Sokol!",
        }
      };
    }

    for (let i = 0; i < 10; i++) {
      await storage.message.add(getMessage(i));
    }

    const expected = []

    for (let i = 0; i < 10; i++) {
      const message = getMessage(i + 10);
      expected.push(message);
      await storage.message.add(message);
    }

    const result = await storage.message.list({ chatId: chatId });

    expect(result).toStrictEqual(expected)
  });
});
