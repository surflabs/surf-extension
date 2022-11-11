<template>
  <m-popup
    class="aside-swl"
    position="bottom"
    v-model="showPop"
    overlay
    :close-on-click-overlay="false"
    @click-overlay="handleClose">

    <div class="aside-swl--body mui-fl-col mui-fl-btw">
      <div class="mui-fl-btw">
        <div class="mui-fl-1">
          <p class="title">SUI Wallet</p>
          <ul class="aside-swl--items mui-fl-1" ref="ndScroll">
            <li
              v-for="(i, index) of walletList"
              :key="index"
              :class="{'aside-swl--item mui-fl-btw mui-fl-vert_end taplight2': 1, 'active': index === curWalIdx}"
              :style="{ background: index === curWalIdx ? wallet(i.index).activeBgColor : '#FAFAFB' }"
              @click="switchWallet(index)">
              <div class="mui-fl-vert">
                <img :src="wallet(i.index).icon" alt="" class="mui-shr-0">
                <div class="mui-fl-1">
                  <div class="name mui-fl-vert">
                    <p class="txt-ovfl nopadd">{{ i.name }}</p>
                    <e-popover
                      v-if="i.isNeedNote"
                      placement="top"
                      width="110"
                      trigger="hover"
                      popper-class="sty1-popover">
                      <p>Not backed up</p>
                      <i v-if="i.isNeedNote" slot="reference" class="mico-warn-bg"></i>
                    </e-popover>
                  </div>
                  <div class="mui-fl-btw mui-fl-vert_end">
                    <p class="mui-fl-vert pubkey taplight2" @click.stop="copyPubKey(index)">
                      {{ i.address | formatPubKey }}<i class="mico-copy" />
                      <input type="text" v-model="i.address" :ref="'ndIptPubKey' + index" class="ipt-hidden">
                    </p>
                    <p class="balance">{{ (i.balancesAsUsd === '--' ? '--' : '$' + i.balancesAsUsd) | subRadio }}</p>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div v-if="!isConnectPage" class="mui-shr-0 addwalbtn">
        <m-button block round class="fz18 gray" @click="addWallet">Add Wallet</m-button>
      </div>
    </div>
  </m-popup>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import 'element-ui/lib/theme-chalk/index.css'
import mixin from './mixin'
import { placeIcon } from '@/utils/mixin'
import { sleep } from '@/utils/common'

export default {
  name: 'BottomAside',
  mixins: [mixin, placeIcon],
  model: {
    prop: 'showWalletList',
    event: 'show'
  },
  props: {
    showWalletList: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      loading: false
    }
  },
  computed: {
    ...mapState(['priceMap', 'balancesOfWalletList', 'theme', 'accounts']),
    ...mapGetters(['balancesList', 'pubKey']),

    walletList () {
      const wl = this.accounts

      return wl.map(w => {
        let total = '--'
        const bl = this.balancesOfWalletList[w.address] || []

        bl.forEach(x => {
          total = x.balance > 0 ? '--' : '0.00'
        })
        return { ...w, balancesAsUsd: total }
      })
    },
    curWalIdx () {
      return Number(this.$store.getters.curWalIdx)
    },
    showPop: {
      get () {
        return this.$store.state.common.showWalletList
      },
      set (val) {
        this.$store.commit('SET_SHOW_WALLET_LIST', val)
      }
    },
    activeWalletBg () {
      return ''
    },
    walletIcon () {
      return ''
    }
  },
  watch: {
    async showPop (val) {
      if (!val) return
      this.$nextTick(() => {
        this.$refs.ndScroll.scrollTop = this.curWalIdx * 82
      })

      await this.getBalance()
    }
  },
  methods: {
    handleClose () {
      this.$store.commit('SET_SHOW_WALLET_LIST', false)
    },

    copyPubKey (index) {
      this.$refs['ndIptPubKey' + index][0].select()
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

    switchWallet (idx) {
      if (idx === this.curWalIdx) {
        this.handleClose()
        if (this.$route.meta.source !== 'tab' && this.$route.name !== 'connect') {
          this.$router.replace('/')
        }
        return
      }
      localStorage.setItem('curWalIdx', idx)

      this.$store.commit('CLEAR_BALANCES')
      this.$store.commit('SET_LASTTIME_SEND', '')
      this.$store.commit('SET_CUR_WAL_IDX', idx)
      // this.$store.commit('SET_CUR_CHAIN', this.curPageChain)

      if (this.$route.meta.source !== 'tab' && this.$route.name !== 'connect') {
        this.$router.replace('/')
      }
      this.$store.commit('CLEAR_CURR_SEND_INPUT')
      // this.$store.commit('SET_STAKEDACCOUNTS', [])
      // this.$store.commit('SET_INFLATIONREWARD', [])
      this.handleClose()
    },

    addWallet () {
      this.handleClose()
      if (this.$route.name === 'AddWallet') return
      this.$router.push({
        path: '/addWallet'
      })
    },

    async getBalance () {
      if (this.loading) return
      this.loading = true
      try {
        // await this.$store.dispatch('getBalancesList')
        for (const wallet of this.walletList) {
          const pubkey = wallet.address
          const bl = this.balancesOfWalletList[pubkey] || []
          // if (this.pubKey === pubkey || bl.length > 0) {
          if (bl.length > 0) {
            continue
          }
          await sleep(100)
          await this.$store.dispatch('_getBalancesList', { specifiedPubKey: wallet.address })
        }
      } catch (e) {
        console.log(e)
      } finally {
        this.loading = false
      }
    },

    wallet (index) {
      return this.walletIconList[index % 12] || {}
    }
  }
}
</script>

<style lang="scss" scoped>
  .aside-swl {
    box-sizing: border-box;
    width: 100%;
    max-height: 528px;
    min-height: 236px;
    background: var(--bg-color);
    overflow: hidden;
  }
  .aside-swl--body {
    box-sizing: border-box;
    padding: 12px 0 36px;
    width: 100%;
    .title {
      font-weight: 500;
      font-size: 16px;
      line-height: 22px;
      color: #000;
      padding: 13px 24px;
    }

    .aside-swl--items {
      overflow: overlay;
      max-height: 368px;
      min-height: 70px;
      padding-right: 6px;
      .aside-swl--item {
        overflow: hidden;
        padding: 17px 20px;
        margin: 0 24px;
        border-radius: 12px;
        &.active {
          position: relative;
          overflow: hidden;
          .name {
            i {
              color: rgba(0, 0, 0, 0.2);
            }
          }
          .name, .balance {
            color: #000;
          }
          .pubkey {
            color: #6C6C6C;
          }
        }
        img {
          width: 44px;
          height: 44px;
          margin-right: 8px;
        }
        .name {
          font-weight: 500;
          line-height: 18px;
          color: #000;
          width: 234px;
          margin-bottom: 8px;
          > div {
            width: 234px;
          }
          i {
            font-size: 16px;
            margin-left: 4px;
            color: #E8E8E8;
          }
        }
        .pubkey {
          font-size: 12px;
          line-height: 16px;
          color: #6C6C6C;
          i {
            margin-left: 2px;
            font-size: 16px;
            color: #6C6C6C;
          }
        }
        .balance {
          line-height: 18px;
          color: rgba(0, 0, 0, 0.8);
        }
      }
       .aside-swl--item + .aside-swl--item{
        margin-top: 16px;
       }
    }

    .addwalbtn {
      position: sticky;
      bottom: 0;
      padding: 0 24px;
      background-color: var(--bg-color);
      z-index: 2;
      margin-top: 16px;
    }
  }
</style>
