export function convertTitleToAvatar(title: string): string {
  const alphanumeric = title.replace(/[^\p{L}\d\s]/gu, '');

  const titleWords: string[] = [];

  if (alphanumeric.trim().length == 0) {
    titleWords.push(...title);
  } else {
    titleWords.push(...alphanumeric.split(" "));
  }

  return titleWords
    .slice(0, 3)
    .filter((word) => word.length > 0)
    .map((word) => word[0].toUpperCase())
    .join("");
}
