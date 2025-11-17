<script setup lang="ts">
defineProps<{
  as: keyof HTMLElementTagNameMap
}>()
</script>

<template>
  <component :is="as">
    <slot />
  </component>
</template>
