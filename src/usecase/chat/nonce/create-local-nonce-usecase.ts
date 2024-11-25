import {LocalNonceUsecase} from "@/usecase/chat/nonce/local-nonce-usecase.ts";

export function createLocalNonceUsecase(): LocalNonceUsecase {
  let nonce = 0;
  return {
    incrementAndGet(): number {
      return nonce++;
    }
  }
}
