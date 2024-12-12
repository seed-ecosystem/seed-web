import {launch} from "@/modules/coroutines/launch.ts";
import {Channel} from "@/modules/coroutines/channel/channel.ts";
import {createChannel} from "@/modules/coroutines/channel/create.ts";

export function launchChannel<T>(
  block: (channel: Channel<T>) => Promise<void>,
  autoClose: boolean = true,
): Channel<T> {
  const channel = createChannel<T>();
  launch(async () => {
    await block(channel);
    if (autoClose) {
      channel.close();
    }
  });
  return channel;
}
