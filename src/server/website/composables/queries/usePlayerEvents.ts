import { computed, effect, onMounted, watch, type Ref } from "vue"
import { api } from "../../lib/api.ts"
import { useInfiniteQuery } from "@tanstack/vue-query"

export const usePlayerEvents = (playerId: string, type?: Ref<string>) => {
  // const query = useInfiniteQuery({
  //   key: computed(() => {
  //     console.log('computing key with type:', type?.value)
  //     console.log('->', ['players', playerId, 'events', type?.value ?? 'all'])
  //     return ['players', playerId, 'events', type?.value ?? 'all'];
  //   }),
  //   query: async (lastPage) =>
  //     (lastPage === null || (lastPage.pagination.page * lastPage.pagination.limit < lastPage.pagination.total))
  //       ? api.v1.players[":playerId"].events.$get({
  //         param: { playerId },
  //         query: {
  //           ...(type ? { type: type.value } : {}),
  //           page: ((lastPage?.pagination.page ?? 0) + 1).toString(),
  //           limit: '20',
  //         },
  //       }).then(req => req.json()) : null,
  //   initialPage: null as Awaited<ReturnType<Awaited<ReturnType<typeof api.v1.players[":playerId"]["events"]["$get"]>>['json']>> | null,
  //   merge: (pages, newPage) => ({
  //     ...pages!,
  //     ...newPage,
  //     events: [...pages?.events ?? [], ...newPage!.events],
  //   }),
  // })

  const query = useInfiniteQuery({
    queryKey: ['players', playerId, 'events', type ?? 'all'],
    queryFn: async ({ pageParam }) =>
      api.v1.players[":playerId"].events.$get({
        param: { playerId },
        query: {
          ...(type ? { type: type.value } : {}),
          page: pageParam.toString(),
          limit: '20',
        },
      }).then(req => req.json()),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const pagination = lastPage?.pagination;
      if (pagination && pagination.page * pagination.limit < pagination.total) {
        return allPages.length + 1
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
