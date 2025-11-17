<script setup lang="ts">
import Text from './typography/Text.vue';

defineProps<{
  disabled?: boolean;
}>()
</script>

<template>
  <button :disabled class="bg-button-background px-4 py-2 rounded-md cursor-pointer select-none hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed">
    <Text as="span" class="text-button-text">
      <slot />
    </Text>
  </button>
</template>
