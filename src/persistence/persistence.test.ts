import {describe, expect, it} from "vitest";
import {createPersistence} from "@/persistence/create-persistence.ts";
import {Message} from "@/persistence/message/message.ts";
import {randomAESKey} from "@/crypto/subtle-crypto.ts";
import {createMessageCoder} from "@/crypto/create-message-coder.ts";

describe('persistence checks', () => {
  it('check can add messages', async () => {
    const storage = await createPersistence();

    const chatId = await randomAESKey();
    const key = await randomAESKey();

    const message: Message = {
      chat: { chatId: chatId },
      key: key,
      nonce: 0,
      content: {
        text: "Hello world!",
        title: "Alex Sokol!",
      }
    };

    await storage.message.add(message);

    const result = await storage.message.list({ chatId: chatId }, 0, 1);

    expect(result[0]).toStrictEqual(message);
  });

  it('check last message', async () => {
    const storage = await createPersistence();
    const coder = createMessageCoder();

    const chat = { chatId: await randomAESKey() };

    expect(await storage.message.lastMessage(chat)).toStrictEqual(undefined);

    async function getMessage(): Promise<Message> {
      const message = await storage.message.lastMessage(chat);

      let nonce
      let key

      if (message == null) {
        key = await randomAESKey();
        nonce = 0
      } else {
        key = await coder.deriveNextKey(message.key);
        nonce = message.nonce + 1;
      }

      return {
        chat: chat,
        key: key,
        nonce: nonce,
        content: {
          text: "Hello world!",
          title: "Alex Sokol!",
        }
      };
    }

    await storage.message.add(await getMessage());
    await storage.message.add(await getMessage());

    expect((await storage.message.lastMessage(chat))!.nonce).toBe(2);
  });

  it('check pagination messages', async () => {
    const storage = await createPersistence();

    const chatId = await randomAESKey();
    const key = await randomAESKey();

    function getMessage(nonce: number): Message {
      return {
        chat: { chatId: chatId },
        key: key,
        nonce: nonce,
        content: {
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

    const result = await storage.message.list({ chatId: chatId }, 10, 20);

    expect(result).toStrictEqual(expected)
  });
});
