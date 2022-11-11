<template>
  <div ref="ndMain" class="sty3-cell mui-fl-col">
    <!-- <div class="mui-nav mui-fl-vert">
      <h5 class="pg-title1 mui-fl-1">Records</h5>
    </div> -->
    <div class="mui-fl-col mui-nav">
      <h1 class="pg-title1" v-if="$route.name === 'record'">Recent Activity</h1>
      <h1 class="pg-title1" v-else @click="backoff">
        <i class="mico-arrow-right-sty1"/>
      </h1>
      <!-- <h1 class="pg-title1 taplight2" v-else @click="backoff">
        <i class="mico-arrow-right-sty1"/>
        <m-image
          v-if="currViewToken && currViewToken.logoURI"
          class="tilteimg sty1-image mui-shr-0"
          width="20"
          height="20"
          :src="currViewToken.logoURI"
          :loading-icon="darkMode ? placMapIconDark : placMapIcon"
          :error-icon="darkMode ? failMapIconDark : failMapIcon"
          />
        <i  v-else-if="!currViewToken.logoURI" :class="['ico', 'tilteimg', 'mui-shr-0', currViewToken.logoURI ? '' : 'unknown']" />
        {{ currViewToken ? currViewToken.symbol : '' }}
      </h1> -->
    </div>
    <div class="scroll-view mui-fl-1" ref="ndScrContent">
      <div ref="ndScrollTopElm" />
      <div v-show="$route.name === 'tokenRecord'" class="top-box">
        <div class="mui-fl-central token-img">
          <m-image
            v-if="currViewToken.logoURI"
            class="sty1-image mui-shr-0"
            width="48"
            height="48"
            :src="currViewToken.logoURI"
            :loading-icon="darkMode ? placMapIconDark : placMapIcon"
            :error-icon="darkMode ? failMapIconDark : failMapIcon"
            />
          <i v-else :class="['ico', 'mui-shr-0', currViewToken.logoURI ? '' : 'unknown']" />
        </div>
        <p class="c1">{{ currViewToken.formateBalance }}</p>
        <!-- <p>{{ convertUSDT(currViewToken) }}</p> -->
        <p class="c2">-</p>
        <div class="hero-action marg-sty1 mui-fl-central">
          <button
            class="hero-btn taplight2 mui-fl-col mui-fl-central"
            @click="toSend"
          >
            <i class="mico-send" />Send
          </button>
          <button
            class="hero-btn taplight2 mui-fl-col mui-fl-central marg-l"
            @click="toReceive"
          >
            <i class="mico-receive" />Receive
          </button>
        </div>

        <div class="mui-nav marg-t mui-fl-vert">
          <span class="pg-title1 mui-fl-1">Transaction Records</span>
        </div>
      </div>

      <div
        :style="{minHeight: $route.name === 'tokenRecord' ? 'calc(100% - 316px)' : 'calc(100% - 64px)'}"
        @mousedown="mousedown"
        @mousemove="mousemove"
        @mouseup="mouseup"
      >
        <div style="overflow: hidden">
          <div
            v-show="scroll_load.top > 0"
            class="list-box"
            :style="{ marginTop: -40 + scroll_load.top + 'px' }"
          >
            <span v-if="scroll_load.state === 1">Pull down to refresh...</span>
            <span v-else-if="scroll_load.state === 2">Refresh after release...</span>
            <m-loading
              v-else-if="scroll_load.state === 3"
              size="16px"
              color="var(--text9-color)"
            />
          </div>
        </div>
        <div ref="ndListRef">
          <m-list
            v-if="listVisible"
            v-model="loading"
            :finished="finished"
            finished-text=" "
            loading-text=" "
          >
            <ul>
              <!-- <li v-for="(r, index) of list" :key="index">
                <ul> -->
                  <!-- <p class="list-date">{{ r.date }}</p> -->
                  <li v-for="(item, index) of list" :key="index" :class="{'list': !item.isDate}">
                    <p v-if="item.isDate" class="list-date">{{ item.date }}</p>
                    <div class="mui-fl-vert list-item" v-else  @click="toExplorer(item)">
                      <i v-if="$route.name === 'tokenRecord'" :class="['token-icon', 'mui-fl-central', item.typeTxt.includes('NFT') ? 'blue mico-record-nft' : item.typeTxt.includes('Received') ? 'green mico-record-receive' : item.typeTxt.includes('Sent') ? 'red mico-record-pay' : 'blue mico-record-success']"></i>
                      <div v-else class="img-box">
                        <!-- <i v-if="item.typeTxt.includes('Trading')" :class="['icon', 'mui-fl-central', 'mico-record-nft']" /> -->
                        <div class="coin-box">
                          <i v-if="item.typeTxt.includes('NFT')" class="icon mui-fl-central mico-record-nft"></i>
                          <!-- <img v-else src="~@/assets/img/sui.png" alt="sui-logo"> -->
                          <div v-else class="mui-fl-central sty6-gp">
                            <m-image
                              v-if="item.logoURI"
                              class="sty1-image mui-shr-0"
                              width="32"
                              height="32"
                              :src="item.logoURI"
                              :loading-icon="darkMode ? placMapIconDark : placMapIcon"
                              :error-icon="darkMode ? failMapIconDark : failMapIcon"
                              />
                            <i v-else :class="['ico', 'mui-shr-0', item.logoURI ? '' : 'unknown']" />
                          </div>
                          <i :class="['coin', 'mui-fl-central', item.typeTxt.includes('Sent') ? 'red mico-record-pay' : item.typeTxt.includes('Received') ? 'green mico-record-receive' : 'blue mico-record-success']" />
                        </div>
                      </div>
                      <div class="mui-fl-vert mui-fl-btw content-box">
                        <ul class=" mui-fl-col top-c">
                          <li>
                            {{ item.typeTxt }}
                            <e-popover
                              v-show="item.status !== 'success'"
                              placement="top"
                              trigger="hover"
                              popper-class="sty1-popover">
                              <p>{{ item.status | upperCase }}</p>
                              <template slot="reference">
                                <i class="mico-warn-sign mui-shr-0 taplight2" />
                              </template>
                            </e-popover>
                          </li>
                          <li v-if="item.typeTxt.includes('Trading') || ($route.name === 'tokenRecord' && item.typeTxt.includes('NFT-Sent'))">
                            Gas Fee: {{ item.gasFee }} SUI
                          </li>
                          <li v-else-if="item.type === 'PaySui'">
                            Receive
                          </li>
                          <li v-else>{{ item.typeTxt.includes('Sent') ? 'To' : 'From' }}: {{ (item.typeTxt.includes('Sent') ? item.recipient : item.sender) | formatPubKey(4, 4) }}</li>
                        </ul>
                        <ul class="mui-fl-vert mui-fl-btw">
                          <li v-show="item.amount" :class="[pubKey === item.sender ? 'red del-color' : 'add-color', 'no-bg']">{{ pubKey === item.sender ? '-' : '+' }}{{ item.amount | formatBalance }}</li>
                          <!-- <li>{{ item.timestamp | timestampDate }}</li> -->
                          <!-- <li>TXID:{{ item.txId | formatPubKey(4, 4) }}</li> -->
                        </ul>
                      </div>
                    </div>
                  <!-- </li>
                </ul> -->
              </li>
            </ul>

            <template #loading>
              <m-loading
                v-show="scroll_load.state !== 3"
                :class="{ 'top-gap': list.length === 0 }"
                color="var(--text9-color)"
                :size="list.length === 0 ? '30px' : '16px'"
              />
            </template>
          </m-list>
          <div v-else>
            <no-list :class="[$route.name === 'tokenRecord' ? 'inner-mar' : '']" :txt="txt" :network-error="networkError" />
          </div>
        </div>
      </div>
    </div>
