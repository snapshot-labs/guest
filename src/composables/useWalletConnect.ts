import { ref, Ref } from 'vue';
import { Core } from '@walletconnect/core';
import { Web3Wallet, IWeb3Wallet } from '@walletconnect/web3wallet';
import { buildApprovedNamespaces } from '@walletconnect/utils';
import { isAddress } from '@ethersproject/address';
import { Interface } from '@ethersproject/abi';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { getJSON } from '@snapshot-labs/snapshot.js/src/utils';
import { formatUnits } from '@ethersproject/units';

let connector: IWeb3Wallet;
let topic;

const projectId =
  typeof import.meta.env.VITE_WC_PROJECT_ID === 'string'
    ? import.meta.env.VITE_WC_PROJECT_ID
    : '';

async function getContractABI(address) {
  const uri = 'https://api.etherscan.io/api';
  const params = new URLSearchParams({
    module: 'contract',
    action: 'getAbi',
    address
  });
  const { result } = await getJSON(`${uri}?${params}`);
  return JSON.parse(result);
}

function parseTransaction(call, abi) {
  const iface = new Interface(abi);
  return JSON.parse(JSON.stringify(iface.parseTransaction(call)));
}

async function parseCall(call) {
  console.log('Call', call);
  if (call.method === 'eth_sendTransaction') {
    console.log('Send transaction');
    const params = call.params[0];
    const abi = await getContractABI(params.to);
    console.log('Got ABI contract');
    const tx = parseTransaction(params, abi);
    console.log('Tx', tx);
    return [
      {
        to: params.to,
        value: formatUnits(params.value || 0),
        method: tx.signature,
        params: tx.args,
        operation: 0,
        _data: {
          call,
          tx
        }
      }
    ];
  }
  return false;
}

function getSupportedNamespaces(params, address: string) {
  return ['optionalNamespaces', 'requiredNamespaces'].reduce((acc, key) => {
    const value = params[key];
    Object.entries(value).forEach(([np, npVal]: [string, any]) => {
      if (!acc[np]) {
        acc[np] = npVal;
      } else {
        const chains = [...new Set([...acc[np].chains, ...npVal.chains])];
        const methods = [...new Set([...acc[np].methods, ...npVal.methods])];
        const events = [...new Set([...acc[np].events, ...npVal.events])];
        acc[np] = {
          chains,
          methods,
          events,
          accounts: chains.map(chain => `${chain}:${address}`)
        };
      }
    });
    return acc;
  }, {});
}

export function useWalletConnect() {
  const requests = ref([]) as Ref<any[]>;
  const address = ref('');
  const logged = ref(false);
  const loading = ref(false);

  async function logout() {
    await connector.disconnectSession({
      topic,
      reason: {
        code: 1000,
        message: 'DISCONNECTED_BY_USER'
      }
    });
  }

  async function connect(account, uri) {
    address.value = account;
    loading.value = true;
    if (!isAddress(account)) {
      const provider = getProvider('1');
      address.value = await provider.resolveName(account);
    }
    if (!address.value) {
      loading.value = false;
      return;
    }

    if (!connector) {
      const core = new Core({
        logger: 'debug',
        projectId
      });

      connector = await Web3Wallet.init({
        core,
        metadata: {
          name: 'Guest Wallet',
          description: 'Guest Wallet for WalletConnect',
          url: 'https://guest.so/',
          icons: []
        }
      });
    } else {
      await logout();
    }

    await connector.core.pairing.pair({ uri });

    connector.on('session_proposal', async ({ id, params }) => {
      console.log('session_proposal', params);
      topic = params.pairingTopic;
      const supportedNamespaces = getSupportedNamespaces(params, address.value);

      const approvedNamespaces = buildApprovedNamespaces({
        proposal: params,
        supportedNamespaces
      });

      await connector.approveSession({ id, namespaces: approvedNamespaces });
      console.log('Connected');
      logged.value = true;
      loading.value = false;
    });

    // Subscribe to call requests
    connector.on('session_request', async payload => {
      console.log('Call request', payload);
      try {
        const request: any = await parseCall(payload);
        console.log('Request', request);
        if (request) requests.value.push(request);
      } catch (e) {
        console.log(e);
      }
    });

    connector.on('session_delete', event => {
      console.log('disconnect', event);
    });
  }

  return {
    parseCall,
    connect,
    logout,
    address,
    loading,
    logged,
    requests
  };
}
