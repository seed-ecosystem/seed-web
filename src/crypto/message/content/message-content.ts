import {RegularContent} from "@/crypto/message/content/regular-content.ts";
import {UnknownContent} from "@/crypto/message/content/unknown-content.ts";

export type MessageContent = RegularContent | UnknownContent;
