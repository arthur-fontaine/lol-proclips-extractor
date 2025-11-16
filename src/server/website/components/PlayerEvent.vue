<script setup lang="ts">
import { computed, effect, toRef } from 'vue';
import { usePlayerEvents } from '../composables/queries/usePlayerEvents';
import { useVod } from '../composables/queries/useVod';

const props = defineProps<{
  event: NonNullable<ReturnType<typeof usePlayerEvents>['data']>['value'][number]
}>()

const { data: vod } = useVod(computed(() => props.event.vod._id));

const videoTime = computed(() => {
  if (!vod.value) return 0;

  const calibrationPoints = vod.value.calibrationPoints.toSorted((a, b) => a.gameTimestampSeconds - b.gameTimestampSeconds);

  const eventGameTime = props.event.vod.timestamp;
  const marginSeconds = 10;

  for (const point of calibrationPoints) {
    if (point.gameTimestampSeconds < eventGameTime) {
      return point.videoTimestampSeconds + eventGameTime - point.gameTimestampSeconds - marginSeconds;
    }
  }

  return 0;
})
</script>

<template>
  <iframe v-if="vod" class="aspect-video"
    :src="`http://www.youtube.com/embed/${vod.youtubeId}?start=${Math.floor(videoTime!)}&autoplay=1&controls=1&rel=0`"
    frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen></iframe>
</template>
