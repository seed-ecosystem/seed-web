import { describe, expect, it } from 'vitest'
import {RegularContent} from "@/modules/crypto/message-content/regular-content.ts";
import {randomAESKey} from "@/modules/crypto/subtle-crypto.ts";
import {createMessageCoder} from "@/modules/crypto/message-coder.ts";

describe('seed-coder checks', () => {
  it('encode and decode valid', async () => {
    const coder = createMessageCoder();
    const messageKey = await randomAESKey();

    const expectedContent: RegularContent = {
      type: "regular",
      title: "Alex Sokol",
      text: "Hello world!"
    };

    const encoded = await coder.encode({
      content: expectedContent,
      key: messageKey
    });

    console.log(encoded, '\n');

    const decoded = await coder.decode({
      content: encoded.content,
      contentIV: encoded.contentIV,
      key: messageKey,
      signature: encoded.signature
    });

    console.log(decoded);

    expect(decoded).toStrictEqual(expectedContent);
  })

  it('message-content list decoding valid', async () => {
    const coder = createMessageCoder();
    const messageKey0 = await randomAESKey();

    const expectedList: RegularContent[] = [
      {
        type: "regular",
        title: "Alex Sokol",
        text: "Hello world!"
      },
      {
        type: "regular",
        title: "Mark",
        text: "ZVO!"
      },
    ];

    let encodeMessageKey = messageKey0;
    const encodedList = []

    for (let content of expectedList) {
      const encoded = await coder.encode({
        content: content,
        key: encodeMessageKey
      });
      encodeMessageKey = await coder.deriveNextKey(encodeMessageKey);
      encodedList.push(encoded);
    }

    console.log(encodedList, '\n');

    let decodeMessageKey = messageKey0;
    const decodedList = []

    for (let encoded of encodedList) {
      const decoded = await coder.decode({
        content: encoded.content,
        contentIV: encoded.contentIV,
        key: decodeMessageKey,
        signature: encoded.signature
      });
      decodeMessageKey = await coder.deriveNextKey(decodeMessageKey);
      decodedList.push(decoded);
    }

    console.log(decodedList, '\n');

    expect(decodedList).toStrictEqual(expectedList);
  });
})
