// usePlayerEventControllerStore

import { defineStore } from "pinia";
import { effect, reactive, ref, type Ref } from "vue";

export const usePlayerEventControllerStore = defineStore("playerEventController", () => {
  const indexes: Record<string, Ref<number>> = {};

  effect(() => {
    console.log("PlayerEventControllerStore indexes changed:", indexes);
  });

  const storedIndexes = localStorage.getItem("playerEventIndexes");
  if (storedIndexes) {
    for (const [playerId, index] of Object.entries(JSON.parse(storedIndexes) as Record<string, number>)) {
      indexes[playerId] = ref(index);
    }
  }

  function getRef(playerId: string): Ref<number> {
    if (!(playerId in indexes)) {
      indexes[playerId] = ref(0);
    }
    return indexes[playerId]!;
  }

  function set(playerId: string, index: number): void {
    if (!(playerId in indexes)) {
      indexes[playerId] = ref(0);
    }
    indexes[playerId]!.value = index;
    localStorage.setItem("playerEventIndexes", JSON.stringify(
      Object.fromEntries(Object.entries(indexes).map(([id, ref]) => [id, ref.value])),
    ));
  }

  const getPlayerStore = (playerId: string) => ({
    getRef: () => getRef(playerId),
    set: (index: number) => set(playerId, index),
  });

  return {
    getPlayerStore,
  };
})
