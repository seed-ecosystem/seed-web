import {RegularContent} from "@/crypto/message/content/regular-content.ts";
import {UnknownMessage} from "@/crypto/message/content/unknown-message.ts";

export type MessageContent = RegularContent | UnknownMessage;
