<script setup lang="ts">
import Text from './Text.vue';

</script>

<template>
  <Text as="p" class="text-[0.65rem] font-medium font-sans text-muted tracking-[0.8em] uppercase">
    <slot />
  </Text>
</template>
