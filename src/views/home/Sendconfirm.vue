<template>
  <div class="sty1-cell mui-fl-col mui-fl-btw">
    <div>
      <div class="mui-nav">
        <h5 class="pg-title1 taplight2" @click="goback"><i class="mico-arrow-right-sty1"/></h5>
      </div>

      <div style="margin-top: 12px;">
        <div class="mui-fl-col mui-fl-vert">
          <!-- <img v-if="currentCoin.symbol && theme === 'light' && !currentCoin.logoURL" class="img_logo" :src="require('@/assets/img/unknown.png')">
          <img v-else-if="currentCoin.symbol && theme === 'dark' && !currentCoin.logoURL" class="img_logo" :src="require('@/assets/img/unknown-dark.png')">
          <img v-else class="img_logo" :src="currentCoin.logoURL ? currentCoin.logoURL : suiImg"> -->
          <div class="mui-fl-vert sty6-gp" style="overflow: hidden;">
            <m-image
              v-if="currentCoin.logoURI"
              class="sty1-image mui-shr-0"
              width="48"
              height="48"
              :src="currentCoin.logoURI"
              :loading-icon="darkMode ? placMapIconDark : placMapIcon"
              :error-icon="darkMode ? failMapIconDark : failMapIcon"
              />
            <i v-else :class="['ico', 'mui-shr-0', currentCoin.logoURI ? '' : 'unknown']" />
          </div>
          <p class="title">Confirm Transaction</p>
        </div>

        <!-- <div class="Splitline"></div> -->
        <ul class="payconftp mui-fl-col">
          <li class="mui-fl-btw">
            <p>Currency</p>
            <p>{{currentCoin.symbol || 'SUI'}}</p>
          </li>
          <li class="mui-fl-btw">
            <p>Address</p>
            <p>{{trdata.toPubkey | formatPubKey }}</p>
          </li>
          <li class="mui-fl-btw">
            <p>Total paid</p>
            <p>{{trdata.inputAmount | bn2Str}} {{currentCoin.symbol || 'SUI'}}</p>
          </li>
          <li class="mui-fl-btw">
            <p>Miner Fee</p>
            <p>{{ trdata.txFee | formatSui }} SUI</p>
          </li>
        </ul>
      </div>
    </div>

    <div class="mui-fl-btw footer-box">
      <m-button class="mui-fl-1 fz16 gray" round @click="$router.back()">Cancel</m-button>
      <m-button class="mui-fl-1 fz16" round type="info" @click="submit" :disabled="loading">Confirm</m-button>
    </div>
    <m-popup v-model="show" class="sty1-popup mui-fl-col mui-fl-vert" :close-on-click-overlay='false'>
      <div class="sty5-gp">
        <!-- <img class="p" v-if="senddate" src="../../assets/img/record/success-prompt.png" alt="">
        <img class="p" v-else src="../../assets/img/record/failure-prompt.png" alt=""> -->
        <i v-if="senddate" class="mico-success icon mui-shr-0"></i>
        <i v-else class="mico-error fail mui-shr-0"></i>
        <div class="t">{{senddate ? 'Send Success' : 'Transaction Fail'}} </div>
        <div class="c" v-if="senddate">Successfully paid out {{trdata.inputAmount}} {{currentCoin.symbol || 'SUI'}}! Wait for Blockchain confirmation, it will be credited later.</div>
        <div class="c" v-else>{{ errTxt }}</div>
        <m-button class="middle-sty1 gray" round type="info" @click="handleClkDone">Done</m-button>
      </div>
    </m-popup>

    <confirm-password ref="ndConfirmPwd" @confirm="cfm" />
  </div>
</template>

<script>
import { RawSigner, Ed25519Keypair } from '@mysten/sui.js'
import nacl from 'tweetnacl'
import { mapState, mapGetters } from 'vuex'
import { placeIcon } from '../../utils/mixin'
import ConfirmPassword from '@/components/confirm-password'
import {
  selectCoinsWithBalanceGreaterThanOrEqual,
  sortByBalance,
  DEFAULT_GAS_BUDGET_FOR_TRANSFER_SUI,
  computeGasCostForPay
} from '@/utils/sui'
import BigNumber from 'bignumber.js'
import { BIG_TEN } from '@/store'

const SUI_TYPE_ARG = '0x2::sui::SUI'

