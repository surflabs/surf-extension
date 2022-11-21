# Surf Wallet

[![Wallet Standard supported](https://badgen.net/badge/wallet-standard/supported/green)](https://github.com/wallet-standard/wallet-standard)

Surf makes it easy & safe to transfer tokens and collect NFTs on the [Sui](https://sui.io/) blockchain. You can find the latest version of Surf Wallet on [our official website](https://surf.tech/).

## Detecting the Provider

The Surf Wallet provider implements the [Sui Wallet Standard](https://github.com/MystenLabs/sui/tree/main/sdk/wallet-adapter/packages/wallet-standard#mystenwallet-standard), so the recommended way is to add the [Sui Wallet Adapter](https://github.com/MystenLabs/sui/tree/56de8448fe005606494e014e4dd87d7477a3f905/sdk/wallet-adapter#sui-wallet-adapter) to your dApp dependencies:

```bash
npm install @mysten/wallet-adapter-all-wallets 
```

With [Sui Wallet Adapter](https://github.com/MystenLabs/sui/tree/56de8448fe005606494e014e4dd87d7477a3f905/sdk/wallet-adapter#sui-wallet-adapter) you don't have to worry about which wallets can connect with your dApp. Any wallet that implements the [Sui Wallet Standard](https://github.com/MystenLabs/sui/tree/main/sdk/wallet-adapter/packages/wallet-standard#mystenwallet-standard) will be able to connect to your dApp and when someone developers a new wallet that implements the Wallet Standard it will be able to connect to your dApp with no changes on your part. Altogether, this may look like the following:

```js
import { WalletStandardAdapterProvider } from '@mysten/wallet-adapter-all-wallets'

// Get all wallet adapters
const adapters = new WalletStandardAdapterProvider().get()

// Establishing a connection
await adapters[0].connect()
const accounts = await adapters[0].getAccounts()
```

## Project setup
```bash
npm install
```

### Compiles and hot-reloads for development
```bash
npm run serve
```

### Compiles and minifies for production
```bash
npm run build
```

### Lints and fixes files
```bash
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
