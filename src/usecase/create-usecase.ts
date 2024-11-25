import {Usecase} from "@/usecase/usecase.ts";
import {TODO} from "@/todo.ts";

export function createUsecase(): Usecase {
  return {
    sendMessage: TODO()
  }
}
