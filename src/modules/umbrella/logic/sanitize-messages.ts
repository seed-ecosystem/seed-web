import { SeedWorkerMessageContent } from "@/sdk-v2/seed-worker";

export function sanitizeContent<T extends SeedWorkerMessageContent>(
  content: T,
): T {
  if (content.type == "regular") {
    const text = content.text.length > 4096 ? `${content.text.substring(0, 4096)}...` : content.text;
    const title = content.title.length > 25 ? `${content.title.substring(0, 25)}...` : content.title;

    return {
      ...content,
      text: text.trim(),
      title: title.trim(),
    };
  }
  return content;
}
