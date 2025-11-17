<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { usePlayerId } from '../composables/queries/usePlayerId';
import DefaultLayout from '../layouts/DefaultLayout.vue';
import PlayerHeader from '../components/organisms/player/PlayerHeader.vue';
import PlayerEventsCarousel from '../components/organisms/player/PlayerEventsCarousel.vue';

const route = useRoute();
const playerName = route.params['playerName'];
if (typeof playerName !== 'string') {
  throw new Error('playerName route param is required');
}

const { data: playerId, isLoading } = usePlayerId(playerName);
</script>

<template>
  <DefaultLayout>
    <PlayerHeader :playerName class="mb-8" />
    <PlayerEventsCarousel v-if="!isLoading && playerId" :playerId />
  </DefaultLayout>
</template>
