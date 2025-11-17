<script setup lang="ts">
const valueModel = defineModel<string>('value');

defineProps<{
  readonly?: boolean;
}>()
</script>

<template>
  <input v-model="valueModel"
    class="bg-input-background text-input-text px-4 py-2 rounded-md w-full transition text-text not-focus:outline-border not-focus:outline"
    type="text" :readonly />
</template>
