<script setup lang="ts">
import { computed } from 'vue';
import { usePlayerEvents } from '../../composables/queries/usePlayerEvents';
import { useVod } from '../../composables/queries/useVod';
import { calibrateVod } from '../../lib/utils/calibrateVod';
import { CLIP_MARGIN_SECONDS } from '../../lib/constants';
import { getYoutubeEmbedLink } from '../../lib/utils/getYoutubeEmbedLink';

const props = defineProps<{
  event: NonNullable<ReturnType<typeof usePlayerEvents>['data']>['value'][number]
}>()

const { data: vod } = useVod(computed(() => props.event.vod._id));

const videoTime = computed(() => calibrateVod(vod.value, props.event.vod.timestamp) - CLIP_MARGIN_SECONDS);
</script>

<template>
  <div class="rounded-2xl shadow-hextech/40 shadow-[0_0_30px]">
    <iframe v-if="vod?.youtubeId" class="aspect-video rounded-xl w-full border border-border"
      :src="getYoutubeEmbedLink(vod.youtubeId, videoTime, videoTime + CLIP_MARGIN_SECONDS)"
      frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen;"
      allowfullscreen></iframe>
  </div>
</template>
