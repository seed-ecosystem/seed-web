import {LocalNonceUsecase} from "@/usecase/nonce/local-nonce-usecase.ts";

export function createLocalNonceUsecase(): LocalNonceUsecase {
  let nonce = 0;
  return {
    incrementAndGet(): number {
      return nonce++;
    }
  }
}
