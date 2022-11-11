export default {
  state: {
    isNeedNote: localStorage.getItem('isNeedNote'),
    showWalletList: false,
    showNoteTip: false,
    noMoreReminders: localStorage.getItem('noMoreReminders'),
    hasNoteInfo: localStorage.getItem('hasNoteInfo'),
    mwChildWalletList: null,
    routingDirection: 'forward',
    updateBalanceListInterval: null,
    currConnSite: '',
    trustedApps: {},
    hiddenBalances: localStorage.getItem('hiddenBalances')
  },
  mutations: {
    SET_SHOW_WALLET_LIST (state, payload) {
      state.showWalletList = payload
    },
    SET_SHOW_NOTETIP (state, payload) {
      state.showNoteTip = payload
    },
    SET_HAS_NOTE_INFO (state, payload) {
      state.hasNoteInfo = payload
      if (payload) {
        state.hasNoteInfo = payload
        localStorage.setItem('hasNoteInfo', payload)
      } else {
        localStorage.removeItem('hasNoteInfo')
      }
    },
    SET_MW_CHILDWALLET_LIST (state, payload) {
      // state.mwChildWalletList = payload
      state.mwChildWalletList = Object.assign({}, state.mwChildWalletList || {}, payload)
    },
    SET_ROUTING_DIRECTION (state, payload) {
      state.routingDirection = payload
    },
    SET_NO_MORE_REMINDERS (state, payload) {
      if (payload) {
        state.noMoreReminders = payload
        localStorage.setItem('noMoreReminders', payload)
      } else {
        localStorage.removeItem('noMoreReminders')
      }
    },
    SET_NEED_NOTE (state, payload) {
      if (payload) {
        state.isNeedNote = payload
        localStorage.setItem('isNeedNote', payload)
      } else {
        localStorage.removeItem('isNeedNote')
      }
    },
    SET_UPDATE_BALANCELIST_INTERVAL (state, payload) {
      state.updateBalanceListInterval = payload
    },
    SET_CURR_CONN_SITE (state, site) {
      state.currConnSite = site
    },
    SET_TRUSTED_APPS (state, payload) {
      state.trustedApps = payload
    },
    SET_HIDDEN_BALANCES (state, payload) {
      state.hiddenBalances = payload
      if (payload) {
        state.hiddenBalances = payload
        localStorage.setItem('hiddenBalances', payload)
      } else {
        localStorage.removeItem('hiddenBalances')
      }
    }
  },
  actions: {
    updateBalanceListInterval ({ commit, dispatch, rootState }) {
      const interval = setInterval(() => {
        dispatch('_getBalancesList', {
          updateBalanceList: 1
        })
      }, 10 * 1000)
      commit('SET_UPDATE_BALANCELIST_INTERVAL', interval)
    },
    clearBalanceListInterval ({ state }) {
      clearInterval(state.updateBalanceListInterval)
    }
  }
}
