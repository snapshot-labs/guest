<script setup>
defineProps({
  primary: {
    type: Boolean,
    default: false
  },
  loading: Boolean,
  type: String,
  disabled: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <button
    :type="type || 'button'"
    class="v-button"
    :disabled="disabled || loading"
  >
    <UiLoading v-if="loading" :white="true" />
    <slot v-else />
  </button>
</template>
