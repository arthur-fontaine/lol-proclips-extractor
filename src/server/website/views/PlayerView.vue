<script lang="ts" setup>
import { useRoute } from 'vue-router';
import PlayerEventsCarousel from '../components/PlayerEventsCarousel.vue';
import { usePlayerId } from '../composables/queries/usePlayerId';

const route = useRoute();
const playerName = route.params['playerName'];
if (typeof playerName !== 'string') {
  throw new Error('playerName route param is required');
}

const { data: playerId, isLoading } = usePlayerId(playerName);
</script>

<template>
  <PlayerEventsCarousel v-if="!isLoading && playerId" :playerId class="w-1/2" />
</template>
