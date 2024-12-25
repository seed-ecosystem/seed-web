import {SeedPersistence} from "@/modules/umbrella/persistence/seed-persistence.ts";

export interface LoadNicknameOptions {
  persistence: SeedPersistence;
  setNickname(name?: string): void;
}

export function loadNickname(
  {persistence, setNickname}: LoadNicknameOptions
) {
  persistence.nickname.getName().then(setNickname);
}
