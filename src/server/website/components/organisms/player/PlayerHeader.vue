<script setup lang="ts">
import Subtitle from '../../atoms/typography/Subtitle.vue';
import Title from '../../atoms/typography/Title.vue';

defineProps<{
  playerName: string
}>()
</script>

<template>
  <div class="flex flex-col gap-2">
    <Subtitle>Summoner Spotlight</Subtitle>
    <Title>{{ playerName }}</Title>
  </div>
</template>
