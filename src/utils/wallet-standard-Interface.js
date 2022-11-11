import mitt from 'mitt'
import { ReadonlyWalletAccount, SUI_CHAINS } from '@mysten/wallet-standard'

// export class ReadonlyWalletAccount {
//   #address
//   #publicKey
//   #chains
//   #features
//   #label
//   #icon

//   get address () {
//     return this.#address
//   }

//   get publicKey () {
//     return this.#publicKey.slice()
//   }

//   get chains () {
//     return this.#chains.slice()
//   }

//   get features () {
//     return this.#features.slice()
//   }

//   get label () {
//     return this.#label
//   }

//   get icon () {
//     return this.#icon
//   }

//   constructor (account) {
//     if (new.target === ReadonlyWalletAccount) {
//       Object.freeze(this)
//     }

//     this.#address = account.address
//     this.#publicKey = account.publicKey
//     this.#chains = account.chains
//     this.#features = account.features
//     this.#label = account.label
//     this.#icon = account.icon
//   }
// }

export class WalletStandardInterface {
  #events
  #version = '1.0.0'
  #name = 'Surf Wallet'
  #account
  #api

  get version () {
    return this.#version
  }

  get name () {
    return this.#name
  }

  get icon () {
    return 'https://src.surf.tech/icon/surf_vector.svg'
  }

  get chains () {
    return SUI_CHAINS
  }

  get features () {
    return {
      'standard:connect': {
        version: '1.0.0',
        connect: this.#connect
      },
      'standard:events': {
        version: '1.0.0',
        on: this.#on
      },
      'sui:signAndExecuteTransaction': {
        version: '1.0.0',
        signAndExecuteTransaction: this.#signAndExecuteTransaction
      }
    }
  }

  get accounts () {
    return this.#account ? [this.#account] : []
  }

  constructor (api) {
    this.#api = api
    this.#events = mitt()
    this.#account = null

    // auto connect
    this.#connected()
  }

  // eslint-disable-next-line no-dupe-class-members
  #on = (event, listener) => {
    this.#events.on(event, listener)
    return () => this.#events.off(event, listener)
  };

  // eslint-disable-next-line no-dupe-class-members
  #connected = async () => {
    if (!(await this.#api.hasPermissions(['viewAccount']))) {
      return
    }
    const accounts = await this.#api.getAccounts()

    const [address] = accounts

    if (address) {
      const account = this.#account
      if (!account || account.address !== address) {
        this.#account = new ReadonlyWalletAccount({
          address,
          publicKey: new Uint8Array(),
          chains: SUI_CHAINS,
          features: ['sui:signAndExecuteTransaction']
        })
        this.#events.emit('change', { accounts: this.accounts })
      }
    }
  };

  // eslint-disable-next-line no-dupe-class-members
  #connect = async (input) => {
    if (!input || !input.silent) {
      await this.#api.requestPermissions()
    }

    await this.#connected()

    return { accounts: this.accounts }
  };

  // eslint-disable-next-line no-dupe-class-members
  #signAndExecuteTransaction = async (input) => {
    return this.#api.signAndExecuteTransaction(input.transaction)
  }
}

// class RegisterWalletEvent extends Event {
//   #detail

//   get detail () {
//     return this.#detail
//   }

//   get type () {
//     return 'wallet-standard:register-wallet'
//   }

//   constructor (callback) {
//     super('wallet-standard:register-wallet', {
//       bubbles: false,
//       cancelable: false,
//       composed: false
//     })
//     this.#detail = callback
//   }
// }

// export function registerWallet (wallet) {
//   const callback = ({ register }) => register(wallet)
//   try {
//     window.dispatchEvent(new RegisterWalletEvent(callback))
//   } catch (error) {
//     console.error('wallet-standard:register-wallet event could not be dispatched\n', error)
//   }
//   try {
//     window.addEventListener('wallet-standard:app-ready', ({ detail: api }) =>
//       callback(api)
//     )
//   } catch (error) {
//     console.error('wallet-standard:app-ready event listener could not be added\n', error)
//   }
// }
