<template>
  <div class="sty2-cell mui-fl-col mui-fl-btw">
    <div class="mui-fl-1">
      <div class="mui-nav">
        <h5 class="pg-title1 taplight2" @click="$router.back()">
          <i class="mico-arrow-right-sty1" />{{ pgTitle }}
        </h5>
      </div>
      <template v-if="currStep === 1">
        <div class="hide-seed mui-fl-col mui-fl-central" v-if="!show">
          <p class="copy-btn mui-fl-central">
            <span class="mui-fl-vert taplight2" @click="show = true">
              <i class="mico-click" /> Click to reveal Seed Phrase
            </span>
          </p>
          <p class="tip">Make sure no one is watching your screen. <br>Seed phrase is the only way you will be able to<br> recover your account. </p>
        </div>
        <ul class="content-words mui-fl-wrap mui-fl-vert" v-if="show">
          <li v-for="(i, index) of mnemonicArr" :key="index">{{ i }}</li>
          <input v-model="mnemonic" ref="ndTxtarea" class="ipt-hidden">

        </ul>
      </template>
      <template v-if="currStep === 2">
        <div :class="{'created-mnemonic mui-fl-col mui-fl-vert': 1}">
          <ul class="mui-fl-wrap" key="verifyGroup">
            <li :class="{ 'active': i.txt === '' && index === verifyIndex, 'value-active': i.txt !== '' }" v-for="(i, index) of verifyMnemonicArr" :key="index" @click="selectkVerifyItem(i, index)">
              <span class="word" :data-word="i.txt !== '' ? i.txt : index + 1" />
              <i v-if="i.txt" class="icon-delete-sty taplight mico-no-connect" @click="deleteVerifyItem(i, index)"></i>
            </li>
          </ul>
        </div>
        <div class="show-mnemonic mui-fl-col mui-fl-vert">
          <ul class="mui-fl-wrap">
            <li v-for="(i, index) of randomMnemonicArr" :key="index" :class="{'taplight': 1, 'active invalid': i.active}" @click="handleClkFillItem(i, index)">
              {{ i.txt }}
            </li>
          </ul>
        </div>
      </template>
    </div>

    <div class="mui-shr-0">
      <template v-if="currStep === 1">
        <p v-if="show" :class="{'copy-btn mui-fl-central marg-b': 1, 'disabled': copyBtnDisabled}">
          <span class="mui-fl-vert taplight2" @click="copy">
            <i v-if="!copyBtnDisabled" class="mico-copy" /> {{ copytext }}
          </span>
        </p>
        <m-button class="fz18 mui-fl-1" type="info" round block :disabled="!show" @click="next">I've saved it</m-button>
      </template>
      <template v-if="currStep === 2">
        <div class="mui-fl-btw">
          <m-button class="mui-fl-1 fz16 gray" round :loading="creating1" @click="create(1)">Later</m-button>
          <m-button class="mui-fl-1 fz16" round type="info" :disabled="validate.type !== 'success'" :loading="creating0" @click="create(0)">Done</m-button>
        </div>
      </template>
    </div>

    <div class="toast-msg mui-fl-vert" v-if="validate.show">
      <i :class="{'mico-success': validate.type === 'success', 'mico-error': validate.type === 'fail'}"></i>
      <div>
        <p class="t1">{{ toastMsg.title }}</p>
        <p class="t2">{{ toastMsg.tip }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { generateKeypair } from '@/utils/create'
import { aesEncrypt3 } from '@/utils/common'
import { mapState } from 'vuex'
// import bip39 from 'bip39-light'

import {
  generateMnemonic as bip39GenerateMnemonic
} from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english'

import { placeIcon } from '../../utils/mixin'

export default {
  name: 'CreateNewWallet',
  mixins: [placeIcon],
  data () {
    return {
      // currStep: 1,
      mnemonic: '',
      mnemonicArr: [],
      verifyMnemonicArr: [],
      verifyIndex: 0,
      show: false,
      copyBtnDisabled: false,
      copytext: 'Copy to clipboard',
      validate: {
        type: '',
        show: false
      },
      creating0: false,
      creating1: false
    }
  },
  computed: {
    ...mapState(['allWalletList', 'mainWallet', 'accounts']),
    ...mapState({
      noMoreReminders: ({ common }) => common.noMoreReminders
    }),

    currStep () {
      return Number(this.$route.query.currStep)
    },
    pgTitle () {
      let txt = ''
      if (this.currStep === 1) {
        txt = 'Create a New Wallet'
      } else if (this.currStep === 2) {
        txt = 'Confirm Seed Phrase'
      }
      return txt
    },
    randomMnemonicArr () {
      const arr = []
      this.mnemonicArr.forEach(v => {
        arr.push({
          txt: v,
          active: false
        })
      })
      arr.sort(() => {
        return Math.random() - 0.5
      })
      return arr
    },
    toastMsg () {
      const obj = {}
      if (this.validate.type === 'success') {
        obj.title = 'Backup Successful!'
        obj.tip = 'Keep the backup safe.'
      }
      if (this.validate.type === 'fail') {
        obj.title = 'Backup Fail!'
        obj.tip = 'Try again, please choose in order.'
      }
      return obj
    }
  },
  async created () {
    this.$store.commit('SET_PWD_VALID_PASS', false)
    const rp = await this.generateMnemonic()
    this.mnemonic = rp.mnemonic
    this.mnemonicArr = this.mnemonic.split(' ')
  },
  methods: {
    async generateMnemonic () {
      const mnemonic = bip39GenerateMnemonic(wordlist)
      return { mnemonic }
    },
    copy () {
      if (this.copyBtnDisabled) return
      this.$refs.ndTxtarea.select()
      document.execCommand('copy')
      this.copytext = 'copied!'
      this.copyBtnDisabled = true
      setTimeout(() => {
        this.copyBtnDisabled = false
        this.copytext = 'Copy to clipboard'
      }, 1000)
    },
    next () {
      this.$store.commit('SET_PWD_VALID_PASS', true)
      this.$router.push({
        query: {
          currStep: 2
        }
      })
      this.verifyIndex = 0
      this.randomMnemonicArr.forEach(v => {
        v.active = false
      })
      this.mnemonicArr.forEach((v, index) => {
        this.verifyMnemonicArr[index] = {
          txt: '',
          acceptIdx: ''
        }
      })
      this.$store.commit('SET_PWD_VALID_PASS', false)
    },
    selectkVerifyItem (i, index) {
      if (i.txt) return
      this.verifyIndex = index
    },
    deleteVerifyItem (i, index) {
      if (this.validate.show) return
      this.$set(this.randomMnemonicArr, i.acceptIdx, { txt: i.txt, active: false })
      this.$set(this.verifyMnemonicArr, index, { txt: '', acceptIdx: '' })
      this.verifyIndex = index
      this.validate.type = ''
    },
    handleClkFillItem (i, index) {
      if (this.verifyIndex > 11 || this.verifyMnemonicArr.includes(i.txt) || i.active) {
        return
      }

      this.$set(this.verifyMnemonicArr, this.verifyIndex, { txt: i.txt, acceptIdx: index })
      i.active = true

      const arr = []
      this.verifyMnemonicArr.forEach((v, idx) => {
        if (v.txt === '') {
          arr.push(idx)
        }
      })
      if (arr.length > 0) {
        this.verifyIndex = arr[0]
      } else {
        this.verifyIndex = null
      }

      let num = 0
      this.verifyMnemonicArr.forEach(v => {
        num = v.acceptIdx !== '' ? num + 1 : num
      })
      if (num === this.verifyMnemonicArr.length) {
        this.compareMnemonic()
      }
    },
    async compareMnemonic () {
      let str = ''
      this.verifyMnemonicArr.forEach(v => {
        str = str + v.txt + ' '
      })
      this.validate.show = true
      if (this.mnemonic !== str.trim()) {
        this.validate.type = 'fail'
      } else {
        this.validate.type = 'success'
      }
      setTimeout(() => {
        this.validate.show = false
      }, 3000)
    },
    async create (num) {
      if (this.creating0 || this.creating1) {
        return
      }
      this['creating' + num] = true
      const keyring = [...this.allWalletList]
      const accounts = [...this.accounts]
      let hdw = { ...this.mainWallet }

      const rp = await generateKeypair(this.mnemonic)

      keyring.push({
        mnemonic: this.mnemonic,
        address: rp.address,
        scrKey: rp.secretKey
      })
      accounts.push({
        address: rp.address,
        isNeedNote: Boolean(num),
        name: `Wallet-${this.mainWallet.total + 1}`,
        type: 'seed',
        walletIndex: 0,
        index: this.mainWallet.total
      })
      hdw = { ...this.mainWallet, total: this.mainWallet.total + 1 }

      const ciphertext = await aesEncrypt3(
        JSON.stringify({ keyring, hdw }),
        this.mainWallet.password
      )
      await this.$crmStorage.set({
        keyringData: ciphertext
      })

      this.$store.commit('SET_ACCOUNTS', accounts)
      this.$store.commit('SET_ALL_WALLET_LIST', keyring)
      this.$store.commit('SET_MAIN_WALLET', hdw)
      !this.noMoreReminders && this.$store.commit('SET_NEED_NOTE', true)

      this.$store.commit('CLEAR_BALANCES')
      this.$store.commit('SET_CUR_WAL_IDX', keyring.length - 1)

      this.$message({
        message: 'Success',
        iconClass: 'mico-success',
        customClass: 'sty1-message',
        duration: 500,
        offset: 270,
        center: true,
        onClose: () => {
          this.$router.push({
            name: 'home'
          })
          this['creating' + num] = false
        }
      })
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/side/_create-new-wallet.scss" scoped></style>
