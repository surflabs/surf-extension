<template>
  <header class="mui-header mui-shr-0 mui-fl-central">
    <template v-if="!isLoginExpired" >
      <div v-if="!hiddenLeftMenu" class="menu mico-lock taplight2 mui-shr-0" @click="lock" />

      <div :class="{ 'mui-header-content mui-fl-central': 1, 'taplight2': !isSignTxPage }" @click="handleClkShowWalList">
        <img :src="walletIcon" alt="">
        <h1 class="t txt-ovfl nopadd">{{ curAccount.name }}</h1>
        <i v-show="!isSignTxPage" class="mico-arrow-down icon-arrow-down" />
      </div>

      <div v-if="!isConnectPage && !isSignTxPage" :class="{ 'mui-shr-0 conn': 1}">
        <p :class="{ 'conn-icons': 1, active: currConnSite }">
          <i class="mico-link"></i>
          <i v-if="currConnSite" :class="{'icon-connect-sty': 1, 'connect': currConnSite}"></i>
        </p>
        <div class="popover">
          <!-- <p class="t1 txt-ovfl nopadd mui-fl-vert">
            <i class="mico-link"></i>
            <span>{{ currConnSite || 'Not Connected' | getHostname }}</span>
          </p> -->
          <div class="t1">
            <div class="mui-fl-vert" style="overflow: hidden;">
              <p class="icons">
                <i class="link-icon mico-link"></i>
                <i v-if="currConnSite" :class="{'icon-connect-sty': 1, 'connect': currConnSite}"></i>
              </p>
              <p class="txt-ovfl nopadd">{{ currConnSite || 'Not Connected' | getHostname }}</p>
            </div>
          </div>
          <p class="t2">
            <router-link to="/trusted-apps" tag="div" class="trusted-btn taplight">Trusted Apps</router-link>
          </p>
        </div>
      </div>

      <bottom-aside v-model="showWalletList" />
      <note v-model="showNoteTip" />
    </template>

    <template v-else-if="showSurfLogo">
      <img src="~@/assets/img/surf-logo2.png" alt="" class="img-surf-logo2">
    </template>
  </header>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import BottomAside from './BottomAside.vue'
import Note from './Note.vue'

import mixin from './mixin'
import { placeIcon } from '@/utils/mixin'

export default {
  name: 'Header',
  mixins: [mixin, placeIcon],
  components: { BottomAside, Note },
  data () {
    return {
      show: false
    }
  },
  computed: {
    ...mapState(['accounts']),
    ...mapState({
      _showWalletList: ({ common }) => common.showWalletList,
      _showNoteTip: ({ common }) => common.showNoteTip,
      _hasNoteInfo: ({ common }) => common.hasNoteInfo,
      currConnSite: ({ common }) => common.currConnSite,
      trustedApps: ({ common }) => common.trustedApps
    }),

    ...mapGetters(['pubKey', 'curAccount', 'isLoginExpired']),

    allWalletlistLength () {
      const length = this.accounts ? this.accounts.length : 0
      return length
    },

    walletIcon () {
      return (this.walletIconList[this.curAccount.index % 12] || {}).icon
    },

    // walName () {
    //   console.log('curAccount', this.curAccount)
    //   return this.curAccount.name
    // },

    showWalletList: {
      get () {
        return this._showWalletList
      },
      set (val) {
        this.$store.commit('SET_SHOW_WALLET_LIST', val)
      }
    },
    showNoteTip: {
      get () {
        return this._showNoteTip
      },
      set (val) {
        this.$store.commit('SET_SHOW_NOTETIP', val)
      }
    },
    hasNoteWallet () {
      return this.accounts.filter(x => x.isNeedNote).length > 0
    },
    preShowNote () {
      const hasNoteInfo = JSON.parse(this._hasNoteInfo) || {}
      return hasNoteInfo && hasNoteInfo.isShow && hasNoteInfo.num <= 3 && !this.isLoginExpired && this.hasNoteWallet
    },
    hiddenLeftMenu () {
      if (this.$route.name === 'connect' || this.$route.name === 'signTx') {
        return true
      }
      return false
    },

    showSurfLogo () {
      return this.$route.name === 'resetPwdVerify' || this.$route.name === 'resetNewPwd'
    }
  },
  watch: {
    preShowNote (n, o) {
      this.showNoteTip = n
    },
    trustedApps () {
      this.checkTrustedApps()
    },
    pubKey () {
      this.checkTrustedApps()
    }
  },
  async created () {
    this.showNoteTip = this.preShowNote

    const { trustedApps = {} } = await this.$crmStorage.get('trustedApps')
    this.$store.commit('SET_TRUSTED_APPS', trustedApps)
  },
  methods: {
    async checkTrustedApps () {
      this.$store.commit('SET_CURR_CONN_SITE', '')

      const queryOptions = { active: true, currentWindow: true }

      chrome.tabs.query(queryOptions, tabs => {
        const url = tabs[0]?.url

        if (typeof url === 'string') {
          const [origin] = Object.entries(this.trustedApps[this.pubKey] || {}).find(([org]) => {
            return url.indexOf(org) === 0
          }) || []
          origin && this.$store.commit('SET_CURR_CONN_SITE', origin || '')
        }
      })
    },
    handleClkShowWalList () {
      if (!this.isSignTxPage) {
        this.showWalletList = true
      }
    },
    async lock () {
      this.$store.commit('SET_ALL_WALLET_LIST', [])
      this.$store.commit('SET_MAIN_WALLET', null)
      this.$store.commit('SET_LOGIN_EXPIRY', 0)
      this.$router.replace('/login')
      this.$store.dispatch('clearBalanceListInterval')
    }
  }
}
</script>

