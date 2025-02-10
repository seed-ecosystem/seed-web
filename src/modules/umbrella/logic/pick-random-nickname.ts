import { SeedPersistence } from "@/modules/umbrella/persistence/seed-persistence.ts";

export type PickRandomNicknameOptions = {
  persistence: SeedPersistence;
};

export async function pickRandomNickname({ persistence }: PickRandomNicknameOptions) {
  const nickname = await persistence.nickname.getName();
  if (nickname === undefined) {
    await persistence.nickname.setName(
      `Anonymous#${getRandomInt(1000, 9999).toString()}`,
    );
  }
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
