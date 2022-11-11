<template>
  <div class="send-confirm sty2-cell">
    <div class="mui-nav mui-fl-vert">
      <h5 class="pg-title1 taplight2" @click="goback">
        <i class="mico-arrow-right-sty1"/>Confirm Transaction
      </h5>
    </div>
    <ul class="box">
      <li class="mui-fl-vert mui-fl-btw">
        <p>Name</p>
        <p>{{ form.name }}</p>
      </li>
      <li class="mui-fl-vert mui-fl-btw">
        <p>From</p>
        <p>{{ pubKey | formatPubKey }}</p>
      </li>
      <li class="mui-fl-vert mui-fl-btw">
        <p>To</p>
        <p>{{ form.receiverKey | formatPubKey }}</p>
      </li>
      <li class="mui-fl-vert mui-fl-btw">
        <p>Miner Fee</p>
        <p class="fee">{{ fee | formatSui }} SUI</p>
      </li>
    </ul>

    <div class="mui-fl-btw footer-box">
      <m-button class="mui-fl-1 fz16 gray" round @click="goback" :disabled="loading">Cancel</m-button>
      <m-button class="mui-fl-1 fz16" round type="info" @click="submit" :loading="loading">Confirm</m-button>
    </div>

    <m-popup v-model="show" class="sty1-popup mui-fl-col mui-fl-vert" :close-on-click-overlay='false'>
      <div class="sty5-gp">
        <i v-if="senddate" class="mico-success icon mui-shr-0"></i>
        <i v-else class="mico-error fail mui-shr-0"></i>
        <div class="t">{{senddate ? 'Transaction Success' : 'Transaction Fail'}} </div>
        <div class="c" v-if="senddate">Your {{ form.name }} has successfully sent to {{ form.receiverKey | formatPubKey }}</div>
        <div class="c" v-else>{{ errTxt || 'Sending ' + form.name + ' failed. Please try again later.' }}</div>
        <m-button class="middle-sty1 gray" round @click="done">Done</m-button>
      </div>
    </m-popup>

     <div class="nos-tip mui-fl-vert mui-fl-btw" v-show="needNoSuiTip">
      <p class="mui-fl-1">
        You need to deposit SUI in order to pay for <br />
        transactions
      </p>
      <p class="r mui-shr-0" @click="toReceive">Receive</p>
    </div>

    <confirm-password ref="ndConfirmPwd" @confirm="confirm" />
  </div>
</template>

<script>
import BigNumber from 'bignumber.js'
import nacl from 'tweetnacl'
import { mapState, mapGetters } from 'vuex'
import { RawSigner, Ed25519Keypair } from '@mysten/sui.js'
import ConfirmPassword from '@/components/confirm-password'

export default {
  name: 'NftSendConfirm',
  components: { ConfirmPassword },
  data () {
    return {
      fee: 450,
      form: {
        name: '',
        receiverKey: '',
        mint: '',
        ata: ''
      },
      loading: false,
      senddate: true,
      show: false,
      needNoSuiTip: false,
      timer: null,
      errTxt: ''
    }
  },
  computed: {
    ...mapState(['endpoint']),

    ...mapGetters(['pubKey', 'fullnodeProvider', 'suiDecimals']),
    ...mapGetters({
      wallet: 'curWallet',
      balancesList: 'filterBalancesList' || []
    }),

    topSortNfts () {
      const store = this.$store.state.collectible.topSortNfts
      return (store && store[this.pubKey]) || {}
    },
    rawSigner () {
      const _privateKey = this.wallet.scrKey.indexOf('0x') === 0 ? this.wallet.scrKey.substring(2) : this.wallet.scrKey
      const _uint8Array = Buffer.from(_privateKey, 'hex')
      const keyPair = nacl.sign.keyPair.fromSecretKey(_uint8Array)
      const _keyPair = new Ed25519Keypair(keyPair)
      return new RawSigner(_keyPair, this.fullnodeProvider)
    }
  },
  async created () {
    if (this.balancesList.length === 0) {
      await this.$store.dispatch('_getBalancesList', {
        updateBalanceList: 1
      })
    }
    this.form = JSON.parse(this.$route.query.detail)
  },
  filters: {
    formatBN (val, bp = 9) {
      try {
        const n = new BigNumber(val.toString())
        if (n.lte(0)) { return '-' }
        return n.toFormat(bp)
      } catch (error) {
        return val
      }
    }
  },
  methods: {
    goback () {
      if (this.loading) { return }
      history.go(-1)
    },
    submit () {
      clearTimeout(this.timer)
      // const coins = this.balancesList[0].allObjArr
      if (!(this.balancesList[0]?.balance >= Number(this.fee))) {
        this.needNoSuiTip = true
        this.timer = setTimeout(() => {
          this.needNoSuiTip = false
        }, 5000)
        return
      }

      // if ((!coins.find(item => item.balance >= Number(this.fee)))) {
      //   this.$toast({
      //     message: 'The balance is too low, transaction failed.',
      //     duration: 3000
      //   })
      //   return
      // }
      this.$refs.ndConfirmPwd.password = ''
      this.$refs.ndConfirmPwd.showPwdConfirm = true
    },
    done () {
      this.show = false
      let arr = this.topSortNfts[this.endpoint]
      if (arr && arr.length) {
        arr = arr.filter(item => item.id !== this.form.id)
        this.$store.commit('SET_TOPSORT_NFTS', { walletAddress: this.pubKey, nfts: arr, endpoint: this.endpoint })
      }
      // this.senddate && this.pubKey !== this.form.receiverKey && this.$store.commit('SET_NFTID', this.form.id)
      this.$router.push('/collectibles')
    },
    async confirm () {
      this.$refs.ndConfirmPwd.showPwdConfirm = false

      this.loading = true
      try {
        const rp = await this.rawSigner.transferObjectWithRequestType({
          objectId: this.form.id,
          gasBudget: 450,
          recipient: this.form.receiverKey
        })
        // console.log('rp: ', rp)
        if (rp.EffectsCert?.effects?.effects?.status?.status === 'success') {
          // this.show = true
          this.senddate = true

          this.$store.dispatch('_getBalancesList', {
            updateBalanceList: 1
          })
        } else {
          this.senddate = false
        }
        // console.log('rp: ', rp)
      } catch (error) {
        this.$log('confirm err: ', error)
        if (error.message.includes('Network request failed')) {
          this.errTxt = 'Your network is wrong. Please try again later.'
        }
        this.senddate = false
      } finally {
        this.loading = false
        this.show = true
      }
    },
    toReceive () {
      this.$store.commit('SET_LASTTIME_SEND', this.balancesList[0])
      this.$router.push('/Receivesqrcode')
      this.needNoSuiTip = false
    }
  }
}
</script>
<style
  lang="scss"
  src="@/assets/css/views/collectibles/_send-confirm.scss"
  scoped
></style>
