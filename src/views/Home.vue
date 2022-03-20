<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const account = ref('');

function handleSubmit() {
  router.push({
    name: 'account',
    params: {
      account: account.value
    }
  });
}

const suggestions = [
  'vitalik.eth',
  'uniswap.eth',
  'cdixon.eth',
  'benahorowitz.eth'
];
</script>

<template>
  <div class="space-y-4">
    <div>
      <h2 class="mb-2">Connect to web3 apps with any address</h2>
      <p class="mb-2">
        Guest make it easy to connect to a web3 app with a read only account.
      </p>
    </div>
    <form @submit.prevent="handleSubmit" class="x-block">
      <div class="mb-3">To get started type an address or an ENS name:</div>
      <SIString
        v-model="account"
        :definition="{ title: '', examples: ['e.g. vitalik.eth'] }"
      />
      <UiButton type="submit" class="w-full">Next</UiButton>
    </form>
    <div class="x-block">
      <div class="mb-3">Or log in as</div>
      <router-link
        :to="{ name: 'account', params: { account: suggestion } }"
        class="flex"
        v-for="(suggestion, i) in suggestions"
        :key="i"
      >
        <Stamp :id="suggestion" :size="44" class="mb-3 mr-3" />
        <div class="mt-1">{{ suggestion }}</div>
      </router-link>
    </div>
  </div>
</template>
