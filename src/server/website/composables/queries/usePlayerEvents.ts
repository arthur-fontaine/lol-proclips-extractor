import { useQuery } from "@pinia/colada"
import { computed } from "vue"
import { api } from "../../lib/api.ts"

export const usePlayerEvents = (playerId: string, type?: string) => {
  const query = useQuery({
    key: ['players', playerId, 'events'],
    query: async () => api.v1.players[":playerId"].events.$get({
      param: { playerId },
      query: {
        ...(type ? { type } : {}),
      },
    }).then(req => req.json()),
  })

  const data = computed(() => query.data.value?.events || [])

  return { ...query, data }
}
