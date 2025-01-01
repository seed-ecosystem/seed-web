import {createObservable, Observable} from "@/coroutines/observable.ts";

export type NewChatEvent = {

}

export interface NewChatLogic {
  events: Observable<NewChatEvent>;
}

export function createNewChatLogic(): NewChatLogic {
  const events: Observable<NewChatEvent> = createObservable();

  return {
    events
  };
}
