<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePlayerEvents } from '../composables/queries/usePlayerEvents';
import PlayerEvent from './PlayerEvent.vue';

const props = defineProps<{
  playerId: string
}>()

const { data: playerEvents } = usePlayerEvents(props.playerId, 'kill');
const playerEventsIndex = ref(0);

const playerEvent = computed(() => playerEvents.value[playerEventsIndex.value]);
</script>

<template>
  <div v-if="playerEvents" class="flex flex-col items-center gap-4">
    <PlayerEvent v-if="playerEvent" :event="playerEvent" class="w-full" />
    <div class="flex gap-4">
      <button @click="playerEventsIndex = Math.max(0, playerEventsIndex - 1)">Previous</button>
      <button @click="playerEventsIndex = Math.min(playerEvents.length - 1, playerEventsIndex + 1)">Next</button>
    </div>
  </div>
</template>
