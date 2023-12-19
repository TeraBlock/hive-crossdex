export const switchNetwork = async (network) => {

  try {
    let ethereum = null
    if (typeof window !== 'undefined') {
      // Boom
      // const { ethereum } = window;
      ethereum = window.ethereum;

    }
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${Number(network).toString(16)}` }], // using rinkeby - @yash
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const addMaticNetwork = async() => {
  try {
    const result = await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: "0x89",
        rpcUrls: ["https://polygon-rpc.com/"],
        chainName: "Matic Mainnet",
        nativeCurrency: {
          name: "MATIC",
          symbol: "MATIC",
          decimals: 18
        },
        blockExplorerUrls: ["https://polygonscan.com/"]
      }]
    });
  } catch (error){
    console.log(error)
  }
}

export const addBscNetwork = async() => {
  try {
    // Check if Metamask is installed
    if (window.ethereum) {
      const ethereum = window.ethereum;

      // Request Metamask to add the BSC network
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x38', // BSC Mainnet chain ID
            chainName: 'Binance Smart Chain',
            nativeCurrency: {
              name: 'BNB',
              symbol: 'bnb',
              decimals: 18,
            },
            rpcUrls: ['https://bsc-dataseed.binance.org/'], // BSC Mainnet RPC URL
            blockExplorerUrls: ['https://bscscan.com/'], // BSC Explorer URL
          },
        ],
      });

      console.log('Binance Smart Chain added to Metamask');
    } else {
      console.error('Metamask is not installed');
    }
  } catch (error) {
    console.error('Error adding BSC network to Metamask', error);
  }
}

export const addEthNetwork = async () => {
  try {
    // Check if Metamask is installed
    if (window.ethereum) {
      const ethereum = window.ethereum;
  
      // Request Metamask to add the Ethereum network
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x1', // Ethereum Mainnet chain ID
            chainName: 'Ethereum Mainnet',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'eth',
              decimals: 18,
            },
            rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_API_KEY'], // Replace with your Infura API key or other Ethereum node URL
            blockExplorerUrls: ['https://etherscan.io/'], // Ethereum Explorer URL
          },
        ],
      });
  
      console.log('Ethereum Mainnet added to Metamask');
    } else {
      console.error('Metamask is not installed');
    }
  } catch (error) {
    console.error('Error adding Ethereum network to Metamask', error);
  }
}