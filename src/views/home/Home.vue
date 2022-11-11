<template>
  <div ref="ndMain" class="home"
    @mousedown="mousedown"
    @mousemove="mousemove"
    @mouseup="mouseup"
  >
    <div
      class="list-box"
      :style="{
        marginTop: -46 + scroll_load.top + 'px',
      }"
      ref="ndScrollTopElm"
    >
      <span v-if="scroll_load.state === 1">Pull down to refresh...</span>
      <span v-else-if="scroll_load.state === 2">Refresh after release...</span>
      <m-loading v-else-if="scroll_load.state === 3" size="16px" color="var(--text9-color)" />
    </div>

    <div class="hero">
      <div class="mui-fl-vert mui-fl-btw">
        <img :src="walletIcon" alt="" class="img-wallet">
        <div class="mui-fl-vert airdrop taplight" @click="airDrop">
          <i v-if="!airDropLoading" class="mico-airdrop" />
          <m-loading v-else size="18px" color="var(--text9-color)" />
          <span>{{ airDropLoading ? 'Request' : 'Airdrop'}}</span>
        </div>
      </div>
      <div class="mui-fl-vert mui-fl-btw wallet">
        <p class="t1 mui-fl-vert">
          My Wallet
          <i :class="{ 'taplight': 1, 'mico-invisible': hiddenBalances, 'mico-visible': !hiddenBalances }" @click="switchHiddenBalance"></i>
        </p>
        <p class="pubkey mui-fl-vert taplight" @click="copyPubKey">
          <span>{{ pubKey | formatPubKey }}</span>
          <i class="mico-copy" />
          <input type="text" v-model="pubKey" ref="ndIptPubKey" class="ipt-hidden">
        </p>
      </div>
      <div class="balance">
        <template v-if="suiBalance !== ''">
          {{ hiddenBalances ? '******' : suiBalance }}
        </template>
        <m-loading v-else color="var(--text4-color)" size="32px" />
        <!-- <m-loading color="var(--text4-color)" size="30px" /> -->
      </div>
    </div>

    <div class="hero-action mui-fl-btw">
      <button
        class="hero-btn taplight2 mui-fl-col mui-fl-central"
        @click="toSend"
      >
        <i class="mico-send" />Send
      </button>
      <button
        class="hero-btn taplight2 mui-fl-col mui-fl-central"
        @click="toReceive"
      >
        <i class="mico-receive" />Receive
      </button>
      <button
        class="hero-btn taplight2 mui-fl-col mui-fl-central"
        @click="handleTip"
      >
        <i class="mico-swap" />Swap
      </button>
      <button
        class="hero-btn taplight2 mui-fl-col mui-fl-central"
        @click="handleTip"
      >
        <i class="mico-stake" />Staking
      </button>
    </div>
    <template v-if="isFirstToExtensions === true || isFirstToExtensions === 'true'">
      <div class="firstcome">
        <p class="t1">Welcome! Let's get you started</p>
        <ul class="mui-fl-vert">
          <li class="mui-fl-1">
            <p class="p1">Token</p>
            <p class="p2">Send & Receive</p>
            <p class="mui-fl-btw mui-fl-vert p3 taplight2" @click="handleClose">
              <span>MORE</span>
              <i class="mico-arrow-right1"></i>
            </p>
            <i class="mico-close icon-close taplight2" @click="handleClose" />
          </li>
          <li class="mui-fl-1">
            <p class="p1">NFTS</p>
            <p class="p2">Collections</p>
            <p class="mui-fl-btw mui-fl-vert p3 taplight2" @click="toNFT">
              <span>MORE</span>
              <i class="mico-arrow-right1"></i>
            </p>
            <i class="mico-close icon-close taplight2" @click="handleClose" />
          </li>
        </ul>
      </div>
    </template>

    <template v-else>
      <div class="mui-nav marg-t home-title mui-fl-vert">
        <span class="pg-title1 mui-fl-1">Assets</span>
      </div>
      <ul class="tk-list">
        <li v-for="(item, idx) of _balancesList" :key="idx" class="taplight" @click="viewToken($event, item)">
          <div class="item mui-fl-vert">
            <m-image
              v-if="item.logoURI"
              class="sty1-image mui-shr-0"
              width="32"
              height="32"
              :src="item.logoURI"
              :loading-icon="darkMode ? placMapIconDark : placMapIcon"
              :error-icon="darkMode ? failMapIconDark : failMapIcon"
              />
            <i
              v-else
              :class="['ico', 'mui-shr-0', item.logoURI ? '' : 'unknown']"
            />
            <div class="mui-fl-1">
              <h3 class="t txt-ovfl-row row2">{{ item.symbol || item.name }}</h3>
            </div>
            <div class="mui-shr-0">
              <p class="t1">
                <template v-if="hiddenBalances">******</template>
                <template v-else>{{ item.formateBalance | formatBalance }}</template>
              </p>

              <p class="t2">{{ hiddenBalances ? '******' : convertUSDT(item) }}</p>
            </div>
          </div>
        </li>
      </ul>
    </template>
    <!-- <div class="nos-tip mui-fl-vert mui-fl-btw" v-show="suiBalance0 === 0">
      <p class="mui-fl-1">You are currently on Devnet. You can go to Sui's<br> discord community to get airdrop tokens.</p>
      <p class="r taplight mui-shr-0" @click="toGet">Get</p>
    </div> -->

    <div class="nos-tip mui-fl-vert mui-fl-btw" v-show="expiredApps.length > 0">
      <p class="mui-fl-1">Certain trusted apps have not been used<br>for significant time periods. Would you like<br>to remove their authorizations?</p>
      <p class="r taplight mui-shr-0" @click="removeExpiredApps">Remove</p>
    </div>

    <BackToTop :target-node="$refs.ndScrollTopElm" :scroll-container="$refs.ndMain" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import BigNumber from 'bignumber.js'
