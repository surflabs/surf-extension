<template>
  <div class="sty3-cell">
    <div class="mui-nav mui-fl-vert">
      <h5 class="pg-title1 taplight2" @click="backoff">
        <i class="mico-arrow-right-sty1"/>Receive
      </h5>
    </div>

    <div class="qrscan">Only Sui related assets</div>
    <div class="mui-fl-central mui-fl-col qrimg">
      <div class="qrcode" ref="qrCodeUrl"></div>
      <div class="wname txt-ovfl nopadd">{{ curAccount.name }}</div>

      <div class="qrcodetip mui-fl-col mui-fl-vert">
        <textarea @focus="select = false" :class="['qrcodeinp', select ? 'selection' : '']" ref="ndSecret" v-model="pubKey" readonly />
        <div @mousedown="tipfn()" class="btn-copy taplight mui-fl-vert">
          <i class="mico-copy" />Copy
        </div>
      </div>
    </div>

    <div v-show="jumpPage" class="mui-fl-btw footer-box">
      <m-button class="mui-fl-1 fz18" type="info" :disabled="isMint === 2 || mintLoading" round @click="submit" :loading="mintLoading">Mint Demo NFT</m-button>
    </div>

    <div class="nos-tip mui-fl-vert mui-fl-btw" v-show="needNoSuiTip">
      <p class="mui-fl-1">
        You need to deposit SUI in order to pay for  <br />
        transactions
      </p>
      <p class="r taplight mui-shr-0" @click="toReceive">Receive</p>
    </div>

    <confirm-password ref="ndConfirmPwd" @confirm="newMintNft" />
  </div>
</template>

<script>
import QRCode from 'qrcodejs2'
import { placeIcon } from '../../utils/mixin'
import { RawSigner, Ed25519Keypair } from '@mysten/sui.js'
import nacl from 'tweetnacl'
import { mapGetters, mapState } from 'vuex'
import ConfirmPassword from '@/components/confirm-password'

export default {
  name: 'My',
  mixins: [placeIcon],
  components: { ConfirmPassword },
  data () {
    return {
      select: false,
      imglogo: '',
      jumpPage: '',
      fromPath: '',
      symbol: this.$route.query.symbol,
      mintLoading: false,
      timer: null,

      // second: 0,
      needNoSuiTip: false,
      listname: ''
    }
  },
  computed: {
    ...mapGetters(['pubKey', 'curAccount', 'suiDecimals', 'fullnodeProvider']),
    ...mapGetters({
      balancesList: 'filterBalancesList',
      wallet: 'curWallet'
    }),
    ...mapState({
      mintTimer: ({ collectible }) => Number(collectible.mintTimer) || 0,
      isMint: ({ collectible }) => Number(collectible.isMint)
    }),
    theme () {
      return this.$store.state.theme
    },
    currencydates () {
      return this.$store.state.lastTimeSend || ''
    },
    suiBalance () {
      const balancesList = this.balancesList
      return balancesList.length > 0 ? balancesList[0].balance : 0
    },
    rawSigner () {
      const _privateKey = this.wallet.scrKey.indexOf('0x') === 0 ? this.wallet.scrKey.substring(2) : this.wallet.scrKey
      const _uint8Array = Buffer.from(_privateKey, 'hex')
      const keyPair = nacl.sign.keyPair.fromSecretKey(_uint8Array)
      const _keyPair = new Ed25519Keypair(keyPair)
      return new RawSigner(_keyPair, this.fullnodeProvider)
    }
  },
  beforeRouteEnter (to, from, next) {
    next((vm) => {
      vm.fromPath = from.path
    })
  },
  created () {
    this.listname = this.currencydates.symbol || 'SUI'
    if (Date.now() < this.mintTimer) {
      this.$store.dispatch('setIsMint', { time: this.mintTimer - Date.now() })
    } else {
      this.$store.commit('SET_ISMINT', 1)
    }
  },
  mounted () {
    this.imglogo = this.currencydates.logoURI
    this.jumpPage = this.$route.query.jumpPage
    this.creatQrCode()
  },
  destroyed () {
    clearTimeout(this.timer)
  },
  methods: {
    creatQrCode () {
      var qrcode = new QRCode(this.$refs.qrCodeUrl, {
        width: 172,
        height: 172
      })
      qrcode.makeCode(this.pubKey)
    },
    tipfn () {
      this.select = true
      this.$refs.ndSecret.select()
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

    submit () {
      clearTimeout(this.timer)
      const fee = 10000
      if (this.suiBalance < fee) {
        this.needNoSuiTip = true
        this.timer = setTimeout(() => {
          this.needNoSuiTip = false
        }, 5000)
        return
      }
      this.$refs.ndConfirmPwd.password = ''
      this.$refs.ndConfirmPwd.showPwdConfirm = true
    },

    async newMintNft () {
      try {
        this.$refs.ndConfirmPwd.showPwdConfirm = false

        this.mintLoading = true
        const name = 'Surf'
        const description = "Let's Surf Sui"
        const url = 'https://src.surf.tech/icon/surf.png'
        const rp = await this.rawSigner.executeMoveCallWithRequestType({
          packageObjectId: '0x2',
          module: 'devnet_nft',
          function: 'mint',
          typeArguments: [],
          arguments: [
            name,
            description,
            url
          ],
          gasBudget: 10000
        })
        if (rp.EffectsCert?.effects?.effects?.status?.status === 'success') {
          // this.$toast('Created successfully')
          this.$message({
            message: 'Created successfully',
            iconClass: 'mico-success',
            customClass: 'sty1-message',
            duration: 1000,
            offset: 270,
            center: true
          })
          this.$store.dispatch('_getBalancesList', {
            updateBalanceList: 1
          })
        } else {
          // this.$toast('Mint failed, try again')
          this.$message({
            message: 'Mint failed, try again',
            iconClass: 'mico-error',
            customClass: 'sty1-message error',
            duration: 1000,
            offset: 270,
            center: true
          })
        }
      } catch (error) {
        console.log('mint failed', error)
        // this.$toast('Mint failed, try again')
        this.$message({
          message: 'Mint failed, try again',
          iconClass: 'mico-error',
          customClass: 'sty1-message error',
          duration: 1000,
          offset: 270,
          center: true
        })
      } finally {
        this.mintLoading = false

        this.$store.commit('SET_ISMINT', 2)
        this.$store.commit('SET_MINTTIMER', Date.now() + 10 * 1000)
        this.$store.dispatch('setIsMint', { time: 10 * 1000 })
        this.$store.commit('SET_IS_RECORD_REFRESH', true)
      }
    },
    backoff () {
      this.$router.back()
      this.$store.commit('SET_LASTTIME_SEND', '')
    },
    toReceive () {
      this.needNoSuiTip = false
      this.$store.commit('SET_LASTTIME_SEND', this.balancesList[0])
      this.imglogo = this.currencydates.logoURI
      this.jumpPage = ''
      // chrome.tabs.create({
      //   url: 'https://discord.com/invite/sui'
      // })
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/receives/Receivesqrcode.scss" scoped></style>