<style lang="scss" scoped>
.mui-header {
  position: fixed;
  z-index: 1000;
  box-sizing: border-box;
  width: 375px;
  .menu {
    position: absolute;
    left: 24px;
    font-size: 24px;
    color: var(--text1-color);
    margin-right: 14px;
  }
  .t {
    font-weight: 500;
    font-size: 16px;
    line-height: 22px;
    color: var(--text1-color);
  }
  .flow {
    height: 26px;
    line-height: 26px;
    border: 1px solid var(--border-color);
    border-radius: 64px;
    padding: 0 12px;
    color: var(--text3-color);
    margin-left: 4px;
    .copytip {
      position: fixed;
      top: 64px;
      width: 133px;
      height: 30px;
      margin-left: -18px;
      background: var(--clip-color);
      border-radius: 6px;
      line-height: 30px;
      color: var(--text6-color);
      z-index: 2;
      text-align: center;
    }
  }
  // .pubkey {
  //   position: absolute;
  //   opacity: 0;
  //   z-index: -1;
  // }
  .conn {
    position: absolute;
    right: 24px;
    width: 24px;
    height: 24px;
    cursor: pointer;
    .conn-icons {
      .mico-link {
        font-size: 24px;
        color: var(--text1-color);
        position: absolute;
        right: 0;
        bottom: 0;
      }
      .icon-connect-sty {
        position: absolute;
        right: 0;
        bottom: 1px;
        font-size: 12px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #1BD1A8;
      }
      &.active {
        .icon-connect-sty {
          color: var(--toast-success-color);
        }
      }
    }
    &:hover {
      .popover {
        visibility: visible;
        opacity: 1;
      }
    }
  }
  .popover {
    position: absolute;
    z-index: 99;
    top: 32px;
    right: -8px;
    width: 108px;
    background: #757B7B;
    padding: 12px 11px;
    border-radius: 10px;
    box-sizing: border-box;
    cursor: default;
    visibility: hidden;
    opacity: 0;
    // border: 1px solid var(--border-color);
    transition: all .3s .2s;
    &::before {
      content: "";
      position: absolute;
      top: -8px;
      right: 16px;
      border-width: 4px 5px;
      border-style: solid;
      border-color: transparent;
      border-bottom-color: #757B7B;
      z-index: 2;
    }
    &::after {
      content: "";
      position: absolute;
      top: -10px;
      right: 15px;
      border-width: 5px 6px;
      border-style: solid;
      border-color: transparent;
      border-bottom-color: var(--border-color);
      z-index: 1;
    }
    .t1 {
      height: 14px;
      margin-bottom: 8px;
      > div {
        width: 200%;
        height: 28px;
        color: #FFFFFF;
        font-size: 20px;
        line-height: 28px;
        transform: scale(0.5);
        transform-origin: 0 0;
        .icons {
          position: relative;
          margin-right: 8px;
          .link-icon {
            font-size: 24px;
          }
          .icon-connect-sty {
            position: absolute;
            right: 1px;
            bottom: 4px;
            font-size: 12px;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #1BD1A8;
          }
        }
      }
    }
    .t2 {
      height: 22px;
      margin-left: 2px;
    }
  }
}

.trusted-btn {
  display: inline-block;
  font-weight: 500;
  font-size: 20px;
  line-height: 28px;
  padding: 8px 24px;
  border-radius: 40px;
  transform: scale(0.5);
  color: #fff;
  cursor: pointer;
  background-color: #3AD0FC;
  white-space: nowrap;
  transform-origin: 0 0;
}

.mui-header-content {
  overflow: hidden;
  max-width: 50%;
  img {
    width: 22px;
    height: 22px;
    margin-right: 6px;
  }
  .icon-arrow-down {
    font-size: 12px;
    color: var(--text1-color);
    margin-left: 6px;
  }
}

.img-surf-logo2 {
  width: 65px;
}
</style>
