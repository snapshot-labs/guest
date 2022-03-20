import { ref } from 'vue';
import WalletConnect from '@walletconnect/client';
import { isAddress } from '@ethersproject/address';
import { Interface } from '@ethersproject/abi';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { getJSON } from '@snapshot-labs/snapshot.js/src/utils';
import { formatUnits } from '@ethersproject/units';

let connector;

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

export function useWalletConnect() {
  const requests = ref([]);
  const address = ref('');
  const logged = ref(false);
  const loading = ref(false);

  async function logout() {
    await connector.killSession();
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

    connector = new WalletConnect({
      uri,
      storageId: Math.random().toString()
    });
    connector.killSession();
    connector.on('session_request', async (error, payload) => {
      console.log('session_request', error, payload);
      if (error) throw error;
      await connector.approveSession({
        accounts: [address.value],
        chainId: 1
      });
      console.log('Connected');
      logged.value = true;
      loading.value = false;
    });

    // Subscribe to call requests
    connector.on('call_request', async (error, payload) => {
      console.log('Call request', error, payload);
      if (error) throw error;
      try {
        const request: any = await parseCall(payload);
        console.log('Request', request);
        // @ts-ignore
        if (request) requests.value.push(request);
      } catch (e) {
        console.log(e);
      }
    });

    connector.on('disconnect', (error, payload) => {
      console.log('disconnect', error, payload);
      if (error) throw error;
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
