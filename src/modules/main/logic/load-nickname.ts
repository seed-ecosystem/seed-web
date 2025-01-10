import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";
import {NicknameStateHandle} from "@/modules/main/logic/nickname-state-handle.ts";

export interface LoadNicknameOptions {
  persistence: SeedPersistence;
  nickname: NicknameStateHandle;
}

export function loadNickname(
  {persistence, nickname}: LoadNicknameOptions
) {
  persistence.nickname.getName()
    .then(value => nickname.set(value));
}
