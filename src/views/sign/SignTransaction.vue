<template>
  <div class="sty3-cell mui-fl-col">
    <div class="scroll-view mui-fl-1 mui-fl-col">
      <div class="source-info mui-fl-col mui-fl-vert">
        <img class="mui-shr-0" v-if="showLogo" :src="favIconUrl" @error="showLogo = false">
        <h1 class="source-info-t">{{ shortTitle }}</h1>
        <p class="origin">{{ origin }}</p>
      </div>

      <h3>Want to transact</h3>

      <div class="com-info mui-fl-btw mui-fl-vert_end">
        <div class="mui-fl-vert wallet-outer">
          <div class="wallet" ov>
            <p class="txt-ovfl">{{ curAccount.name }}</p>
            <p>{{ curAccount.address | formatPubKey }}</p>
          </div>
        </div>
        <p class="balance mui-shr-0">{{ balance || 0 | formatBalance }} SUI (${{ suiAsUsd(balance) | subRadio }})</p>
      </div>

      <div class="com-info">
        <div class="mui-fl-vert mui-fl-btw b-mar">
          <p class="text left">Transaction Type</p>
          <p class="text right">{{ transactionType === 'v2' ? rqData.kind : transactionType }}</p>
        </div>
        <div class="mui-fl-vert mui-fl-btw b-mar" v-if="transactionType === 'MoveCall'">
          <p class="text left">Function</p>
          <p class="text right">{{ rqData.function }}</p>
        </div>
        <div class="mui-fl-vert mui-fl-btw" v-if="transactionType === 'MoveCall'">
          <p class="text left">Gas Fees</p>
          <p class="text right">{{ rqData.gasBudget | formatSui }} SUI (${{ suiAsUsd(rqData.gasBudget) | subRadio}})</p>
        </div>
        <div class="mui-fl-vert mui-fl-btw" v-else>
          <p class="text left">Contents</p>
          <p class="text right">{{ rqData }}</p>
        </div>
      </div>
    </div>

    <div class="bottom-act-bar mui-fl-btw">
      <m-button class="mui-fl-1 fz16 gray" round :disabled="loading || confirming" @click="cancel">Cancel</m-button>
      <m-button class="mui-fl-1 fz16" round type="info" :disabled="loading" :loading="confirming" @click="onApprove">Approve</m-button>
    </div>

    <confirm-password ref="ndConfirmPwd" hide-reset @confirm="cfm" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import nacl from 'tweetnacl'
import { RawSigner, Ed25519Keypair, Base64DataBuffer } from '@mysten/sui.js'
import BigNumber from 'bignumber.js'
import mixin from './mixin'
import ConfirmPassword from '@/components/confirm-password'
import { BIG_TEN } from '@/utils/filters'
import { SUI_DECIMALS } from '@/store'

export default {
  name: 'SignTransaction',
  mixins: [mixin],
  components: { ConfirmPassword },
  data () {
    return {
      id: this.$route.query.id,
      rqData: {},
      txInstructions: null,
      messageTxt: '',
      loading: false,

      balance: 0,
      confirming: false
    }
  },

  computed: {
    ...mapState(['balancesList', 'priceMap']),
    ...mapGetters(['curWallet', 'curAccount', 'pubKey', 'fullnodeProvider']),

    endpoint () {
      return this.$store.state.endpoint
    },
    method () {
      return this.$route.query.method
    },
    transactionType () {
      const m = {
        EXECUTE_MOVECALL: 'MoveCall',
        EXECUTE_SERIALIZED_MOVECALL: 'SerializedMoveCall',
        SIGN_AND_EXECUTE_TRANSACTION: 'v2'
      }
      return m[this.method]
    }
  },

  async created () {
    this.rqData = await this.$bgStorage.get(this.id)

    if (this.balancesList.length === 0) {
      await this.$store.dispatch('getBalancesList')
      const BN = BigNumber.clone({ ROUNDING_MODE: 1, DECIMAL_PLACES: 9 })
      this.balance = new BN(this.balancesList[0].formateBalance)
    }
  },

  methods: {
    async onApprove () {
      this.$refs.ndConfirmPwd.password = ''
      this.$refs.ndConfirmPwd.showPwdConfirm = true
    },

    async cfm () {
      this.confirming = true
      this.$refs.ndConfirmPwd.showPwdConfirm = false

      const scrKey = this.curWallet.scrKey.indexOf('0x') === 0 ? this.curWallet.scrKey.substring(2) : this.curWallet.scrKey
      const scrKeyAsUint8Array = Buffer.from(scrKey, 'hex')
      const _keyPair = nacl.sign.keyPair.fromSecretKey(scrKeyAsUint8Array)
      const keyPair = new Ed25519Keypair(_keyPair)
      const signer = new RawSigner(keyPair, this.fullnodeProvider)

      try {
        let rp
        if (this.transactionType === 'v2') {
          rp = await signer.signAndExecuteTransactionWithRequestType(this.rqData)
        } else if (this.transactionType === 'MoveCall') {
          rp = await signer.signAndExecuteTransactionWithRequestType({
            kind: 'moveCall',
            data: this.rqData
          })
        } else {
          const txBytes = new Base64DataBuffer(this.rqData)
          rp = await signer.signAndExecuteTransactionWithRequestType(txBytes)
        }
        this.postMsg(200, rp)
      } catch (err) {
        this.postMsg(0, err)
      }

      this.confirming = false
    },

    suiAsUsd (val) {
      if (!val) { return 0 }
      const BN = BigNumber.clone({ ROUNDING_MODE: 1, DECIMAL_PLACES: 9 })
      val = new BN(val).div(BIG_TEN.pow(SUI_DECIMALS)).toString(10)
      let total = 0
      const { usd } = this.priceMap.sui || {}
      if (usd) {
        total = this.$np.times(usd, val)
      }
      return total
    },

    postMsg (code, payload) {
      this.$sendMessage({
        channel: 'POPUP_TO_DAPP',
        id: this.id,
        code,
        message: code === 200 ? '' : payload.message || 'RPC Error',
        data: code === 200 ? payload : null
      })
      window.close()
    },

    cancel () {
      this.sendCancel()
      window.close()
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/_connect.scss" scoped></style>
