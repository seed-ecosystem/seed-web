import {createObservable, Observable} from "@/coroutines/observable.ts";
import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {launch} from "@/modules/coroutines/launch.ts";

export interface NicknameStateHandle {
  updates: Observable<string>;
  displayUpdates: Observable<string>;
  set(value?: string): void;
  get(): string;
  getDisplay(): string;
}

export function createNicknameStateHandle(
  {persistence}: {
    persistence: SeedPersistence;
  }
): NicknameStateHandle {
  const updates: Observable<string> = createObservable();
  let nickname = "";

  const displayUpdates: Observable<string> = createObservable();
  let displayNickname = "";

  return {
    updates,
    displayUpdates,
    set: (value) => {
      nickname = value ?? "Anonymous";
      displayNickname = value ?? "";
      updates.emit(nickname);
      displayUpdates.emit(displayNickname);
      launch(async () => persistence.nickname.setName(displayNickname));
    },
    get: () => nickname,
    getDisplay: () => displayNickname,
  };
}
