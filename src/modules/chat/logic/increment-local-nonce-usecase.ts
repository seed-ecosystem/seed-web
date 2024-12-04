import {MutableRefObject} from "react";

/**
 * This usecase might seem very tiny and it is for sure.
 * I was just experimenting with state hoisting.
 */
export interface IncrementLocalNonceUsecase {
  (options: {localNonceRef: MutableRefObject<number>}): number
}

export function createIncrementLocalNonceUsecase(): IncrementLocalNonceUsecase {
  return ({localNonceRef}) => {
    return localNonceRef.current++;
  }
}
