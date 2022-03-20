<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useWalletConnect } from '@/composables/useWalletConnect';
import req from '@/helpers/request.json';
import { shortenAddress } from '@/helpers/utils';
import { useClipboard } from '@vueuse/core';

const route = useRoute();
const account = route.params.account;

const { connect, logout, loading, logged, address, requests, parseCall } =
  useWalletConnect();
const uri = ref('');
const copied = ref({});
const { copy } = useClipboard();

function handleCopy(id) {
  const toCopy = requests.value[id];
  delete toCopy._data;
  copy(JSON.stringify(toCopy));
  copied.value = {};
  copied.value[id] = true;
}

async function handleLogout() {
  await logout();
  uri.value = '';
  requests.value = [];
  logged.value = false;
}

/*
parseCall(req).then(request => {
  requests.value.push(request);
});
*/
</script>

<template>
  <div class="space-y-4">
    <div>
      <Stamp :id="account" :size="64" class="mb-3" />
      <div class="float-right" v-if="logged">
        <UiButton @click="handleLogout" class="w-full !bg-red"
          >Disconnect</UiButton
        >
      </div>
      <h2>
        <span class="font-normal">Connect{{ logged ? 'ed' : '' }} as</span>
        {{ account }}
      </h2>
    </div>
    <form
      v-if="!logged"
      @submit.prevent="connect(account, uri)"
      class="border p-4 max-w-md"
    >
      <div class="mb-3">
        Open a web3 app in a new tab like
        <a href="https://snapshot.org" target="_blank" class="underline"
          >Snapshot</a
        >
        and log in using WalletConnect, then paste the connection link below:
      </div>
      <SIString
        v-model="uri"
        :definition="{ title: '', examples: ['Connection link'] }"
      />
      <UiButton :loading="loading" type="submit" class="w-full">
        Connect
      </UiButton>
    </form>
    <div v-if="requests.length > 0" class="border p-4 max-w-md">
      <h4 class="rounded-lg mb-3">Transaction request(s)</h4>
      <div v-for="(request, i) in requests" :key="i" class="mb-3">
        <div v-for="(call, x) in request" :key="x">
          <div class="mb-2">
            <label class="s-label">to</label>
            <div>
              <Icon name="receipt-outlined" /> {{ shortenAddress(call.to) }}
            </div>
            <label class="s-label">Method</label>
            <div>{{ call._data.tx.name }}</div>
          </div>
          <UiButton
            @click="handleCopy(i)"
            class="!bg-transparent border border-gray-400 !text-gray-400"
          >
            <Icon name="copy" />
            {{ copied[i] ? 'Copied' : 'Copy for Zodiac' }}
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>
