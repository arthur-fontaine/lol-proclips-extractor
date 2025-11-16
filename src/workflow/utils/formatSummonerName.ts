export function formatSummonerName(summonerName: string): string {
  const re = /[A-Z0-9]{1,3} (.+)/;
  const [, match] = summonerName.match(re) ?? [];
  return match ?? summonerName;
}
