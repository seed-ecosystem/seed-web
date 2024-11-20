import {SeedLayer1} from "@/api/seed-layer1.ts";
import {createServerSocket} from "@/api/create-server-socket.ts";

export function createSeedApi(url: string): SeedLayer1 {
  return {
    socket: createServerSocket(url)
  }
}
