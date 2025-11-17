<script setup lang="ts">
import Subtitle from '../atoms/typography/Subtitle.vue';
import Text from '../atoms/typography/Text.vue';
import { formatTime } from '../../lib/utils/formatTime';
import { calibrateVod } from '../../lib/utils/calibrateVod';
import { computed, effect, ref } from 'vue';
import type { usePlayerEvents } from '../../composables/queries/usePlayerEvents';
import { useVod } from '../../composables/queries/useVod';
import Input from '../atoms/Input.vue';

const props = defineProps<{
  event: NonNullable<ReturnType<typeof usePlayerEvents>['data']>['value'][number]
}>()

const { data: vod } = useVod(computed(() => props.event.vod._id));
const videoTime = computed(() => calibrateVod(vod.value, props.event.vod.timestamp));

const infos = computed(() => [
  { label: 'Video Time', value: formatTime(videoTime.value) },
  { label: 'Game Time', value: formatTime(props.event.vod.timestamp) },
]);

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

const isCopiedVodUrl = ref(false);
effect(() => {
  if (isCopiedVodUrl.value) {
    const timeout = setTimeout(() => {
      isCopiedVodUrl.value = false;
    }, 2000);

    return () => clearTimeout(timeout);
  }
  return;
});
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <div v-for="info in infos" :key="info.label" class="flex flex-col gap-1 w-full">
      <Subtitle class="text-nowrap font-light select-none">{{ info.label }}</Subtitle>
      <Text as="span" class="text-aurum brightness-150">{{ info.value }}</Text>
    </div>

    <div class="flex flex-col gap-1 w-full">
      <Subtitle class="text-nowrap font-light select-none">Video URL</Subtitle>
      <Input v-if="vod" :readonly="true"
        :value="`https://www.youtube.com/watch?v=${vod.youtubeId}&t=${Math.floor(videoTime || 0)}`"
        class="focus:outline-border!"
        @click="(event: MouseEvent) => { copyToClipboard((event.target as HTMLInputElement).value); isCopiedVodUrl = true; }" />
      <Text v-show="isCopiedVodUrl" as="span" class="text-text select-none text-xs ml-auto">Copied to clipboard!</Text>
    </div>
  </div>
</template>
