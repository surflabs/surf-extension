// import { chromeStorage } from '@/utils/common'
export default {
  state: {
    topSortNfts: JSON.parse(localStorage.getItem('topSortNfts')) || null,
    gridPattern: localStorage.getItem('gridPattern') || 2,
    nftId: '',
    nftList: [],
    isMint: Number(localStorage.getItem('isMint')) || 1,
    mintTimer: Number(localStorage.getItem('mintTimer')) || 0
  },
  mutations: {
    SET_TOPSORT_NFTS (state, { walletAddress, nfts, endpoint }) {
      // const curEndpoint = state.endpoint
      let sort = state.topSortNfts
      if (!sort || !sort[walletAddress]) {
        sort = Object.assign({}, sort, { [walletAddress]: {} })
        if (!sort[walletAddress][endpoint]) {
          sort[walletAddress] = Object.assign({}, sort[walletAddress], { [endpoint]: [] })
        }
      }
      sort[walletAddress][endpoint] = nfts
      state.topSortNfts = sort
      localStorage.setItem('topSortNfts', JSON.stringify(state.topSortNfts))
    },
    SET_NFTID (state, payload) {
      state.nftId = payload
    },
    SET_GRIDPATTERN (state, num) {
      state.gridPattern = num
      localStorage.setItem('gridPattern', num)
    },
    SET_NFT_LIST (state, payload) {
      state.nftList = payload
    },
    SET_ISMINT (state, payload) {
      state.isMint = payload
      localStorage.setItem('isMint', payload)
    },
    SET_MINTTIMER (state, payload) {
      state.mintTimer = payload
      localStorage.setItem('mintTimer', payload)
    }
  },
  actions: {
    setIsMint ({ state, commit }, options = {}) {
      const { time } = options
      const timer = setTimeout(() => {
        commit('SET_ISMINT', 1)
        clearTimeout(timer)
      }, time)
    }
  }
}
