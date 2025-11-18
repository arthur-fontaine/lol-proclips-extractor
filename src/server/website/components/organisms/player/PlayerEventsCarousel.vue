<script setup lang="ts">
import { computed, effect, ref } from 'vue';
import { usePlayerEvents } from '../../../composables/queries/usePlayerEvents';
import PlayerEvent from '../../molecules/PlayerEvent.vue';
import VodInfo from '../../molecules/VodInfo.vue';
import { CLIP_MARGIN_SECONDS } from '../../../lib/constants';
import PlayerEventController from '../../molecules/PlayerEventController.vue';
import { preloadVod } from '../../../lib/utils/preloadVod';
import Button from '../../atoms/Button.vue';
import { usePlayerEventControllerStore } from '../../../composables/stores/usePlayerEventControllerStore';

const props = defineProps<{
  playerId: string
}>()

const playerEventControllerStore = usePlayerEventControllerStore().getPlayerStore(props.playerId);

const eventType = ref('kill');
const { data: playerEvents, pagination: playerEventsPagination, fetchNextPage: loadMorePlayerEvents } = usePlayerEvents(props.playerId, eventType);
const playerEventsIndex = playerEventControllerStore.getRef();

const playerEvent = computed(() => playerEvents.value[playerEventsIndex.value]);

function goToPreviousEvent() {
  playerEventControllerStore.set(Math.max(0, playerEventsIndex.value - 1));
}

function goToNextEvent() {
  playerEventControllerStore.set(Math.min(playerEvents.value.length - 1, playerEventsIndex.value + 1));
  if (playerEventsIndex.value >= playerEvents.value.length - 2) {
    void loadMorePlayerEvents();
  }
}

effect(() => {
  const nextIndex = playerEventsIndex.value + 1;
  if (nextIndex < playerEvents.value.length) {
    const { vod } = playerEvents.value[nextIndex] ?? {};
    if (!vod) return;
    void preloadVod(vod._id, vod.timestamp)
  }
})

function changeEventType(newType: string) {
  eventType.value = newType;
  playerEventControllerStore.set(0);
}
</script>

<template>
  <div class="flex flex-col">
    <div v-if="playerEvents" class="flex gap-4 flex-col lg:flex-row">
      <div class="flex-1">
        <PlayerEvent v-if="playerEvent" :event="playerEvent" :clipMarginSeconds="CLIP_MARGIN_SECONDS" />
      </div>

      <div class="shrink w-full lg:max-w-64 flex flex-col gap-2">
        <div class="flex bg-card-background w-full border border-border rounded-2xl">
          <Button v-for="{ type, label } in [
            { type: 'kill', label: 'Kills' },
            { type: 'death', label: 'Deaths' },
            { type: 'assist', label: 'Assists' },
          ]" :key="type" :class="{ 'bg-muted/20': eventType === type, 'bg-transparent!': eventType !== type }"
            class="flex-1 rounded-2xl!" @click="changeEventType(type)">
            {{ label }}
          </Button>
        </div>

        <div class="bg-card-background p-4 border border-border rounded-2xl flex flex-col shrink w-full flex-1">
          <VodInfo v-if="playerEvent" :event="playerEvent" />
          <PlayerEventController @next="goToNextEvent" @previous="goToPreviousEvent"
            :currentEventIndex="playerEventsIndex"
            :totalEvents="playerEventsPagination?.total ?? 0" class="mt-auto pt-8" />
        </div>
      </div>
    </div>
  </div>
</template>
