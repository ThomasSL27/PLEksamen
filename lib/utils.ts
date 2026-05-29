export const toLower = (value?: string) => String(value || "").toLowerCase();

export function getTwitterUrl(twitter?: string) {
  if (!twitter) return "";
  return twitter.startsWith("http")
    ? twitter
    : `https://x.com/${twitter.replace("@", "")}`;
}
