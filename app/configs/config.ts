interface Chain {
    name: string;
    explorer: string;
    graphApi: string;
    proxy: string;
    icon: string;
    txApi: string;
}

interface ContractAddress {
    eth: string;
    bsc: string;
    1?: string;
    56?: string;
}

export const swapAPI: string = "https://sw-api.terablock.com/quote";

export const chain: {[key: string]: Chain} = {
  "1": {
      "name": "ethereum",
      "explorer": "https://etherscan.io/",
      "graphApi": "https://api.coingecko.com/api/v3/coins/ethereum/contract/",
      "proxy": "0x80705283D1E2CaA3fB126f1262aeC6C260C7c205",
      "icon": "eth-logo.png",
      "txApi": "https://api.1inch.io/v4.0/1/quote/?chainId=1"
  },
  "5": {
      "name": "goerli",
      "explorer": "https://goerli.etherscan.io/",
      "graphApi": "",
      "proxy": "0x80705283D1E2CaA3fB126f1262aeC6C260C7c205",
      "icon": "eth-logo.png",
      "txApi": "https://api.1inch.io/v4.0/5/quote?chainId=5"
  },
  "56": {
      "name": "bsc",
      "explorer": "https://bscscan.com/",
      "graphApi": "https://api.coingecko.com/api/v3/coins/binance-smart-chain/contract/",
      "proxy": "0x80705283D1E2CaA3fB126f1262aeC6C260C7c205",
      "icon": "bsclogo.png",
      "txApi": "https://api.1inch.io/v4.0/56/quote?chainId=56"
  },
  "137": {
      "name": "matic",
      "explorer": "https://polygonscan.com/",
      "graphApi": "https://api.coingecko.com/api/v3/coins/polygon-pos/contract/",
      "proxy": "0x80705283D1E2CaA3fB126f1262aeC6C260C7c205",
      "icon": "polygon-matic-icon.png",
      "txApi": "https://api.1inch.io/v4.0/137/quote?chainId=137"
  }
}

export const ContractAddress: {[key: string]: ContractAddress} = {
    TBC: {
      eth: "0x9798dF2f5d213a872c787bD03b2b91F54D0D04A1",
      bsc: "0x9798dF2f5d213a872c787bD03b2b91F54D0D04A1",
    },
    SPS: {
      eth: "0x00813E3421E1367353BfE7615c7f7f133C89df74",
      bsc: "0x1633b7157e7638C4d6593436111Bf125Ee74703F",
    },
    DEC: {
      eth: "0x9393fdc77090F31c7db989390D43F454B1A6E7F3",
      bsc: "0xE9D7023f2132D55cbd4Ee1f78273CB7a3e74F10A",
    },
    USDT: {
      eth: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      bsc: "0x55d398326f99059ff775485246999027b3197955",
    },
    USDC: {
      eth: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      bsc: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    },
    SWIDGE: {
      eth: "0x80705283D1E2CaA3fB126f1262aeC6C260C7c205",
      bsc: "0x80705283D1E2CaA3fB126f1262aeC6C260C7c205",
      1: "0x80705283D1E2CaA3fB126f1262aeC6C260C7c205",
      56: "0x80705283D1E2CaA3fB126f1262aeC6C260C7c205"
    },
  }

  export const apiUrls: {[key: string]: string} = {
    swidgeApi: "https://sw-api.terablock.com/quote",
    bridgeApi: "https://hiveapi.terablock.com",
    gameApi: "https://api2.splinterlands.com",
  }