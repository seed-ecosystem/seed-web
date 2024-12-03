import {RegularContent} from "@/modules/crypto/message-content/regular-content.ts";
import {UnknownContent} from "@/modules/crypto/message-content/unknown-content.ts";

export type MessageContent = RegularContent | UnknownContent;
