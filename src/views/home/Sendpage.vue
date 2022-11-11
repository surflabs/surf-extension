<template>
  <div class="send-page mui-fl-col mui-fl-btw">
    <div class="mui-nav mui-fl-vert">
      <h5 class="pg-title1 taplight2" @click="goback">
        <i class="mico-arrow-right-sty1"/>Send
      </h5>
    </div>

    <div class="mui-fl-1">
      <div :class="['sty1-input-box', inputAmount && amountDisabled ? 'err' : '']" >
        <div class="input-box mui-fl-btw mui-fl-vert mui-input-wrap">
          <div class="left-box mui-fl-col paysoltop" @click="jumpReceivespage">
            <p class="input-t1">{{ currentCoin ? currentCoin.symbol : 'SUI'}}</p>
            <div class="mui-fl-vert">
              <img class="token-img" :src="coinLogo" alt="">
              <i class="mico-arrow-down"></i>
            </div>
          </div>
          <div class="right-box mui-fl-vert_end mui-fl-col">
            <ul class="mui-fl-vert">
              <li class="balance">Balance: {{ amount }}</li>
              <li class="all-btn" @click="onAll">All</li>
            </ul>
            <input class="input" ref="ndAmount" type="text" placeholder="0.00" @input="amountInput" v-model="inputAmount">
          </div>
        </div>
      </div>

      <div v-if="inputAmount && amountDisabled" class="warningtip">Enter the correct amount!</div>

      <div class="form-item">
        <e-popover
          v-model="showAddress"
          placement="bottom-start"
          trigger="manual"
          :popper-class="`sty1-popover sty4-popover ${address ? 'sty5-popover' : ''}`">
          <ul v-show="addressList.length">
            <p>SUI Address</p>
            <li v-for="item of addressList" :key="item" @click="address = item, newpbkaddr = address">
              {{ item }}
            </li>
          </ul>
          <template slot="reference">
            <MuiInput
              ref="ndAddress"
              :title="`To (${currentCoin ? currentCoin.symbol : 'SUI'} Address)`"
              :loading="addrLoading"
              :payadd="address"
              :rows=1
              :error="isInvalidAddr"
              :errorMsg="isInvalidAddr ? 'Please enter the correct address.' : 'This domain name has been on resale'"
              type="textarea"
              v-model="address"
              @input="addrInput"
              @focus="inputFocus"
              @blur="addressBlur"
            />
          </template>
        </e-popover>
      </div>

      <div class="paysolswd mui-fl-btw">
        <p>Fee</p>
        <m-loading v-if="estimating" size="16px" color="var(--text9-color)" />
        <p v-else class="t2">{{ txFee }} SUI</p>
      </div>
      <!-- <div class="sty1-input-box fee">
        <p class="t1">Fee</p>
        <div class="mui-fl-btw">
          <m-loading v-if="estimating" size="16px" color="#6E66FA" />
          <p v-else class="t2">{{ txFee }} SUI</p>
        </div>
      </div> -->
    </div>

    <div class="sty1-tip mui-flex">
      <i class="mui-shr-0 mico-warn"></i>
      <div class="mui-fl-1 warn-tip">
        <p>Please check the {{ currentCoin ? currentCoin.symbol : 'Sui' }} address. Your assets cannot be recovered once a transaction is completed.</p>
      </div>
    </div>

    <div class="mui-fl-btw footer-box">
      <m-button class="mui-fl-1 fz18" type="info" round @click="onsend" :disabled="amountDisabled || isInvalidAddr || !address || !Number(inputAmount) || disabled">Send</m-button>
    </div>

    <div class="nos-tip mui-fl-vert mui-fl-btw" v-if="showTip">
      <p class="mui-fl-1">
        Would you like to deposit {{ currentCoin ? currentCoin.symbol : 'SUI'}}?<br />
      </p>
      <p class="r mui-shr-0" @click="toReceive">Receive</p>
    </div>
  </div>
</template>

<script>
import MuiInput from '@/components/mui-input'
import { placeIcon } from '../../utils/mixin'
import { isValidSuiAddress } from '@mysten/sui.js'
import { mapState, mapGetters, mapMutations } from 'vuex'
import BigNumber from 'bignumber.js'
import { computeGasCostForPay, DEFAULT_GAS_BUDGET_FOR_TRANSFER_SUI, selectCoinsWithBalanceGreaterThanOrEqual } from '@/utils/sui'
import { debounce } from 'lodash-es'
import { BIG_TEN } from '@/utils/filters'

// import { sleep } from '@/utils/common'

