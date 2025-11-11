import { lolESportsAPI } from "../external-services/lol-esports-api/lolESportsAPI.ts";

export async function* iterateLeagues() {
  const { data: { leagues } } = await lolESportsAPI.leagues.get();
  yield* leagues;
}
