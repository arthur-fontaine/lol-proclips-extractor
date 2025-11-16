import { useQuery } from "@pinia/colada"
import { computed, type Ref } from "vue"
import { api } from "../../lib/api.ts"

export const useVod = (vodId: Ref<string>) => {
  const query = useQuery(() => ({
    key: ['vods', vodId.value],
    query: async () => api.v1.vods[":vodId"].$get({
      param: { vodId: vodId.value },
    }).then(req => req.json()),
  }))

  const data = computed(() => query.data.value?.vod ?? null)

  return { ...query, data }
}
