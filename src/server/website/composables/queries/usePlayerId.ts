import { useQuery } from "@pinia/colada"
import { api } from "../../lib/api.ts"
import { computed } from "vue"

export const usePlayerId = (playerName: string) => {
  const query = useQuery({
    key: ['players', playerName],
    query: async () => api.v1.players.$get({
      query: {
        summonerName: playerName,
        limit: '1',
      },
    }).then(req => req.json()),
  })

  const data = computed(() => query.data.value?.players?.[0]?._id ?? null)

  return { ...query, data }
}
