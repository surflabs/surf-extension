<template>
  <div class="sty2-cell mui-fl-col mui-fl-btw">
    <div>
      <div class="mui-nav">
        <h5 class="pg-title1 taplight2" @click="$router.go(-1)">
          <i class="mico-arrow-right-sty1"/>Warning !
        </h5>
      </div>
      <p class="base-tip">
        Are you sure to remove wallet ({{ pubKey | formatPubKey }}) ?<br>
        Once you remove this wallet, Surf won't be able to recover it for you.
      </p>

      <div class="wallet sty8-gp mui-fl-vert">
        <img :src="walletIcon" alt="" class="mui-shr-0">
        <div class="mui-fl-1">
          <div class="mui-fl-btw mui-fl-start">
            <p class="name txt-ovfl mui-fl-1">{{ curAccount.name }}</p>
            <p class="address mui-shr-0">{{ pubKey | formatPubKey }}</p>
          </div>
          <p v-if="balance !== ''" class="money">{{ (balance === '--' ? '--' : '$' + balance) | subRadio }}</p>
          <m-loading class="money" v-else size="20px"  color="#686868" />
        </div>
      </div>
    </div>

    <div>
      <div class="sty1-tip br12 red mui-flex">
        <i class="mui-shr-0 mico-warn"></i>
        <div class="mui-fl-1">
          <p>Make sure you have your private key and seed phrase backed up.</p>
        </div>
      </div>
      <div class="mui-fl-btw">
        <m-button class="mui-fl-1 fz16 gray" round @click="$router.go(-1)">Cancel</m-button>
        <m-button class="mui-fl-1 fz16" round type="danger" @click="$router.push({ path: '/confirmpwd', query: { s: 'remove' } })">Remove</m-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { placeIcon } from '@/utils/mixin'

export default {
  name: 'RemoveWallet',
  mixins: [placeIcon],
  data () {
    return {
      loading: false
    }
  },
  computed: {
    ...mapState(['priceMap']),
    ...mapGetters(['curAccount', 'pubKey']),
    ...mapGetters({
      balancesList: 'filterBalancesList'
    }),

    balance () {
      if (this.loading) {
        return ''
      } else {
        // let total = 0
        // this.balancesList.forEach(x => {
        //   if (typeof x.symbol !== 'string') return
        //   const { usd } = this.priceMap[x.symbol.toLowerCase()] || {}
        //   if (usd) {
        //     total = this.$np.plus(this.$np.times(usd, x.amount), total)
        //   }
        // })
        // return total
        return this.balancesList.length > 0 && this.balancesList[0].balance > 0 ? '--' : '0.00'
      }
    },

    walletIcon () {
      return (this.walletIconList[this.curAccount.index % 12] || {}).icon
    }
  },
  async created () {
    if (this.balancesList.length === 0) {
      this.loading = true
      await this.$store.dispatch('_getBalancesList')
      this.loading = false
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/my/_base.scss" scoped></style>
<style lang="scss" src="@/assets/css/views/my/_removewallet.scss" scoped></style>
