<script setup lang="ts">
import { computed } from 'vue';
import Button from '../atoms/Button.vue';
import Text from '../atoms/typography/Text.vue';

const props = defineProps<{
  currentEventIndex: number
  totalEvents: number
}>();

const emit = defineEmits<{
  (e: 'next'): void
  (e: 'previous'): void
}>()

function next() {
  emit('next');
}

function previous() {
  emit('previous');
}

const hasPrevious = computed(() => props.currentEventIndex > 0);
const hasNext = computed(() => props.currentEventIndex < props.totalEvents - 1);
</script>

<template>
  <div class="flex gap-4 justify-between items-center">
    <Button @click="previous" :disabled="!hasPrevious" class="-scale-x-100">
      <span class="-translate-x-1.5">
        ►
      </span>
    </Button>
    <Text as="span" class="text-aurum brightness-150">
      {{ currentEventIndex + 1 }} / {{ totalEvents }}
    </Text>
    <Button @click="next" :disabled="!hasNext">
      <span class="-translate-x-1.5">
        ►
      </span>
    </Button>
  </div>
</template>
