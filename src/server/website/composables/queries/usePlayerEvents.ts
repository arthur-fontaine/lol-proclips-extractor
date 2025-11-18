import { computed, effect, onMounted, watch, type Ref } from "vue"
import { api } from "../../lib/api.ts"
import { useInfiniteQuery } from "@tanstack/vue-query"
import { usePlayerEventControllerStore } from "../stores/usePlayerEventControllerStore.ts";

export const usePlayerEvents = (playerId: string, type?: Ref<string>) => {
  const playerEventControllerStore = usePlayerEventControllerStore().getPlayerStore(playerId);
  const initialIndex = playerEventControllerStore.getRef().value || 0;

  const query = useInfiniteQuery({
    queryKey: ['players', playerId, 'events', type ?? 'all'],
    queryFn: async ({ pageParam }) =>
      api.v1.players[":playerId"].events.$get({
        param: { playerId },
        query: {
          ...(type ? { type: type.value } : {}),
          page: pageParam.page.toString(),
          limit: pageParam.limit.toString(),
        },
      }).then(req => req.json()),
    initialPageParam: {
      page: 1,
      limit: Math.max(initialIndex + 1, 20),
    },
    getNextPageParam: (lastPage, allPages) => {
      const pagination = lastPage?.pagination;
      if (pagination && pagination.page * pagination.limit < pagination.total) {
        const totalEventsLoaded = allPages.reduce((acc, page) => acc + (page?.events.length || 0), 0);
        const limit = 20;
        return {
          page: Math.floor(totalEventsLoaded / limit) + 1,
          limit: limit,
        }
      }
      return undefined
    },
  })

  const data = computed(() => query.data.value?.pages.flatMap(page => page?.events) || [])
  const pagination = computed(() => query.data.value?.pages.at(-1)?.pagination)

  return {
    ...query,
    data,
    pagination,
  }
}