export default {
  name: 'TokenSendpage',
  mixins: [placeIcon],
  components: {
    MuiInput
  },
  data () {
    return {
      visible: false,
      // show: false,
      address: '',
      inputAmount: '',
      newpbkaddr: null,
      pukaddress: '',
      addrLoading: false,
      // domainOwner: '',
      showTip: false,
      timer: '',
      showAddress: false,
      disabled: false,

      estimating: false,
      estimateGas: '',
      estimateGasDebounced: null,
      allEstimateGas: ''
    }
  },
  watch: {
    inputAmount (val) {
      if (val && this.amountDisabled) {
        this.showTip = true
        window.clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.showTip = false
        }, 3000)
      } else {
        this.showTip = false
      }
      this.checkInputAndCallEstimateGas()
    },
    address () {
      this.checkInputAndCallEstimateGas()
    }
  },
  computed: {
    ...mapState(['endpoint', 'currSendInput', 'addressInputs']),
    ...mapState({
      currentCoin: (state) => state.lastTimeSend || ''
    }),

    ...mapGetters(['pubKey', 'suiDecimals']),
    ...mapGetters({
      balancesList: 'filterBalancesList'
    }),

    amount () {
      return this.currentCoin ? this.currentCoin.formateBalance : this.balancesList[0]?.formateBalance || 0
    },
    suiAmount () {
      return this.balancesList[0]?.balance || 0
    },
    defaultFee () {
      return 100
    },

    amountDisabled: {
      set (val) {
        return val
      },
      get () {
        let result = this.addrLoading || true
        const BN = BigNumber.clone({ ROUNDING_MODE: 1 })
        // send SUI
        if (
          this.inputAmount &&
        (!this.currentCoin || this.currentCoin.symbol === 'SUI')
        ) {
          const fAmount = this.$options.filters.formatSui(this.suiAmount)
          if (new BN(fAmount).minus(this.txFee).gte(this.inputAmount)) {
            result = false
          }
          // send Coin
        } else if (
          this.inputAmount &&
          this.inputAmount <= Number(this.amount)
        ) {
          result = false
        }

        return result
      }

    },

    isInvalidAddr () {
      let result = this.addrLoading || true
      try {
        if (this.newpbkaddr && isValidSuiAddress(this.newpbkaddr)) {
          result = false
        } else if (!this.address) {
          result = false
        }
      } catch (err) {
        //
      }
      return result
    },

    coinLogo () {
      if (!this.currentCoin) {
        return require('@/assets/img/sui.png')
      } else {
        return this.currentCoin.logoURI ? this.currentCoin.logoURI : require(`@/assets/img/${this.darkMode ? 'unknown-dark' : 'unknown'}.png`)
      }
    },
    addressList () {
      return this.addressInputs[this.pubKey] || []
    },
    txFee () {
      let num = ''
      if (!this.estimating && this.estimateGas) {
        num = this.estimateGas
      } else if (this.currSendInput && (new BigNumber(this.currSendInput.txFee)).gt(0)) {
        num = this.currSendInput.txFee
      } else {
        num = new BigNumber(100)
      }

      return this.$options.filters.formatSui(num)
    }
  },
  async created () {
    if (this.balancesList.length === 0) {
      this.$store.dispatch('getBalancesList')
    }

    this.estimateGasDebounced = debounce(this.getEstimateGas, 300)
    if (this.currentCoin) {
      if (this.currentCoin.pubkey) {
        this.pukaddress = this.currentCoin.pubkey
      } else {
        this.pukaddress = this.pubKey
      }
    } else {
      this.pukaddress = this.pubKey
    }

    if (this.currSendInput) {
      this.inputAmount = this.currSendInput.inputAmount
      this.address = this.currSendInput.address
      // this.domainOwner = this.currSendInput.domainOwner
      this.newpbkaddr = this.address
    }

    if (JSON.stringify(this.currSendInput?.allObjArr) !== JSON.stringify(this.currentCoin?.allObjArr)) {
      this.inputAmount = ''
    }

    const val = new BigNumber(this.inputAmount).multipliedBy(BIG_TEN.pow(this.suiDecimals)).toNumber()
    this.allEstimateGas = await this.getMergeGasFee(this.balancesList[0], val)
  },
  methods: {
    ...mapMutations([
      'SET_CURR_SEND_INPUT',
      'SET_LASTTIME_SEND',
      'CLEAR_CURR_SEND_INPUT'
    ]),
    async getEstimateGas () {
      if (!this.inputAmount || this.isInvalidAddr || (this.inputAmount && this.amountDisabled)) {
        this.estimating = false
        return
      }
      this.estimating = true

      const coins = this.currentCoin ? this.currentCoin : this.balancesList[0]
      const amount = coins.symbol === 'SUI' ? new BigNumber(this.inputAmount).multipliedBy(BIG_TEN.pow(this.suiDecimals)).toNumber() : new BigNumber(this.inputAmount)
      this.estimateGas = await this.getMergeGasFee(coins, amount)

      this.disabled = false
      this.estimating = false
    },
    async getMergeGasFee (coins, amount) {
      const targetAmount = new BigNumber(amount).plus(DEFAULT_GAS_BUDGET_FOR_TRANSFER_SUI).toNumber()
      const coinsWithSufficientAmount =
            await selectCoinsWithBalanceGreaterThanOrEqual(
              coins.allObjArr,
              targetAmount
            )
      if (!coinsWithSufficientAmount.length > 0) {
        const fee = computeGasCostForPay(coins.allObjArr.length) + DEFAULT_GAS_BUDGET_FOR_TRANSFER_SUI
        return new BigNumber(fee)
      } else {
        return 100
      }
    },
    checkInputAndCallEstimateGas () {
      if (!this.inputAmount || this.isInvalidAddr || (this.inputAmount && this.amountDisabled)) {
        this.estimating = false
        this.estimateGas = 100
        return
      }
      this.estimating = true
      this.estimateGasDebounced()
    },
    jumpReceivespage () {
      this.$router.push({ name: 'Receivespage', query: { jumppage: 'senpage', pushlist: this.currentCoin } })
      this.storeinput()
    },
    async inputFocus () {
      // await sleep(100)
      this.$refs.ndAddress && this.$refs.ndAddress.$refs.ndInput.focus()
      this.showAddress = this.addressList.length > 0
    },
    async addressBlur () {
      // await sleep(200)
      this.showAddress = false
    },
    storeinput () {
      const obj = {
        inputAmount: this.inputAmount,
        address: this.address,
        toPubkey: this.newpbkaddr,
        pukaddress: this.pukaddress,
        allObjArr: this.currentCoin?.allObjArr || this.balancesList[0].allObjArr,
        txFee: new BigNumber(this.txFee).multipliedBy(BIG_TEN.pow(this.suiDecimals)).toNumber()
      }
      this.SET_CURR_SEND_INPUT(obj)
    },
    toReceive () {
      this.SET_LASTTIME_SEND(this.currentCoin || this.balancesList[0])
      this.storeinput()
      this.$router.push('/Receivesqrcode')
    },
    amountInput () {
      // const reg = /^\+?[1-9]\d*$/
      // if (!reg.test(this.inputAmount)) {
      //   this.inputAmount = this.inputAmount.slice(0, this.inputAmount.length - 1)
      // }
      // if (this.inputAmount.length >= 11) {
      //   if (this.inputAmount.indexOf('.') !== -1) {
      //     this.inputAmount = this.inputAmount.slice(0, 11)
      //   } else {
      //     this.inputAmount = this.inputAmount.slice(0, 10)
      //   }
      // }

      if (!this.inputAmount) {
        this.checkInputAndCallEstimateGas()
        return
      }
      const reg = /^(\d+\.?)?\d{0,10}$/
      this.inputAmount = this.inputAmount.replace(/[^\d.]/g, '').replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
      if (!reg.test(this.inputAmount)) {
        this.inputAmount = this.inputAmount.slice(0, this.inputAmount.length - 1)
      }
      if (this.inputAmount.length >= 11) {
        if (this.inputAmount.indexOf('.') !== -1) {
          this.inputAmount = this.inputAmount.slice(0, 11)
        } else {
          this.inputAmount = this.inputAmount.slice(0, 10)
        }
      }
    },
    onAll () {
      if (this.amount) {
        if (!this.currentCoin || this.currentCoin.symbol === 'SUI') {
          if (this.amount < 0.0000001) {
            this.inputAmount = this.amount
            this.showTip = true
            this.amountDisabled = true
          } else {
            // this.inputAmount = new BigNumber(this.amount).minus(this.txFee).toString(10)
            const val = this.$options.filters.formatSui(this.allEstimateGas)
            const result = new BigNumber(this.amount).minus(val)
            this.estimateGas = this.allEstimateGas
            if (result.lt(0)) {
              this.inputAmount = '0'
            } else {
              this.inputAmount = result.toString(10)
            }
            if (this.inputAmount.length >= 11) {
              if (this.inputAmount.indexOf('.') !== -1) {
                this.inputAmount = this.inputAmount.slice(0, 11)
              } else {
                this.inputAmount = this.inputAmount.slice(0, 10)
              }
            }
          }
        } else {
          this.inputAmount = this.amount
        }
        this.$refs.ndAmount.focus()
      }
    },
    async addrInput () {
      if (this.address && !this.addressList.includes(this.address)) {
        this.showAddress = false
      } else {
        this.showAddress = this.addressList.length > 0
      }
      this.address = this.address.trim()
      this.newpbkaddr = this.address
    },
    async onsend () {
      const fee = new BigNumber(100).dividedBy(BIG_TEN.pow(this.suiDecimals)).toNumber()
      if (this.suiAmount < 100) {
        this.$toast({
          message: 'Your SUI insufficient balance',
          duration: 3000
        })
        return
      }
      if (!this.currentCoin) {
        if (this.amount < fee) {
          this.$toast({
            message: 'Infficient Balance',
            duration: 500
          })
          return
        }
      } else if (this.currentCoin.symbol === 'SUI') {
        if (this.amount < fee) {
          this.$toast({
            message: 'Infficient Balance',
            duration: 500
          })
          return
        }
      }
      this.SET_LASTTIME_SEND(this.currentCoin || this.balancesList[0])
      this.storeinput()
      this.$router.push({ name: 'Sendconfirm' })
    },
    onclear (index) {
      if (index === 'Toadd') {
        this.address = ''
        // this.domainOwner = ''
      } else if (index === 'Amount') {
        this.inputAmount = ''
      }
    },
    goback () {
      this.CLEAR_CURR_SEND_INPUT()
      this.SET_LASTTIME_SEND(null)
      history.go(-1)
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/receives/sendpage.scss" scoped></style>
