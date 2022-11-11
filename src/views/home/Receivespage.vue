<template>
  <div class="sty4-cell mui-fl-col">
    <div class="mui-nav ctrl-padd mui-fl-vert mui-shr-0">
      <i class="pg-title-icon-back mico-arrow-right-sty1 mui-fl-shr0 taplight2" @click="$router.back()"/>
      <m-search
        class="sty1-search mui-fl-1"
        v-model="value"
        :left-icon="darkMode ? searchMapIconDark : searchMapIcon"
        placeholder="Search for token"
        :clearable="false"
        show-action
      >
        <template #action style="line-height: 40px;">
          <!-- <div @mousedown="onclear" v-if="value.length" class="action-icon mui-fl-vert"></div> -->
          <i @mousedown="onclear" v-if="value.length" class="mico-solid-close" />
        </template>
      </m-search>
    </div>
    <div class="scroll-view mui-fl-1" ref="ndListRef">
      <m-list
        v-model="loading"
        :finished="finished"
        loading-text=""
        v-if="list.length"
      >
        <div>
          <div class="mui-fl-btw mui-fl-central receivescenter" @click="jumppages(i)" v-for="(i, index) in list" :key="index">
            <div class="mui-fl-vert" style="overflow: hidden;margin-right:20px">
              <m-image
                v-if="i.logoURI"
                class="sty1-image mui-shr-0"
                width="32"
                height="32"
                :src="i.logoURI"
                :loading-icon="darkMode ? placMapIconDark : placMapIcon"
                :error-icon="darkMode ? failMapIconDark : failMapIcon"
                />
              <i
                v-else
                :class="['ico', 'mui-shr-0', i.logoURI ? '' : 'unknown']"
              />
              <span class="retext txt-ovfl">{{i.symbol}}</span>
            </div>
            <div class="retext mui-shr-0 txt-ovfl nopadd">{{ i.formateBalance | formatBalance }}</div>
          </div>
        </div>
        <template #loading>
          <m-loading
            color="var(--text9-color)"
            :class="{ 'top-gap': !balancesList.length }"
            :size="!balancesList.length ? '30px' : '16px'"
          />
        </template>
      </m-list>

      <no-list v-else txt="No Results" />

    </div>
    <!-- <div class="outcancel">
      <m-button class="gray fz18" block @click="$router.back()">Back</m-button>
    </div> -->
  </div>
</template>

<script>
import { placeIcon } from '../../utils/mixin'
import { mapState, mapGetters } from 'vuex'
import NoList from '@/components/no-list'

export default {
  components: { NoList },
  name: 'My',
  mixins: [placeIcon],
  data () {
    return {
      value: '',
      jumppage: '',
      loading: true,
      finished: false,
      list: [],
      index: 0,
      searchList: []
    }
  },
  computed: {
    ...mapState({
      fromCoin: ({ liquidity }) => liquidity.fromCoin,
      toCoin: ({ liquidity }) => liquidity.toCoin,
      hiddenTokensV1: (state) => state.hiddenTokensV1 || {}
    }),

    ...mapGetters({
      pubKey: 'pubKey',
      storeBalancesList: 'filterBalancesList'
    }),

    // pubKey () {
    //   return this.$store.getters.pubKey
    // },
    // storeBalancesList () {
    //   return this.$store.getters.filterBalancesList
    // },
    // hiddenTokensV1 () {
    //   return this.$store.state.hiddenTokensV1 || {}
    // },
    tokens () {
      return this.hiddenTokensV1[this.pubKey]
    },
    balancesList () {
      let result = []

      if (this.jumppage === 'senpage') {
        result = this.storeBalancesList || []
      } else if (this.jumppage === 'swap-from') {
        result = this.$store.state.balancesList
      } else if (this.jumppage === 'swap-to') {
        result = this.$store.getters.toTokens
      }
      // if (this.value) {
      //   result = result.filter(x => x.name.toLowerCase().indexOf(this.value.toLowerCase()) !== -1)
      // }

      return result
    }
    // img () {
    //   return this.$store.state.theme === 'dark' ? require('@/assets/img/record/search-dark.png') : require('@/assets/img/record/search.png')
    // }
    // fromCoin () {
    //   return this.$store.state.liquidity.fromCoin
    // },
    // toCoin () {
    //   return this.$store.state.liquidity.toCoin
    // }
  },
  watch: {
    value () {
      this.searchList = this.balancesList.filter(x => x.symbol.toLowerCase().indexOf(this.value.toLowerCase()) !== -1)
      this.loadList('search')
    }
  },
  async created () {
    this.jumppage = this.$route.query.jumppage
    // await this.$store.dispatch('getBalancesList')
    this.searchList = this.balancesList
    this.loadList('search')
    // if (this.$store.solanaTokenList.size === 0) {
    // }
  },
  mounted () {
    document.addEventListener('scroll', this.ndScroll, true)
  },
  methods: {
    refresh () {
      this.$store.commit('SET_BALANCES_LIST_PROMISE', null)
      this.$store.dispatch('getBalancesList')
    },
    jumppages (ev) {
      if (this.jumppage === 'home') {
        this.$store.commit('SET_LASTTIME_SEND', ev)
        this.$router.push('/Receivesqrcode')
      } else if (this.jumppage === 'senpage') {
        this.$store.commit('SET_LASTTIME_SEND', ev)
        this.$router.back()
        // const currencydate = ev
        // this.$router.replace({ name: 'Sendpage', query: { currencydates: currencydate } })
      } else if (this.jumppage === 'swap-from') {
        if (ev.mintAddress === this.toCoin.mintAddress) {
          this.$store.commit('SET_SWAP_TO_COIN', { ...this.fromCoin })
        }
        this.$store.commit('SET_SWAP_FROM_COIN', ev)
        this.checkCurrToCoin()
        this.$router.back()
      } else if (this.jumppage === 'swap-to') {
        if (ev.mintAddress === this.fromCoin.mintAddress) {
          this.$store.commit('SET_SWAP_FROM_COIN', { ...this.toCoin })
        }
        this.$store.commit('SET_SWAP_TO_COIN', ev)
        this.$router.back()
      }
    },
    checkCurrToCoin () {
      const toTokens = this.$store.getters.toTokens || []
      const containToken = toTokens.find(x => x.mintAddress === this.toCoin.mintAddress)
      if (!containToken && toTokens[0]) {
        this.$store.commit('SET_SWAP_TO_COIN', { ...toTokens[0] })
      }
    },
    onclear () {
      this.value = ''
    },
    loadList (txt) {
      if (txt) {
        this.list = []
        this.index = 0
      }
      if (!this.searchList.length) {
        this.loading = false
        this.finished = true
        return
      }
      setTimeout(async () => {
        const dataItem = this.searchList.slice(20 * this.index, 20 * (this.index + 1))
        if (!this.index) {
          this.list = dataItem
        } else {
          this.list = this.list.concat(dataItem)
        }
        this.index++
        this.loading = false
        if (this.list.length === this.searchList.length) {
          this.finished = true
        } else {
          this.finished = false
        }
      })
    },
    ndScroll () {
      if (this.$refs.ndListRef) {
        const scrollTop = this.$refs.ndListRef.scrollTop
        var clientHeight = 528
        var scrollHeight = this.$refs.ndListRef.scrollHeight
        if ((Math.round(scrollTop) + clientHeight) >= scrollHeight && (this.list.length < this.searchList.length || !this.searchList.length) && !this.finished) {
          this.loading = true
          setTimeout(() => {
            this.loadList()
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/receives/receivespage.scss" scoped></style>
