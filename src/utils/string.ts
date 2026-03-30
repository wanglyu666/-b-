/** 超过 maxLen 个字符时截断并追加 ...（按 JavaScript 字符计，中文一字一算） */
export function truncateWithEllipsis(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen)}...`;
}
