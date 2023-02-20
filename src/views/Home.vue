<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { GraphQLClient } from 'graphql-request';



const router = useRouter();
const account = ref('');

const endpoint = 'http://localhost:3000'; // Replace with your endpoint URL
const client = new GraphQLClient(endpoint);

    const accountAddress = ref('');
    const accountTokens = ref([]);

    async function handleSearch() {
      console.log('test')
      const query = `
        query GetTokens($accountAddress: String!) {
          accounttokens(where: { account: $accountAddress }) {
            id
            account
            token {
              id
              decimals
              name
              symbol
              totalSupply
            }
            balance
            modified
            tx
          }
        }
      `;
      const variables = { accountAddress: accountAddress.value };
      const data = await client.request(query, variables);
      accountTokens.value = data.accounttokens;

    return { accountAddress, accountTokens, handleSearch };
    }

</script>

<template>
  <div class="space-y-4">
    <div>
      <div class="align">
        <h2 class="mb-2">Search for Starknet token holders</h2>
      </div>
      <p class="mb-2 max-w-2xl">
        With Checkpoint it is possible to retrieve and index, quickly and easily, any data from Starknet, whether it is global or from a particular smart contract.<br><br> Witness the power of Checkpoint now by retrieving token holdings from any Starknet holder. (See how it works <a href="https://github.com/snapshot-labs/token-api-checkpoint" style="color: #374aff;">here</a>)
      </p>
    </div>
        <form @submit.prevent="handleSearch" class="x-block">
          <div class="mb-3">Search Starknet token holders:</div>
          <SIString
            v-model="accountAddress"
            :definition="{ title: '', examples: ['Account address'] }"
          />
          <UiButton type="submit" class="w-full">Search</UiButton>
        </form>
      <ul class=" x-block">
        <li class="token-item">
          <span class="token-name">Name</span>
          <span class="token-symbol">Symbol</span>
          <span class="token-balance">Balance</span>
        </li>
        <li v-for="token in accountTokens" :key="token.id" class="token-item">
          <span class="token-name">{{ token.token.name }}</span>
          <span class="token-symbol">{{ token.token.symbol }}</span>
          <span class="token-balance">{{ token.balance }}</span>
        </li>
      </ul>
  </div>
</template>

<style>
  .token-list {
    list-style: none;
    padding: 0;
    margin: 0;
    width: 27%;
  }

  .token-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f7f7f7;
    border-radius: 10px;
    padding: 10px;
    margin-bottom: 10px;
  }

  .token-name {
    font-weight: bold;
    margin-right: 10px;
  }

  .token-balance {
    font-size: 1.2rem;
    font-weight: bold;
  }

  .token-symbol {
    margin-right: 5px;
  }
</style>