import BackToTop from '../../components/back-to-top'
import { sleep } from '../../utils/common'
import { placeIcon } from '../../utils/mixin'
import axios from 'axios'

export default {
  name: 'Home',
  mixins: [placeIcon],
  components: { BackToTop },
  data () {
    return {
      loading: true,
      needRefresh: false,
      scroll_load: {
        top: 0,
        startY: 0,
        touching: false,
        state: 0,
        scrolltop: true
      },
      needNoSolTip: true,
      isShowBuy: true,

      expiredApps: [],
      airDropLoading: false
      // updateBalanceListInterval: null
    }
  },
  computed: {
    ...mapState(['endpoint', 'priceMap', 'isFirstToExtensions']),

    ...mapState({
      updateBalanceListInterval: ({ common }) => common.updateBalanceListInterval,
      trustedApps: ({ common }) => common.trustedApps,
      hiddenBalances: ({ common }) => common.hiddenBalances
    }),

    ...mapGetters(['pubKey', 'curAccount', 'gatewayProvider']),
    ...mapGetters({
      balancesList: 'filterBalancesList'
    }),

    _balancesList () {
      return this.balancesList || []
    },

    suiBalance () {
      return this.balancesList.length > 0 ? this.balancesList[0].formateBalance : ''
    },
    amount () {
      return this.balancesList.length > 0 ? this.balancesList[0].balance : ''
    },
    scrollerheight () {
      return this.scroll_load.top.toString() + 'px'
    },
    dependenciesParams () {
      const { pubKey, endpoint } = this
      return { pubKey, endpoint }
    },
    walletIcon () {
      return (this.walletIconList[this.curAccount.index % 12] || {}).icon
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$nextTick(() => {
        const prevScrY = to.meta.saveScrollY
        if (prevScrY) {
          vm.$refs.ndMain.scrollTop = prevScrY
        }
      })
      if (vm.needRefresh || vm.$store.state.balancesListPromise === null) {
        vm.fetchData()
      }
    })
  },
  beforeRouteLeave (to, from, next) {
    this.$route.meta.saveScrollY = this.$refs.ndMain.scrollTop
    next()
  },
  async created () {
    // eslint-disable-next-line no-undef
    // console.log(BigInt(10000))
    // console.log('asd', this.gatewayProvider.getCoinDenominationInfo('0x2::sui::SUI'))
    if (this.$route.name === 'home') {
      // this.fetchData()
      // this.$store.dispatch('getJupiterRouteMap')
      // this.getPaymentList()
    }

    this.$store.dispatch('updateBalanceListInterval')
  },
  watch: {
    dependenciesParams (val) {
      this.needRefresh = true
      if ((val.pubKey || val.endpoint) && this.$route.name === 'home') {
        this.fetchData()
        this.checkExpiredApps()
      }
    },
    trustedApps () {
      this.checkExpiredApps()
    }
  },
  methods: {
    async checkExpiredApps () {
      this.expiredApps = []
      this.$store.commit('SET_CURR_CONN_SITE', '')

      const curDate = Date.now()

      Object.entries(this.trustedApps[this.pubKey] || {}).forEach(([origin, val]) => {
        if (curDate > val.expiry) {
          this.expiredApps.push(origin)
        }
      })
    },
    async removeExpiredApps () {
      this.expiredApps.forEach(x => {
        delete this.trustedApps[this.pubKey][x]
      })
      await this.$crmStorage.set({ trustedApps: this.trustedApps })
      this.expiredApps = []
      this.$message({
        message: 'Success',
        iconClass: 'mico-success',
        customClass: 'sty1-message',
        duration: 1500,
        offset: 270,
        center: true
      })
    },
    // toGet () {
    //   chrome.tabs.create({ url: 'https://discord.com/invite/sui' })
    // },
    copyPubKey () {
      this.$refs.ndIptPubKey.select()
      document.execCommand('copy')
      this.$message({
        message: 'Copy Success',
        iconClass: 'mico-success',
        customClass: 'sty1-message',
        duration: 1000,
        offset: 270,
        center: true
      })
    },
    switchHiddenBalance () {
      this.$store.commit('SET_HIDDEN_BALANCES', !this.hiddenBalances)
    },
    buySOL () {
      this.$router.push('/purchase-methods')
    },
    async fetchData (refresh) {
      this.needRefresh = false

      this.loading = true
      const task = [
        this.$store.dispatch('_getBalancesList')
      ]
      if (refresh) {
        task.push(...[
          this.scrollTo(this.scroll_load.top, 40),
          sleep(500)
        ])
      }
      await Promise.all(task)
      refresh && await this.scrollTo(this.scroll_load.top, 0)

      this.loading = false
      this.scroll_load.top = 0
      this.scroll_load.state = 0
    },
    viewToken (e, token) {
      var diff = e.pageY - this.scroll_load.startY
      if (this.scroll_load.state === 1 && diff > 10 && this.$refs.ndMain.scrollTop <= 0) {
        e.preventDefault()
        return
      }
      this.$store.commit('SET_CURR_VIEW_TOKEN', token)
      this.$router.push({ name: 'tokenRecord' })
    },
    convertUSDT (token) {
      if (typeof token.symbol !== 'string') return '–'
      const { usd } = this.priceMap[token.symbol.toLowerCase()] || {}
      const BN = BigNumber.clone({ ROUNDING_MODE: 1, DECIMAL_PLACES: 6 })
      if (usd && token.amount > 0) {
        const tokenAsUsd = new BN(token.amount).times(usd).toString(10)
        return `$${new BN(tokenAsUsd).toFormat()}`
      }
      return '–'
    },
    toSend () {
      this.$router.push('/sendpage')
    },
    toReceive () {
      this.$store.commit('SET_LASTTIME_SEND', this._balancesList[0])
      this.$router.push({
        path: '/Receivesqrcode',
        query: { symbol: 'SUI' }
      })
    },
    toReceiveSOL () {
      this.$store.commit('SET_LASTTIME_SEND', this._balancesList[0])
      this.needNoSolTip = false
      this.$router.push('/Receivesqrcode')
    },
    mousedown (e) {
      if (this.loading || this.scroll_load.state === 3 || this.$refs.ndMain.scrollTop > 0) {
        return
      }
      this.scroll_load.startY = e.pageY
      this.scroll_load.touching = true
      this.scroll_load.state = 1
    },
    mousemove (e) {
      if (!this.scroll_load.touching) return
      var diff = e.pageY - this.scroll_load.startY
      if (diff > 0) {
        e.preventDefault()
      } else {
        return
      }
      this.scroll_load.top = Math.floor(diff * 0.25)
      // console.log('top: ', this.scroll_load.top)
      if (this.scroll_load.top >= 40) {
        this.scroll_load.state = 2
      } else {
        this.scroll_load.state = 1
      }
    },
    async mouseup (e) {
      // console.log('touchend', e, e.pageY)
      this.scroll_load.touching = false
      if (this.scroll_load.state === 3) {
        return
      }
      if (this.scroll_load.top >= 40) {
        this.refresh()
      } else {
        await this.scrollTo(this.scroll_load.top, 0, 10)
        this.scroll_load.state = 0
      }
      // console.log('touchEnd')
    },
    refresh () {
      // console.log('refresh')
      this.$store.commit('SET_BALANCES_LIST_PROMISE', null)
      this.$store.commit('SET_PROGRAM_ACCOUNTS_PROMISE', null)
      this.$store.commit('SET_PRICE_PROMISE', null)
      // this.scroll_load.top = 40
      this.scroll_load.state = 3
      this.fetchData(true)
    },
    scrollTo (current, target, duration = 14) {
      let top = current
      let start = 0
      const change = current - target

      return new Promise(resolve => {
        const step = () => {
          start++
          top = this.easeOutQuad(start, current, change, duration)
          this.scroll_load.top = top
          if (top > target && start <= duration) {
            requestAnimationFrame(step)
          } else {
            resolve()
          }
        }
        step()
      })
    },
    easeOutQuad (t, b, c, d) {
      return c * (t /= d) * (t - 2) + b
    },
    handleTip () {
      this.$message({
        message: 'Coming soon',
        iconClass: 'mico-warn',
        customClass: 'sty1-message',
        duration: 2000,
        offset: 270,
        center: true
      })
    },
    async airDrop () {
      if (this.airDropLoading) return
      this.airDropLoading = true
      try {
        const rp = await axios.post(process.env.VUE_APP_API_ENDPOINT_DEV_NET_FAUCET + 'gas', {
          FixedAmountRequest: { recipient: this.pubKey }
        })
        if (rp.data.error) {
          throw new Error('Request fail!')
        }
        await this.$store.dispatch('_getBalancesList')
        this.$message({
          message: 'Success',
          iconClass: 'mico-success',
          customClass: 'sty1-message',
          duration: 2000,
          offset: 270,
          center: true
        })
        this.$store.commit('SET_IS_RECORD_REFRESH', true)
      } catch (e) {
        const status = e.response && e.response.status
        this.$message({
          message: status === 429 ? 'Request limited reached. Please <br>try again later.' : 'Fail',
          iconClass: status === 429 ? 'mico-warn' : 'mico-error',
          customClass: 'sty1-message',
          duration: 2000,
          offset: 270,
          center: true,
          dangerouslyUseHTMLString: true
        })
      } finally {
        this.airDropLoading = false
      }
    },
    handleClose () {
      this.$store.commit('SET_ISFIRSTTOEXTENSIONS', false)
    },
    toNFT () {
      this.handleClose()
      this.$router.push('/collectibles')
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/_home.scss" scoped></style>
