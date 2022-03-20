<template>
  <div class="fixed top-0 w-full bg-white z-10">
    <div class="border-b ml-[32px] h-[64px]" />
    <router-link
      :to="{ name: 'home' }"
      class="fixed top-0 left-0 w-[64px] h-[64px] block"
    >
      <div class="ml-[20px] mt-3">
        <Icon name="emoji" :size="28" />
      </div>
    </router-link>
    <div class="fixed border-r w-[32px] top-[32px] h-[32px] left-[32px]" />
  </div>
</template>
