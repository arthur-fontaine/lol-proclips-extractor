<script setup lang="ts">
import Text from './Text.vue';

</script>

<template>
  <Text as="h1" class="text-5xl font-display text-title tracking-widest uppercase">
    <slot />
  </Text>
</template>