export default {
  name: 'TokenSendConfirm',
  mixins: [placeIcon],
  components: { ConfirmPassword },
  data () {
    return {
      loading: false,
      show: false,
      senddate: null,
      errTxt: 'You need import or receive more Token to do the transaction.'
    }
  },
  computed: {
    ...mapState(['theme', 'endpoint']),
    ...mapState({
      trdata: (state) => state.currSendInput || {},
      currentCoin: (state) => state.lastTimeSend || ''
    }),

    ...mapGetters(['pubKey', 'fullnodeProvider']),
    ...mapGetters({
      wallet: 'curWallet',
      balancesList: 'filterBalancesList',
      suiDecimals: 'suiDecimals'
    }),
    suiAmount () {
      return this.balancesList[0]?.balance || 0
    },
    rawSigner () {
      const _privateKey = this.wallet.scrKey.indexOf('0x') === 0 ? this.wallet.scrKey.substring(2) : this.wallet.scrKey
      const _uint8Array = Buffer.from(_privateKey, 'hex')
      const keyPair = nacl.sign.keyPair.fromSecretKey(_uint8Array)
      const _keyPair = new Ed25519Keypair(keyPair)
      return new RawSigner(_keyPair, this.fullnodeProvider)
    }
  },
  methods: {
    submit () {
      if (this.pubKey === this.trdata.toPubkey) {
        this.$message({
          message: 'This is your own address. You cannot send tokens to yourself.',
          iconClass: 'mico-warn',
          customClass: 'sty1-message sty2-message',
          duration: 2000,
          offset: 270,
          center: true
        })
        return
      }
      // if (this.currentCoin.symbol !== 'SUI' && getIsSplitCoin(this.currentCoin.allObjArr, this.trdata.inputAmount)) {
      //   if (this.suiAmount < 1000) {
      //     this.$message({
      //       message: 'Your SUI insufficient balance.',
      //       iconClass: 'mico-warn',
      //       customClass: 'sty1-message sty2-message',
      //       duration: 2000,
      //       offset: 270,
      //       center: true
      //     })
      //     return
      //   }
      // }
      this.$refs.ndConfirmPwd.password = ''
      this.$refs.ndConfirmPwd.showPwdConfirm = true
    },
    async cfm () {
      this.$refs.ndConfirmPwd.showPwdConfirm = false
      this.$message({
        message: 'Loading',
        iconClass: 'message-loading',
        customClass: 'sty1-message',
        duration: 0,
        offset: 270,
        center: true
      })

      // this.$toast.loading({
      //   duration: 0,
      //   message: 'Loading',
      //   forbidClick: true,
      //   LoadingType: 'spinner'
      // })
      this.loading = true
      try {
        // console.log('trdata: ', this.trdata)
        let rp
        if (this.currentCoin.symbol === 'SUI') {
          rp = await this.newTransferSui()
        } else {
          rp = await this.newTransferCoin()
        }
        // const rp = await this.transferSui()
        // this.$toast.clear()
        this.$message.closeAll()
        // this.loading = false
        if (rp.EffectsCert?.effects?.effects?.status?.status === 'success') {
          this.show = true
          this.senddate = true

          this.$store.dispatch('_getBalancesList', {
            updateBalanceList: 1
          })
          this.$store.commit('SET_ADDRESSINPUTS', { walletAddress: this.pubKey, address: this.trdata.toPubkey })
          this.$store.commit('SET_IS_RECORD_REFRESH', true)
        } else {
          this.show = true
          this.senddate = false
        }
      } catch (error) {
        console.log(error)
        this.$message.closeAll()
        if (error.message.includes('Network request failed')) {
          this.errTxt = 'Your network is wrong. Please try again later.'
        }
        // this.$toast.clear()
        this.loading = false
        this.show = true
        this.senddate = false
      }
    },

    async newTransferCoin () {
      // const amount = new BigNumber(this.trdata.inputAmount).multipliedBy(BIG_TEN.pow(this.suiDecimals)).toNumber()
      // const targetAmount = new BigNumber(amount).plus(DEFAULT_GAS_BUDGET_FOR_TRANSFER_SUI).toNumber()
      const amount = this.trdata.inputAmount
      const recipient = this.trdata.toPubkey
      const coins = this.currentCoin.allObjArr
      const inputCoins =
            await this.selectCoinSetWithCombinedBalanceGreaterThanOrEqual(
              coins,
              amount
            )
      if (inputCoins.length === 0) {
        const totalBalance = this.totalBalance(coins)
        throw new Error(
                `Coin balance ${totalBalance.toString()} is not sufficient to cover the transfer amount ` +
                    `${amount.toString()}. Try reducing the transfer amount to ${totalBalance}.`
        )
      }

      const inputCoinIDs = inputCoins.map((c) => c.id)
      const gasBudget = computeGasCostForPay(inputCoins.length)
      const payTxn = {
        inputCoins: inputCoinIDs,
        recipients: [recipient],
        amounts: [Number(amount)],
        gasBudget,
        gasPayment: await this.selectGasPayment(
          coins,
          inputCoinIDs,
          Number(gasBudget)
        )
      }
      return await this.rawSigner.payWithRequestType(payTxn)
    },

    async newTransferSui () {
      const amount = new BigNumber(this.trdata.inputAmount).multipliedBy(BIG_TEN.pow(this.suiDecimals)).toNumber()
      const targetAmount = new BigNumber(amount).plus(DEFAULT_GAS_BUDGET_FOR_TRANSFER_SUI).toNumber()
      // const amount = this.trdata.inputAmount
      const recipient = this.trdata.toPubkey
      const coins = this.currentCoin.allObjArr
      const coinsWithSufficientAmount =
            await selectCoinsWithBalanceGreaterThanOrEqual(
              coins,
              targetAmount
            )
      if (coinsWithSufficientAmount.length > 0) {
        const txn = {
          suiObjectId: coinsWithSufficientAmount[0].id,
          gasBudget: DEFAULT_GAS_BUDGET_FOR_TRANSFER_SUI,
          recipient,
          amount
        }
        return await this.rawSigner.transferSuiWithRequestType(txn)
      }

      const gasCostForPay = computeGasCostForPay(coins.length)
      let inputCoins = await this.assertAndGetCoinsWithBalanceGte(
        coins,
        amount,
        gasCostForPay
      )
      // In this case, all coins are needed to cover the transfer amount plus gasBudget, leaving
      // no coins for gas payment. This won't be a problem once we introduce `PaySui`. But for now,
      // we address this case by splitting an extra coin.
      if (inputCoins.length === coins.length) {
        // We need to pay for an additional `transferSui` transaction now, assert that we have sufficient balance to cover the additional cost
        await this.assertAndGetCoinsWithBalanceGte(
          coins,
          amount,
          gasCostForPay + DEFAULT_GAS_BUDGET_FOR_TRANSFER_SUI
        )

        // Split the gasBudget from the coin with largest balance for simplicity. We can also use any coin that has amount greater than or equal to `DEFAULT_GAS_BUDGET_FOR_TRANSFER_SUI * 2`
        const coinWithLargestBalance = inputCoins[inputCoins.length - 1]

        if (
          Number(coinWithLargestBalance.balance) <
                gasCostForPay + DEFAULT_GAS_BUDGET_FOR_TRANSFER_SUI
        ) {
          throw new Error(
            'None of the coins has sufficient balance to cover gas fee'
          )
        }

        const txn = {
          suiObjectId: coinWithLargestBalance.id,
          gasBudget: DEFAULT_GAS_BUDGET_FOR_TRANSFER_SUI,
          recipient: await this.rawSigner.getAddress(),
          amount: gasCostForPay
        }
        await this.rawSigner.transferSuiWithRequestType(txn)

        inputCoins =
                await this.rawSigner.provider.selectCoinSetWithCombinedBalanceGreaterThanOrEqual(
                  await this.rawSigner.getAddress(),
                  // eslint-disable-next-line no-undef
                  BigInt(amount),
                  SUI_TYPE_ARG,
                  []
                )

        inputCoins = inputCoins.map((c) => c.details.data.fields.id)
      }
      const txn = {
        inputCoins: inputCoins.map((c) => c.id),
        recipients: [recipient],
        amounts: [Number(amount)],
        gasBudget: gasCostForPay
      }
      return await this.rawSigner.payWithRequestType(txn)
    },
    async assertAndGetCoinsWithBalanceGte (
      coins,
      amount,
      gasBudget
    ) {
      const inputCoins =
            await this.selectCoinSetWithCombinedBalanceGreaterThanOrEqual(
              coins,
              amount + Number(gasBudget ?? 0)
            )
      if (inputCoins.length === 0) {
        const totalBalance = this.totalBalance(coins)
        // console.log('totalBalance: ', totalBalance)
        const maxTransferAmount = totalBalance - Number(gasBudget ?? 0)
        const gasText = gasBudget ? ` plus gasBudget ${gasBudget}` : ''
        throw new Error(
                `Coin balance ${totalBalance.toString()} is not sufficient to cover the transfer amount ` +
                    `${amount.toString()}${gasText}. ` +
                    `Try reducing the transfer amount to ${maxTransferAmount.toString()}.`
        )
      }
      return inputCoins
    },
    async selectGasPayment (
      coins,
      amount
    ) {
      const gasPayment = coins.find(c => c.balance >= amount)
      if (gasPayment === undefined) {
        throw new Error(
                `Unable to find a coin to cover the gasBudget ${amount.toString()}`
        )
      }
      return gasPayment.id
    },
    selectCoinSetWithCombinedBalanceGreaterThanOrEqual (
      coins,
      amount,
      exclude = []
    ) {
      const sortedCoins = [...sortByBalance(coins)]

      const total = this.totalBalance(sortedCoins)
      // return empty set if the aggregate balance of all coins is smaller than amount
      if (total < amount) {
        return []
      } else if (total === amount) {
        return sortedCoins
      }

      let sum = 0
      const ret = []
      while (sum < total) {
      // prefer to add a coin with smallest sufficient balance
        const target = amount - sum
        const coinWithSmallestSufficientBalance = sortedCoins.find(
          (c) => c.balance >= target
        )
        if (coinWithSmallestSufficientBalance) {
          ret.push(coinWithSmallestSufficientBalance)
          break
        }

        const coinWithLargestBalance = sortedCoins.pop()
        ret.push(coinWithLargestBalance)
        sum += coinWithLargestBalance.balance
      }

      return sortByBalance(ret)
    },
    totalBalance (coins) {
      return coins.reduce(
        (partialSum, c) => partialSum + c.balance,
        Number(0)
      )
    },

    goback () {
      history.go(-1)
    },
    handleClkDone () {
      if (this.senddate) {
        this.show = false
        this.$router.push('/')
        this.$store.commit('SET_LASTTIME_SEND', '')
        this.$store.commit('CLEAR_CURR_SEND_INPUT')
      } else {
        this.goback()
      }
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/receives/Sendconfirm.scss" scoped></style>
