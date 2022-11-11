import Vue from 'vue'
import Vuex from 'vuex'
import { JsonRpcProvider, hasPublicTransfer } from '@mysten/sui.js'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { aesEncrypt3, chromeStorage } from '@/utils/common'
import { isCoin, isSUI, getCoinSymbol, getCoinTypeArg } from '@/utils/sui'
import { getNewGoodsList } from '@/utils/filters'
import BigNumber from 'bignumber.js'

// import plugin from './plugin'
import common from './common'

import collectible from './collectible'

Vue.use(Vuex)

export const GAS_TYPE_ARG = '0x2::sui::SUI'
export const BIG_TEN = new BigNumber(10)
export const SUI_DECIMALS = 9
const BN = BigNumber.clone({ ROUNDING_MODE: 1, DECIMAL_PLACES: 9 })

// export const unknownDarkImg = require('@/assets/img/unknown-dark.png')
// export const unknownImg = require('@/assets/img/unknown.png')

export default new Vuex.Store({
  state: {
    isFirstToExtensions: localStorage.getItem('isFirstToExtensions') || true,
    isFirstToNft: localStorage.getItem('isFirstToNft') || true,
    registered: localStorage.getItem('registered'),
    endpoint: localStorage.getItem('endpoint') || process.env.VUE_APP_FULLNODE_RPC,
    balancesList: [],
    balancesOfWalletList: {},
    unknownTokens: {},
    accounts: [], // addresses, unincluded scrkey
    allWalletList: null, // included scrkey
    mainWallet: null,
    _curWalIdx: localStorage.getItem('curWalIdx') || 0,
    loginAccount: '',
    loginExpiry: null,
    balancesListPromise: null,
    programAccountsPromise: null,
    pricePromise: null,
    tokenInfosPromise: null,
    theme: localStorage.getItem('theme') || 'light',
    lastTimeSend: null,
    currViewToken: null,
    tokenAccounts: {},
    hiddenTokensV1: JSON.parse(localStorage.getItem('hiddenTokensV1')) || null,
    manualTokens: JSON.parse(localStorage.getItem('manualTokens')) || [],
    pwdValidPass: false,
    solanaTokenList: new Map(),
    priceMap: {},
    canvasFingerprint: '',
    version: chrome.runtime.getManifest().version,
    resetParam: '',
    paymentObj: [],
    currSendInput: null,
    allSuiObjects: [],
    isRecordRefresh: false,

    addressInputs: JSON.parse(localStorage.getItem('addressInputs')) || {}
  },
  getters: {
    // unincluded scrkey
    curAccount (state, getters) {
      return (state.accounts && state.accounts[getters.curWalIdx]) || {}
    },
    // included scrKey
    curWallet (state, getters) {
      return (getters.walletList && getters.walletList[getters.curWalIdx]) || {}
    },
    walletList (state) {
      return state.allWalletList || []
    },
    pubKey (state, getters) {
      return state.loginAccount
    },
    curWalIdx (state, getters) {
      const idx = Number(state._curWalIdx)
      return isNaN(idx) || idx < 0 || state.accounts.length < idx + 1 ? 0 : idx
    },
    isLoginExpired (state, getters) {
      const expiry = state.loginExpiry || 0
      return Date.now() > expiry
    },

    gatewayProvider () {
      return new JsonRpcProvider(process.env.VUE_APP_GATEWAY_RPC)
    },

    fullnodeProvider () {
      return new JsonRpcProvider(process.env.VUE_APP_FULLNODE_RPC)
    },

    filterBalancesList (state, getters) {
      return state.balancesList
    },
    suiDecimals (state, getters) {
      // return getters.fullnodeProvider.getCoinDenominationInfo(GAS_TYPE_ARG).decimalNumber
      return 9
    }
    // hasAmountTokens (state) {
    //   return state.balancesList[state.curChain].filter(x => x.amount > 0)
    // }
    // isMainnet (state) {
    //   return isMainnet(state.endpoint)
    // }
  },
  mutations: {
    // SET_CUR_CHAIN (state, payload) {
    //   state.curChain = payload
    //   localStorage.setItem('curChain', payload)
    // },
    SET_ENDPOINT (state, url) {
      state.endpoint = url
      localStorage.setItem('endpoint', url)
    },
    SET_BALANCES_LIST (state, list) {
      state.balancesList = list

      Vue.set(state.balancesOfWalletList, list[0].address, list)
    },
    SET_UNKNOWN_TOKENS (state, token) {
      Vue.set(state.unknownTokens, token.pubkey.toBase58(), token)
    },
    SET_ALL_WALLET_LIST (state, payload) {
      state.allWalletList = payload
    },
    SET_MAIN_WALLET (state, payload) {
      state.mainWallet = payload
    },
    SET_CUR_WAL_IDX (state, payload) {
      const address = state.accounts[payload].address
      state._curWalIdx = payload
      state.loginAccount = address
      localStorage.setItem('curWalIdx', payload)
      chromeStorage.set({ loginAccount: address })
    },
    SET_LOGIN_ACCOUNT (state, payload) {
      state.loginAccount = payload
      chromeStorage.set({ loginAccount: payload })
    },
    SET_LOGIN_EXPIRY (state, payload) {
      state.loginExpiry = payload
      chromeStorage.set({ loginExpiry: payload })
    },
    SET_ACCOUNTS (state, payload) {
      state.accounts = payload
      chromeStorage.set({ accounts: payload })
    },
    SET_BALANCES_LIST_PROMISE (state, payload) {
      state.balancesListPromise = payload
    },
    SET_PROGRAM_ACCOUNTS_PROMISE (state, payload) {
      state.programAccountsPromise = payload
    },
    SET_PRICE_PROMISE (state, payload) {
      state.pricePromise = payload
    },
    SET_TOKENINFO_PROMISES (state, list) {
      state.tokenInfosPromise = list
    },
    CLEAR_BALANCES (state) {
      state.balancesList = []
      state.tokenAccounts = {}
      state.unknownTokens = {}
      state.balancesListPromise = null
      state.programAccountsPromise = null
      state.pricePromise = null
      state.collectible.nftList = []
      // state.stake.stakedAccounts = []
      // state.stake.inflationReward = []
      Vue.prototype.$crmStorage.remove(['blCache', 'ethBlCache', 'crmrecord'])
    },
    SET_THEME (state, { theme, setLocal }) {
      state.theme = theme
      if (setLocal) {
        localStorage.setItem('theme', theme)
      }
    },
    SET_LASTTIME_SEND (state, payload) {
      state.lastTimeSend = payload
    },
    SET_CURR_VIEW_TOKEN (state, payload) {
      state.currViewToken = payload
    },
    SET_TOKEN_ACCOUNTS (state, payload) {
      state.tokenAccounts = payload
    },
    UPDATE_TOKEN_ACCOUNTS (state, payload) {
      if (!state.tokenAccounts[payload.mintAddress]) {
        state.tokenAccounts = Object.assign({}, state.tokenAccounts, {
          [payload.mintAddress]: { tokenAccountAddress: payload.tokenAccountAddress }
        })
      }
    },
    SET_HIDDEN_TOKENS (state, { walletAddress, token }) {
      let tokens = state.hiddenTokensV1

      if (!tokens || !tokens[walletAddress]) {
        tokens = Object.assign({}, tokens, { [walletAddress]: {} })
      }
      state.hiddenTokensV1 = Object.assign({}, state.hiddenTokensV1, tokens, { [walletAddress]: Object.assign({}, tokens[walletAddress], token) })
      localStorage.setItem('hiddenTokensV1', JSON.stringify(state.hiddenTokensV1))
    },
    CLEAR_HIDDEN_TOKENS (state, walletAddress) {
      const tokens = state.hiddenTokensV1
      if (tokens && tokens[walletAddress]) {
        Vue.delete(tokens, walletAddress)
      }
      state.hiddenTokensV1 = tokens
      localStorage.setItem('hiddenTokensV1', JSON.stringify(state.hiddenTokensV1))
    },
    SET_MANUAL_TOKENS (state, token) {
      const manual = state.manualTokens

      if (!manual) {
        localStorage.setItem('manualTokens', JSON.stringify([token]))
        state.manualTokens = [token]
      } else {
        if (manual.findIndex(item => item.address === token.address) === -1) {
          manual.unshift(token)
        }
        localStorage.setItem('manualTokens', JSON.stringify(manual))
      }
    },
    SET_PWD_VALID_PASS (state, payload) {
      state.pwdValidPass = payload
    },
    SET_SOLANA_TOKEN_LIST (state, list = []) {
      const m = new Map()
      list.forEach(x => m.set(x.address, x))
      state.solanaTokenList = m
    },
    UPDATE_PRICE (state, payload) {
      Vue.set(state.priceMap, payload.symbol, payload)
    },
    SET_CANVAS_FINGERPRINT (state, id) {
      state.canvasFingerprint = id
    },
    SET_RESET_PARAM (state, payload) {
      state.resetParam = payload
    },
    SET_PAYMENT (state, payload) {
      state.paymentObj = payload
    },
    SET_CURR_SEND_INPUT (state, payload) {
      state.currSendInput = { ...state.currSendInput, ...payload }
    },
    CLEAR_CURR_SEND_INPUT (state) {
      state.currSendInput = null
    },
    SET_SPECIFIED_PUBKEY_BALANCES (state, payload) {
      Vue.set(state.balancesOfWalletList, payload.specifiedPubKey, payload.balanceList)
    },
    SET_ALLSUIOBJECTS (state, payload) {
      state.allSuiObjects = payload
    },
    SET_IS_RECORD_REFRESH (state, payload) {
      state.isRecordRefresh = payload
    },
    SET_ADDRESSINPUTS (state, { walletAddress, address }) {
      const result = state.addressInputs
      if (!result[walletAddress]) {
        Vue.set(state.addressInputs, walletAddress, [address])
      } else {
        const arr = result[walletAddress]
        if (!arr.includes(address)) {
          arr.unshift(address)
        } else {
          const index = arr.findIndex(val => val === address)
          arr.splice(index, 1)
          arr.unshift(address)
        }
        if (arr.length >= 4) {
          arr.pop()
        }
      }
      state.addressInputs = result
      localStorage.setItem('addressInputs', JSON.stringify(result))
    },
    SET_ISFIRSTTOEXTENSIONS (state, payload) {
      state.isFirstToExtensions = payload
      localStorage.setItem('isFirstToExtensions', payload)
    },
    SET_ISFIRSTTONFT (state, payload) {
      state.isFirstToNft = payload
      localStorage.setItem('isFirstToNft', payload)
    }
  },
  actions: {
    async syncWalletStorage ({ state, commit }, payload) {
      const pwd = payload.hdw.password
      const { keyring, hdw } = payload

      const tasks = [
        aesEncrypt3(JSON.stringify({ keyring, hdw }), pwd)
      ]
      if (payload.mmwNeedUpdate) {
        tasks.push(aesEncrypt3(pwd, hdw.mnemonic))
      }

      const [keyringData, mep] = await Promise.all(tasks)
      await Vue.prototype.$crmStorage.set({ keyringData, mep })

      if (payload.needUnlocked) {
        if (((!state.allWalletList) || !state.allWalletList) && !state.mainWallet) {
          return
        }
      }

      commit('SET_ALL_WALLET_LIST', keyring)
      commit('SET_MAIN_WALLET', hdw)
    },
    async getBalancesList ({ state, commit, dispatch }, options = {}) {
      if (state.balancesListPromise) {
        return state.balancesListPromise
      } else {
        const p = dispatch('_getBalancesList')
        commit('SET_BALANCES_LIST_PROMISE', p)
        const rp = await p
        if (!rp || rp.length === 0) {
          commit('SET_BALANCES_LIST_PROMISE', null)
        }
        return rp
      }
    },

    async _getBalancesList ({ commit, state, getters, dispatch }, options) {
      const specifiedPubKey = options && options.specifiedPubKey
      const updateBalanceList = options && options.updateBalanceList
      const address = specifiedPubKey || getters.pubKey

      const allObjects = await getters.fullnodeProvider.getObjectsOwnedByAddress(address)
      const allObjectIds = allObjects.map(item => {
        return item.objectId
      })

      const allTxObjects = []
      const rp = allObjectIds.length > 0 ? await getters.fullnodeProvider.getObjectBatch(allObjectIds) : []

      for (const objRes of rp) {
        const suiObj = objRes.status === 'Exists' ? objRes.details : undefined
        if (suiObj) {
          allTxObjects.push(objRes)
        }
      }
      commit('SET_ALLSUIOBJECTS', allTxObjects)

      const balancesListArr = []
      const NFTListArr = []

      rp.forEach((v, index) => {
        if (isCoin(v.details)) {
          const arg = getCoinTypeArg(v.details.data)
          // const decimals = getters.fullnodeProvider.getCoinDenominationInfo(arg).decimalNumber
          if (isSUI(v.details.data)) {
            balancesListArr.unshift({
              ...v.details.data,
              balance: v.details.data.fields.balance,
              symbol: 'SUI',
              logoURI: require('@/assets/img/sui.png'),
              address: getters.pubKey,
              decimals: getters.suiDecimals
            })
          } else {
            balancesListArr.push({
              ...v.details.data,
              balance: v.details.data.fields.balance,
              symbol: getCoinSymbol(arg),
              logoURI: '',
              address: getters.pubKey,
              decimals: 0
            })
          }
        // } else if (v.details.data.type === '0x2::devnet_nft::DevNetNFT') {
        } else if (hasPublicTransfer(v.details)) {
          NFTListArr.push(v.details.data)
        }
      })

      let balanceList = []
      if (balancesListArr.length > 0) {
        if (balancesListArr[0].symbol !== 'SUI') {
          balancesListArr.unshift({
            balance: 0,
            symbol: 'SUI',
            logoURI: require('@/assets/img/sui.png'),
            address: getters.pubKey,
            decimals: getters.suiDecimals
          })
        }
        balanceList = getNewGoodsList(balancesListArr)
      } else {
        balanceList = [{
          balance: 0,
          symbol: 'SUI',
          logoURI: require('@/assets/img/sui.png'),
          address: getters.pubKey,
          decimals: getters.suiDecimals
        }]
      }

      balanceList.forEach(v => {
        const amount = new BN(v.balance).dividedBy(BIG_TEN.pow(v.decimals))
        v.formateBalance = amount.toString(10)
      })

      if (specifiedPubKey) {
        commit('SET_SPECIFIED_PUBKEY_BALANCES', {
          specifiedPubKey,
          balanceList
        })
        return balanceList
      }

      if (updateBalanceList) {
        const nowBLStr = JSON.stringify(balanceList)
        const oldBLStr = JSON.stringify(state.balancesList)
        if (nowBLStr !== oldBLStr && address === getters.pubKey) {
          commit('SET_BALANCES_LIST', balanceList)
        }

        const nowNFTStr = JSON.stringify(NFTListArr)
        const oldNFTStr = JSON.stringify(state.collectible.nftList)
        if (nowNFTStr !== oldNFTStr && address === getters.pubKey) {
          commit('SET_NFT_LIST', NFTListArr)
        }
        return
      }

      if (address === getters.pubKey) {
        commit('SET_BALANCES_LIST', balanceList)
        if (NFTListArr.length > 0) {
          commit('SET_NFT_LIST', NFTListArr)
        }

        return balanceList
      }
    },
    async getPrice ({ state, commit, dispatch }, options = {}) {
    //   const { useCache = true } = options

    //   if (useCache && state.pricePromise) {
    //     return state.pricePromise
    //   } else {
    //     const p = dispatch('_getPrice', {
    //       ...options,
    //       chain: state.curChain
    //     })
    //     commit('SET_PRICE_PROMISE', p)
    //     const rp = await p
    //     if (rp.size === 0) {
    //       commit('SET_PRICE_PROMISE', null)
    //     }
    //     return rp
    //   }
    },
    // async _getPrice ({ state, getters, commit, dispatch }, options = {}) {
    //   try {
    //     await dispatch('getBalancesList', { chain: options.chain })
    //     const balancesList = options.balancesList || state.balancesList[options.chain]

    //     if (!balancesList.length === 0) {
    //       return state.priceMap
    //     }

    //     const symbols = balancesList.map(x => {
    //       return { symbol: x.symbol, mint: x.mintAddress }
    //     })
    //     const did = state.canvasFingerprint || await dispatch('getCanvasFingerprint')

    //     const pubkey = options.chain === 'eth' ? balancesList[0].address : balancesList[0].pubkey.toBase58()

    //     const { k, v } = aesEncrypt(pubkey)
    //     const rp = await Vue.prototype.$api.request('price.getPrice', {
    //       symbols,
    //       did,
    //       k,
    //       v,
    //       name: getters.curWallet.name,
    //       version: state.version,
    //       chain: options.chain === 'eth' ? 'ethereum' : 'solana'
    //     })

    //     if (rp.code === 200) {
    //       rp.data.forEach(x => {
    //         commit('UPDATE_PRICE', x)
    //       })
    //     }
    //     // state.balancesList.forEach((x) => {
    //     //   const u = priceMap.get(x.symbol.toLowerCase())?.usd
    //     //   const y = { ...x }
    //     //   if (x.amount > 0 && x.symbol !== 'Unknown' && u) {
    //     //     y.price = numberFormat(np.times(u, x.amount), '', 6)
    //     //     y.unitPrice = u
    //     //   }
    //     //   arr.push(y)
    //     // })
    //     // arr.length > 0 && commit('SET_BALANCES_LIST', arr)
    //     // return arr
    //   } catch (err) {
    //     console.log(err)
    //     // Vue.prototype.$toast({
    //     //   message: err.message,
    //     //   duration: 3000
    //     // })
    //   }

    //   return state.priceMap
    // },
    // async getTokenAccountsByOwner ({ state, getters, commit }, specifiedPubKey) {
    //   if (state.programAccountsPromise && !specifiedPubKey) {
    //     return state.programAccountsPromise
    //   }
    //   try {
    //     const conn = getters.conn
    //     const p = conn._rpcRequest('getTokenAccountsByOwner', [
    //       specifiedPubKey || getters.pubKey,
    //       { programId: TOKEN_PROGRAM_ID.toBase58() },
    //       { encoding: 'jsonParsed' }
    //     ])
    //     !specifiedPubKey && commit('SET_PROGRAM_ACCOUNTS_PROMISE', p)
    //     const rp = await p
    //     if (!rp || !rp.result || !rp.result.value || rp.result.value.length === 0) {
    //       !specifiedPubKey && commit('SET_PROGRAM_ACCOUNTS_PROMISE', null)
    //       return []
    //     }
    //     return rp.result.value
    //   } catch (err) {
    //     console.log(err)

    //     if (!specifiedPubKey) {
    //       commit('SET_PROGRAM_ACCOUNTS_PROMISE', null)

    //       if (err.message?.includes('429')) {
    //         err.message = 'Too requests from your IP'
    //       }
    //       Vue.prototype.$toast({
    //         message: err.message,
    //         duration: 3000
    //       })
    //     }
    //     return []
    //   }
    // },
    // async getTokenAccounts ({ state, getters, commit, dispatch }) {
    //   await dispatch('getBalancesList', { chain: state.curChain })
    //   const pbk = new PublicKey(getters.pubKey)
    //   const tokenAccounts = {}
    //   state.balancesList.slice(1).forEach(async tokenAccountInfo => {
    //     const tokenAccountPubkey = tokenAccountInfo.pubkey
    //     const tokenAccountAddress = tokenAccountPubkey.toBase58()
    //     const mintAddress = tokenAccountInfo.mint
    //     const balance = new TokenAmount(tokenAccountInfo.orgAmount, tokenAccountInfo.decimals)

    //     const ata = await findAssociatedTokenAddress(pbk, mintAddress)

    //     if (ata.equals(tokenAccountPubkey)) {
    //       tokenAccounts[mintAddress] = {
    //         tokenAccountAddress,
    //         balance
    //       }
    //     }
    //   })

    //   let solBalance = 0
    //   if (state.balancesList[0]) {
    //     solBalance = np.times(state.balancesList[0].amount, Math.pow(10, NATIVE_SOL.decimals))
    //   }
    //   tokenAccounts[NATIVE_SOL.mintAddress] = {
    //     tokenAccountAddress: getters.pubKey,
    //     balance: new TokenAmount(solBalance, NATIVE_SOL.decimals)
    //   }
    //   log('tokenAccounts', tokenAccounts)

    //   commit('SET_TOKEN_ACCOUNTS', tokenAccounts)
    // },

    async getCanvasFingerprint ({ commit }) {
      const fp = await FingerprintJS.load()
      const rp = await fp.get()
      commit('SET_CANVAS_FINGERPRINT', rp.visitorId)
      return rp.visitorId
    }
  },
  modules: {
    // ws,
    // liquidity,
    // stake,
    // jupiter,
    common,
    // eth,
    collectible
  }
  // plugins: [plugin]
})