<!--
    <div class="nos-tip mui-fl-vert mui-fl-btw" v-show="needNoSolTip">
      <p class="mui-fl-1">You need to deposit SUI in order to pay for<br> transactions</p>
      <p class="r taplight mui-shr-0" @click="toReceiveSOL">Receive</p>
    </div> -->

    <!-- <BackToTop :target-node="$refs.ndScrollTopElm" :scroll-container="$refs.ndScrContent" :bottom="this.$route.name === 'tokenRecord' ? '32px' : ''" /> -->
  </div>
</template>

<script>
import BigNumber from 'bignumber.js'
import NoList from '@/components/no-list'
// import BackToTop from '../../components/back-to-top'
import { placeIcon } from '../../utils/mixin'
import { sleep } from '@/utils/common'
import { mapGetters, mapState } from 'vuex'
import { isCoin, getCoinTypeArg, getCoinSymbol } from '@/utils/sui'

export const BIG_TEN = new BigNumber(10)
const BN = BigNumber.clone({ ROUNDING_MODE: 1, DECIMAL_PLACES: 9 })

export default {
  name: 'Record',
  mixins: [placeIcon],
  components: {
    NoList
    // BackToTop
  },
  data () {
    return {
      list: [],
      allTxIds: [],
      index: 0,
      dataLength: 0,
      listVisible: true,
      loading: true,
      finished: false,
      needRefresh: false,
      listLoading: true,
      scroll_load: {
        top: 0,
        startY: 0,
        touching: false,
        state: 0,
        scrolltop: true
      },
      needNoSolTip: false,

      networkError: false,
      txt: 'No Records'
    }
  },
  computed: {
    ...mapGetters(['pubKey', 'fullnodeProvider', 'suiDecimals']),
    ...mapState({
      currViewToken: (state) => state.currViewToken || {},
      allSuiObjects: (state) => state.allSuiObjects || [],
      isRecordRefresh: 'isRecordRefresh'
    }),
    ...mapGetters({
      balancesList: 'filterBalancesList'
    }),
    dependenciesParams () {
      const { pubKey, endpoint } = this
      return { pubKey, endpoint }
    }
  },
  beforeRouteEnter (to, from, next) {
    next(async vm => {
      if (vm.needRefresh) {
        vm.fetchList()
      }
      vm.$nextTick(() => {
        const prevScrY = to.meta.saveScrollY
        if (prevScrY && to.name !== 'tokenRecord') {
          vm.$refs.ndScrContent.scrollTop = prevScrY
        }
      })

      document.removeEventListener('scroll', vm.ndScroll, true)
      document.addEventListener('scroll', vm.ndScroll, true)
    })
  },
  beforeRouteLeave (to, from, next) {
    if (this.$route.name !== 'tokenRecord') {
      this.$route.meta.saveScrollY = this.$refs.ndScrContent.scrollTop
    }
    document.removeEventListener('scroll', this.ndScroll, true)
    next()
  },
  filters: {
    upperCase (str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    },
    formatDate (timestamp) {
      const time = new Date(Number(timestamp))
      const Y = time.getFullYear()
      const M = time.getMonth()
      const d = time.getDate() < 10 ? '0' + time.getDate() : time.getDate()
      const arr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
      // return Y + '-' + M + '-' + d
      return arr[M] + ' ' + d + ', ' + Y
    }
  },
  async created () {
    // console.log('currentToken: ', this.currViewToken)
    const { crmrecord } = await this.$crmStorage.get('crmrecord')
    if (crmrecord?.currPubkey === this.pubKey && this.$route.name !== 'tokenRecord') {
      this.tmdatalist = crmrecord.data
      this.scroll_load.top = 40
      this.scroll_load.state = 3
    }

    if (!this.allSuiObjects.length) {
      await this.$store.dispatch('getBalancesList')
    }
    this.fetchList()
  },
  watch: {
    async dependenciesParams (val) {
      this.allTxIds = []
      this.list = []
      this.needRefresh = true
      this.loading = true
      this.finished = false
      this.listVisible = true
      this.index = 0
      if ((val.pubKey || val.endpoint) && this.$route.name === 'record') {
        this.fetchList()
      }
    },
    isRecordRefresh () {
      if (this.isRecordRefresh) {
        this.listVisible = true
        this.listLoading = true
        this.finished = false
        this.fetchList(true)
      }
    }
  },
  mounted () {
    document.addEventListener('mouseup', this.mouseup)
    document.addEventListener('mousemove', this.mousemove)
    if (this.$route.name === 'tokenRecord' || this.$route.name === 'record') {
      document.addEventListener('scroll', this.ndScroll, true)
    }
  },
  methods: {
    async fetchList (refresh) {
      this.needRefresh = false
      // this.loading = true
      try {
        if (!this.allTxIds.length) {
          await this.getFullList()
        }
        if (refresh) {
          await this.getFullList()
          this.list = []
          this.index = 0
        }

        const dataItem = this.allTxIds.slice(12 * this.index, 12 * (this.index + 1))
        const rp = await this.fullnodeProvider.getTransactionWithEffectsBatch(dataItem)
        let datas = []
        for (const item of rp) {
          const data = item.certificate.data
          const status = item.effects.status.status
          const date = this.$options.filters.formatDate(item.timestamp_ms)

          const gasUsed = item.effects.gasUsed
          const gasFeeValue = this.$np.minus(this.$np.plus(gasUsed.computationCost, gasUsed.storageCost), gasUsed.storageRebate)
          const gasFee = (new BN(gasFeeValue).dividedBy(BIG_TEN.pow(this.suiDecimals))).toString(10)

          const type = Object.keys(data.transactions[0])[0]
          const transaction = Object.values(data.transactions[0])[0]
          const objectId = transaction?.objectRef?.objectId || ''
          let recipient = transaction.recipient

          if (!this.list.find(i => i.isDate && i.date === date) && !datas.find(i => i.isDate && i.date === date)) {
            datas.push({ date, isDate: true })
            this.dataLength += 1
          }

          let typeTxt = 'Trading'
          let symbol = 'SUI'

          let find = this.allSuiObjects.find(i => i.details.reference.objectId === objectId)

          switch (type) {
            case 'TransferSui':
              typeTxt = (this.$route.name !== 'tokenRecord' ? 'SUI-' : '') + (this.pubKey === data.sender ? 'Sent' : 'Received')
              break
            case 'TransferObject':
              if (!find) {
                find = await this.getRawObject(data.transactions[0][type].objectRef.objectId)
              }
              if (isCoin(find.details)) {
                const arg = getCoinTypeArg(find.details.data)
                symbol = getCoinSymbol(arg)
                typeTxt = symbol + '-' + (this.pubKey === data.sender ? 'Sent' : 'Received')
              } else {
                typeTxt = 'NFT' + (this.pubKey === data.sender ? '-Sent' : '-Received')
              }
              break
            case 'Call':
              if (transaction.module.toLowerCase().includes('nft')) {
                typeTxt = 'NFT-Trading'
              }
              break
            case 'PaySui':
              typeTxt = (this.$route.name !== 'tokenRecord' ? 'SUI-' : '') + (this.pubKey === data.sender ? 'Sent' : 'Received')
              recipient = transaction.recipients[0]
              break
            case 'Pay':
              typeTxt = (this.pubKey === data.sender ? 'Sent' : 'Received')
              recipient = transaction.recipients[0]
              break
            default:
              break
          }

          if (type === 'TransferSui' || type === 'TransferObject' || type === 'Call' || type === 'PaySui' || type === 'Pay') {
            let amount
            if (type === 'PaySui' || type === 'Pay') {
              amount = transaction.amounts.reduce((a, b) => a + b)
            } else {
              amount = transaction.amount
            }

            datas.push({
              objectId: data.gasPayment.objectId,
              sender: data.sender,
              logoURI: symbol === 'SUI' ? require('@/assets/img/sui.png') : '',
              recipient,
              type,
              typeTxt,
              status,
              symbol,
              amount: amount ? new BN(amount).dividedBy(BIG_TEN.pow(this.suiDecimals)) : '',
              txId: item.certificate.transactionDigest,
              timestamp: item.timestamp_ms,
              gasFee,
              date
            })
          }
        }

        if (this.$route.name === 'tokenRecord') {
          datas = datas.filter(r => r.symbol === this.currViewToken.symbol && r.typeTxt !== 'NFT-Received')
        }

        if (!this.index) {
          this.list = datas
        } else {
          this.list = this.list.concat(datas)
        }

        this.index++
        this.loading = false

        if (this.allTxIds.length <= (13 * this.index - this.dataLength)) {
          this.finished = true
        } else {
          this.finished = false
        }
        if (refresh) {
          this.scrollTo(this.scroll_load.top, 40)
          await sleep(500)
        }

        if (this.list.length < 13 && !this.finished) {
          setTimeout(() => {
            this.fetchList()
          })
        }
      } catch (err) {
        this.$log(err)
        this.listVisible = false
        this.list = []
        if (err && err.message.includes('Network request failed')) {
          // this.$toast('Network Error.')
          this.networkError = true
          this.txt = 'Network Error'
        }
      } finally {
        if (!this.list.length && this.finished) {
          this.listVisible = false
        }
        this.loading = false
        this.listLoading = false
        this.scroll_load.top = 0
        this.scroll_load.state = 0
        refresh && (await this.scrollTo(this.scroll_load.top, 0))
        this.$store.commit('SET_IS_RECORD_REFRESH', false)
      }
    },
    async getFullList () {
      // both get transactions for from and to address
      const addressRp = await this.fullnodeProvider.getTransactionsForAddress(this.pubKey, true)

      const txIds = []
      addressRp.forEach(item => {
        if (!txIds.find(r => r === item)) {
          txIds.push(item)
        }
      })

      if (txIds.length > 0) {
        // txIds = txIds.reverse()
        this.allTxIds = txIds
        this.listVisible = true
      } else {
        this.listVisible = false
      }
    },
    async getRawObject (objectId) {
      const rp = await this.fullnodeProvider.getObject(objectId)
      return rp
    },
    filterList (arr, fn) {
      const obj = {}
      arr.forEach(item => {
        const key = JSON.stringify(fn(item))
        obj[key] = obj[key] || []
        obj[key].push(item)
      })
      // console.log('obj: ', obj)

      // return Object.keys(obj).map(k => {
      //   return { date: JSON.parse(k), list: obj[k] }
      // })
      const result = []
      Object.keys(obj).forEach(k => {
        result.push({ date: JSON.parse(k), isDate: true })
        result.push(...obj[k])
      })
      return result
    },
    ndScroll () {
      if (this.$refs.ndScrContent) {
        const scrollTop = this.$refs.ndScrContent.scrollTop
        var clientHeight = 492
        var scrollHeight = this.$refs.ndScrContent.scrollHeight

        if ((Math.round(scrollTop) + clientHeight) >= scrollHeight && !this.finished && !this.loading) {
          this.loading = true
          setTimeout(() => {
            this.fetchList()
          })
        }
      }
    },
    mousedown (e) {
      if (
        this.listLoading ||
        this.scroll_load.state === 3 ||
        this.$refs.ndScrContent.scrollTop > 0
      ) {
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
        this.scroll_load.top = 0
        this.scroll_load.touching = false
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
      this.scroll_load.touching = false
      if (this.scroll_load.state === 3) {
        return
      }
      if (this.scroll_load.top >= 40) {
        this.refresh()
      } else {
        await this.scrollTo(this.scroll_load.top, 0, 10)
        this.scroll_load.state = 0
        // this.scroll_load.top = 0
      }
      // console.log('touchEnd')
    },
    refresh () {
      this.scroll_load.top = 40
      this.scroll_load.state = 3
      this.listVisible = true
      this.listLoading = true
      this.finished = false
      this.fetchList(true)
      // this.$store.commit('SET_PROGRAM_ACCOUNTS_PROMISE', null)
      // this.fetchNFTData(true)
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
    toExplorer (item) {
      // const link = `https://explorer.devnet.sui.io/transactions/${encodeURIComponent(item.txId)}`
      // chrome.tabs.create({
      //   url: link
      // })
      // console.log('item: ', item)
      this.$router.push({ path: 'record-detail', query: { id: item.txId, title: item.typeTxt, type: item.type } })
    },
    toSend () {
      // if (this.balancesList.length > 0 && this.balancesList[0].balance > 0) {
      this.$store.commit('SET_LASTTIME_SEND', this.currViewToken)
      this.$router.push('/sendpage')
      // } else {
      //   this.needNoSolTip = true
      //   setTimeout(() => {
      //     this.needNoSolTip = false
      //   }, 3000)
      // }
    },
    toReceive () {
      // if (this.balancesList[0].amount <= 0) {
      //   this.needNoSolTip = false
      // }
      // this.$router.push({ name: 'PopularToken', query: { source: 'receive' } })
      this.$store.commit('SET_LASTTIME_SEND', this.balancesList[0])
      this.$router.push({
        path: '/Receivesqrcode',
        query: { symbol: 'SUI' }
      })
    },
    toReceiveSOL () {
      this.$store.commit('SET_LASTTIME_SEND', this.balancesList[0])
      this.needNoSolTip = false
      this.$router.push('/Receivesqrcode')
    },
    backoff () {
      history.go(-1)
    }
  }
}
</script>
<style lang="scss" src="@/assets/css/views/record/record.scss" scoped></style>
