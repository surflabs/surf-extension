export const CLUSTERS_SUI = [
  {
    name: 'devnet',
    apiUrl: process.env.VUE_APP_FULLNODE_RPC,
    label: 'DevNet',
    clusterSlug: 'devnet'
  }
]

export const ETH_CLUSTERS = [
  {
    name: 'mainnet',
    apiUrl: process.env.VUE_APP_ETH_MAINNET_URL,
    label: 'Mainnet',
    chainId: '0x1',
    ethscan: 'https://api.etherscan.io/api',
    ethrecord: 'https://etherscan.io/'
  },
  {
    name: 'goerli-test',
    apiUrl: 'https://goerli.infura.io/v3',
    label: 'Goerli Test',
    chainId: '0x5',
    ethscan: 'https://api-goerli.etherscan.io/api',
    ethrecord: 'https://goerli.etherscan.io/'
  },
  {
    name: 'kovan-test',
    apiUrl: 'https://kovan.infura.io/v3',
    label: 'Kovan Test',
    chainId: '0x2a',
    ethscan: 'https://api-kovan.etherscan.io/api',
    ethrecord: 'https://kovan.etherscan.io/'
  },
  {
    name: 'rinkeby-test',
    apiUrl: 'https://rinkeby.infura.io/v3',
    label: 'Rinkeby Test',
    chainId: '0x4',
    ethscan: 'https://api-rinkeby.etherscan.io/api',
    ethrecord: 'https://rinkeby.etherscan.io/'
  },
  {
    name: 'ropsten-test',
    apiUrl: 'https://ropsten.infura.io/v3',
    label: 'Ropsten Test',
    chainId: '0x3',
    ethscan: 'https://api-ropsten.etherscan.io/api',
    ethrecord: 'https://ropsten.etherscan.io/'
  }
]
