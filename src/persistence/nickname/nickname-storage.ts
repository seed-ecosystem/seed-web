export interface NicknameStorage {
  setName(nickname: string): Promise<void>;
  getName(): Promise<string | undefined>;
}
