<script setup>
defineProps({
  type: {
    type: String,
    default: 'avatar'
  },
  id: String,
  size: {
    type: Number,
    default: 22
  }
});
</script>

<template>
  <img
    :src="`https://stamp.fyi/${type}/${id}?s=${size * 2}`"
    class="inline-block bg-white border"
    :style="{
      width: `${size}px`,
      height: `${size}px`
    }"
  />
</template>
