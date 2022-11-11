<template>
  <div class="sign mui-fl-central">
    <header class="s-header mui-fl-central">
      <h1 class="logo taplight" />
    </header>

    <div class="signbox-right mui-fl-col mui-fl-vert">
      <i v-if="currStep === 2 || currStep === 3 || currStep === 4" class="back-icon mico-arrow-left mui-fl-central mui-shr-0" @click="prevStep"></i>

      <div class="sb-header mui-shr-0" v-if="currStep === 2 || currStep === 3 || currStep === 4">
        <ul class="step mui-fl-central">
          <li v-for="step of [2,3,4]" :key="step" :class="{ active: currStep === step }" />
        </ul>
      </div>

      <div v-if="currStep === 1" class="sb-body mui-fl-col mui-fl-vert">
        <h2 class="t1">Let's Surf Sui</h2>
        <ul class="entrance">
          <li class="mui-fl-vert taplight" @click="nextStep('create')">
            <img src="~@/assets/img/entrance1.png" alt="">
            <div>
              <p class="t2">Create a new account</p>
              <p class="t3">Get started by creating your first Sui wallet.</p>
            </div>
          </li>
          <li class="mui-fl-vert taplight" @click="nextStep('recovery')">
            <img src="~@/assets/img/entrance2.png" alt="">
            <div>
              <p class="t2">I already have a wallet</p>
              <p class="t3">Import your seed phrase from an existing account.</p>
            </div>
          </li>
        </ul>
      </div>

      <div v-else-if="currStep === 2" class="sb-body w-354 mui-fl-1">
        <div class="mui-fl-central" v-if="(action === 'create' && !showMnemonic) || (action === 'recovery' && !showImportIpt)">
          <img src="~@/assets/img/security.png" class="img-create">
        </div>
        <p class="lab">{{ step2.title }}</p>
        <p class="lab2" v-if="step2.lab" v-html="step2.lab"></p>

        <template v-if="(action === 'create' && !showMnemonic) || (action === 'recovery' && !showImportIpt)">
          <div class="mui-fl-col mui-fl-vert">
            <div :class="{'checkbox-sty mui-fl-vert': 1 }">
              <m-checkbox v-model="checkBoxAgree" class="sty1-checkbox mui-fl-vert">
                I have read and agree to the&nbsp;
                <template #icon="props">
                  <i :class="{'icon-checkbox-checked mico-selected': props.checked, 'icon-checkbox-unchecked': !props.checked }" />
                </template>
              </m-checkbox>
              <a :href="protocolLink" target="_blank">Terms of Service.</a>
            </div>
          </div>

          <m-button class="fz18 dark-bg" type="info" :disabled="!this.checkBoxAgree" round block @click="nextStep()">{{ step2.btnTxt }}</m-button>
        </template>

        <template v-else-if="action === 'create' && showMnemonic && !isSaved">
          <div class="created-mnemonic mui-fl-col mui-fl-vert">
            <ul class="mui-fl-wrap" key="createGroup">
              <li v-for="(i, index) of createdMnemonicArr" :key="index">
                {{ i }}
              </li>
            </ul>
            <p :class="{'copy taplight2 mui-fl-vert': 1, 'disabled': copyBtnDisabled}" @click="copyMnemonic">
              <i v-if="!copyBtnDisabled" class="mico-copy"></i>{{ copytext }}
            </p>
            <input v-model="form.mnemonic" ref="ndMnemonic" class="ipt-hidden">
          </div>

          <m-button class="fz18 dark-bg" type="info" round block @click="nextStep">Next</m-button>
        </template>

        <template v-else-if="action === 'create' && showMnemonic && isSaved">
          <div :class="{'created-mnemonic verify mui-fl-col mui-fl-vert': 1, 'error': !validate.valid && !verifyMnemonicDisabled }">
            <ul class="mui-fl-wrap" key="verifyGroup">
              <li :class="{ 'active': i.txt === '' && index === verifyIndex, 'value-active': i.txt !== '' }" v-for="(i, index) of verifyMnemonicArr" :key="index" @click="selectkVerifyItem(i, index)">
                <span class="word" :data-word="i.txt !== '' ? i.txt : index + 1" />
                <i v-if="i.txt" class="icon-delete-sty taplight mico-no-connect" @click="deleteVerifyItem(i, index)"></i>
              </li>
            </ul>
          </div>
          <div class="show-mnemonic mui-fl-col mui-fl-vert">
            <ul class="mui-fl-wrap">
              <li v-for="(i, index) of randomCreatedMnemonicArr" :key="index" :class="{'taplight': 1, 'active invalid': i.active}" @click="handleClkFillItem(i, index)">
                {{ i.txt }}
              </li>
            </ul>
          </div>
          <m-button class="marg-b fz18 dark-bg" round type="info" :disabled="verifyMnemonicDisabled || !validate.valid" block @click="nextStep">Next</m-button>
          <p class="backup-later taplight2" @click="nextStep('backup')">Backup Later</p>
        </template>

        <template v-else-if="action === 'recovery' && showImportIpt">
          <form>
            <div class="form-item2">
              <mui-input
                class="grey-model"
                type="textarea"
                v-model="form.mnemonic"
                title="Seed phrase"
                placeholder="Please enter..."
                :length="normalizeMnemonicLength"
                @input="validate.valid = true"
                @blur="validateMnemonic"
                :error="!validate.valid"
                :errorMsg="validate.msg"
              />
            </div>
            <div class="form-item2">
              <mui-input
                class="grey-model"
                v-model="form.walletName"
                title="Wallet name"
                placeholder="Enter wallet name ..."
                maxlength="20"
                :focused="false"
                :error="form.walletName.length > 20"
                :errorMsg="form.walletName.length > 20 ? 'No more than 20 characters.' : ''"
              />
            </div>
            <m-button class="marg-t40 mui-fl-1 fz18 dark-bg" block round type="info" native-type="submit" :disabled="!validate.valid || emptyMnemonic || !form.walletName || form.walletName.length > 20" @click="validateMnemonicNext" :loading="verifying">Import</m-button>
          </form>
        </template>
      </div>

      <div v-else-if="currStep === 3" class="sb-body w-354">
        <p class="lab">Create a Password</p>
        <p class="lab3">For the security of your seed phrase, please set a<br> password</p>
        <form style="width: 100%">
          <div class="form-item2">
            <input-password
              class="grey-model"
              v-model="form.password"
              title="Password"
              @change="onPwdChange"
              :invalid="!validate.valid"
              :showMsg="false"
            />
            <p :class="{ 'form-item-info': 1, err: !validate.valid }">At least 8 characters.</p>
          </div>
          <div class="form-item2">
            <input-password
              class="grey-model"
              v-model="form.cfmPassword"
              title="Confirm password"
              @change="onPwdChange"
              :invalid="!samePwd"
              :errorMsg="'Please enter the same password.'"
              :focused="false"
            />
          </div>
          <m-button class="fz18 dark-bg marg-t40" round type="info" native-type="submit" :disabled="!step3Valid" block :loading="submitPwdIng" @click="submitPwd">Save</m-button>
        </form>
      </div>

      <div v-else-if="currStep === 4" class="sb-body w-354">
        <p class="lab">Verify Code</p>
        <p class="lab3">Please enter the invitation code.</p>
        <div class="follow-twitter marg-sty2 taplight2">
          <a href="https://discord.gg/5YEtEJ47TU" target="_blank" class="mui-fl-vert mui-fl-btw twitter">
            <p class="mui-fl-vert">
              <i class="icon-sty1 mico-discord"></i>
              <span>Go to Surf's discord to get it.</span>
            </p>
            <i class="mico-arrow-right-sty1"></i>
          </a>
        </div>
        <form style="width: 100%">
          <div class="form-item2">
            <mui-input
              class="grey-model"
              v-model="form.inviteCode"
              title="Invitation Code"
              placeholder="Please enter..."
              :disabled="inviteDisabled"
              :errorMsg="'Please enter...'"
              :focused="false"
            />
          </div>
          <m-button class="fz18 dark-bg marg-t40" round type="info" native-type="submit" :disabled="!form.inviteCode" block :loading="saving" @click="verifyCode">Verify</m-button>
        </form>
      </div>

      <div v-else-if="currStep === 5" class="sb-body w-354 mui-fl-col mui-fl-vert">
        <i class="icon-success-sty mico-success"></i>
        <p class="lab">You're all done !</p>
        <p class="lab4">Follow along with product updates or reach out if you<br> have questions.</p>
        <div class="follow-twitter taplight2">
          <a href="https://twitter.com/surf_wallet" target="_blank" class="mui-fl-vert mui-fl-btw twitter">
            <p class="mui-fl-vert">
              <i class="mico-twitter icon-sty1"></i>
              <span>Follow us on Twitter</span>
            </p>
            <i class="mico-arrow-right-sty1 icon-arrow"></i>
          </a>
        </div>
        <m-button class="fz18 dark-bg" type="info" round block @click="finish">Finish</m-button>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { InfiniteScroll } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import { generateKeypair } from '@/utils/create'
import { aesEncrypt3 } from '@/utils/common'

import InputPassword from '@/components/input-password'
import MuiInput from '@/components/mui-input'

import { placeIcon } from '@/utils/mixin'

import {
  generateMnemonic as bip39GenerateMnemonic,
  validateMnemonic as bip39ValidateMnemonic
} from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english'

Vue.use(InfiniteScroll)

export default {
  name: 'Sign',
  mixins: [placeIcon],
  components: {
    InputPassword,
    MuiInput
  },
  data () {
    return {
      checkBoxAgree: false,
      currStep: 1,
      // currStep: 2,
      action: '',
      // action: 'create',
      showMnemonic: false,
      showImportIpt: false,
      isSaved: false,

      form: {
        mnemonic: '',
        password: '',
        cfmPassword: '',
        walletName: '',
        isNeedNote: false,
        inviteCode: ''
      },

      address: '',
      scrKey: '',

      mnemonic: '',
      bakForm: '',
      validate: {
        valid: true,
        msg: ''
      },
      samePwd: true,
      verifying: false,
      submitPwdIng: false,
      saving: false,

      generating: false,
      protocolLink: process.env.VUE_APP_COM_LINK + '/user-protocol',

      copytext: 'Copy to clipboard',
      copyBtnDisabled: false,

      verifyIndex: 0,
      verifyMnemonicArr: [],
      gotChildWalLoading: false,

      isOpenTrengo: false,
      showTrengo: false,
      loading: false,
      inviteDisabled: false
    }
  },
  computed: {
    step2 () {
      const r = {}
      if (this.action === 'create') {
        r.title = this.showMnemonic ? 'Backup your seed phrase' : 'Create a new wallet'
        r.lab = this.showMnemonic ? '' : 'Your seed phrase gives Full Access to your wallet<br> and All of its assets, please keep it safe! Save<br> it in a place where only you can access. If you<br> lose it, no one can help you recover your assets.'
        r.btnTxt = 'Create'
      } else if (this.action === 'recovery') {
        r.title = 'Import wallet'
        r.lab = this.showImportIpt ? '' : 'Your seed phrase gives Full Access to your wallet<br> and All of its assets, please keep it safe! Save<br> it in a place where only you can access. If you<br> lose it, no one can help you recover your assets.'
        r.btnTxt = 'Import'
      }
      return r
    },
    normalizeMnemonic () {
      return this.form.mnemonic.trim().replace(/\s+/g, ' ')
    },
    normalizeMnemonicLength () {
      return this.form.mnemonic ? (this.normalizeMnemonic.split(' ') || []).length : 0
    },
    createdMnemonicArr () {
      return this.mnemonic.split(' ')
    },
    randomCreatedMnemonicArr () {
      const arr = []
      this.createdMnemonicArr.forEach(v => {
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
    emptyMnemonic () {
      return (this.normalizeMnemonic.split(' ') || []).length < 12
    },
    step3Valid () {
      return this.form.password && this.form.cfmPassword && this.validate.valid
    },
    verifyMnemonicDisabled () {
      let num = 0
      this.verifyMnemonicArr.forEach(v => {
        num = v.acceptIdx !== '' ? num + 1 : num
      })

      return num !== this.verifyMnemonicArr.length
    }
  },
  created () {
    const registered = localStorage.getItem('registered')
    if (registered) {
      this.currStep = 5
    }
    this.bakForm = JSON.stringify(this.form)
    // const mnemonics = bip39GenerateMnemonic(wordlist)
    // console.log('mnemonics:', mnemonics)
    // const keypair0 = Ed25519Keypair.deriveKeypair(mnemonics)
    // console.log('keypair:', keypair0)
    // console.log('getPublicKey', keypair0.getPublicKey().toBase64())
    // console.log('getAddress', keypair0.getPublicKey().toSuiAddress())
  },
  methods: {
    copyMnemonic () {
      if (this.copyBtnDisabled) return
      this.$refs.ndMnemonic.select()
      document.execCommand('copy')
      this.copytext = 'copied!'
      this.copyBtnDisabled = true
      setTimeout(() => {
        this.copyBtnDisabled = false
        this.copytext = 'Copy to clipboard'
      }, 3000)
    },
    async compareMnemonic () {
      let str = ''
      this.verifyMnemonicArr.forEach(v => {
        str = str + v.txt + ' '
      })
      this.form.mnemonic = str.trim()
      if (this.mnemonic !== this.form.mnemonic) {
        this.validate.valid = false
        this.$message({
          message: 'Try again, please choose in order.',
          iconClass: 'mico-error',
          customClass: 'sty1-message error',
          duration: 3000,
          offset: 68
        })
        return
      }
      this.validate.valid = true
    },

    async validateMnemonicNext () {
      if (this.form.mnemonic === '') {
        await this.validateMnemonic()
      }
      if (this.gotChildWalLoading) return
      if (!this.verifying && this.validate.valid) {
        this.currStep++
      }
    },

    async validateMnemonic () {
      if (this.form.mnemonic === '') return

      this.verifying = true

      try {
        if (!bip39ValidateMnemonic(this.normalizeMnemonic, wordlist)) {
          this.validate.valid = false
          this.validate.msg = 'There is no wallet related to those seed phrase.'
          this.verifying = false
          return
        }
        this.verifying = false
      } catch (error) {
        console.log(error)
        this.verifying = false
      }
    },

    changePath () {
      if (this.form.mnemonic) {
        this.validateMnemonic()
      }
    },

    async submitPwd (e) {
      e.preventDefault()
      if (!this.step3Valid) return
      if (!this.samePwd) return
      this.submitPwdIng = true
      const { address, secretKey } = generateKeypair(this.normalizeMnemonic)
      this.address = address
      this.scrKey = secretKey

      const rp = await this.$api.request('sign.getWalletInfo', {
        walletAddress: this.address
      })
      if (rp.code === 80000000) {
        if (rp.data.isVerify) {
          await this.submitData()
          this.submitPwdIng = false
        } else {
          this.currStep++
          this.submitPwdIng = false
        }
      } else {
        this.submitPwdIng = false
        this.$message({
          message: rp.msg || 'Network error',
          iconClass: 'mico-error',
          customClass: 'sty1-message error',
          duration: 3000,
          offset: 68
        })
      }
    },

    async verifyCode (e) {
      e.preventDefault()
      this.saving = true

      const rp = await this.$api.request('sign.verifyCode', {
        code: this.form.inviteCode,
        walletAddress: this.address
      })
      if (rp.code === 80000000) {
        await this.submitData()
        this.saving = false
      } else {
        if (rp.code === 80101004) {
          this.inviteDisabled = true
        } else {
          this.inviteDisabled = false
        }

        this.saving = false
        this.$message({
          message: rp.msg || 'Network error',
          iconClass: 'mico-error',
          customClass: 'sty1-message error',
          duration: 3000,
          offset: 68
        })
      }
    },

    async submitData () {
      const hdw = {
        mnemonic: this.normalizeMnemonic,
        password: this.form.password,
        total: 1
      }
      const keyring = [{
        mnemonic: this.normalizeMnemonic,
        address: this.address,
        scrKey: this.scrKey
      }]

      await Promise.all([
        this.$crmStorage.clear(),
        this.$bgStorage.clear()
      ])
      const [keyringData, mep] = await Promise.all([
        aesEncrypt3(JSON.stringify({ keyring, hdw }), this.form.password),
        aesEncrypt3(this.form.password, this.normalizeMnemonic)
      ])
      // if (this.currStep !== 4 || !this.saving) {
      //   this.saving = false
      //   return false
      // }

      await this.$crmStorage.set({
        keyringData,
        mep,
        loginAccount: keyring[0].address,
        loginExpiry: Date.now() + 15 * 60 * 1000,
        accounts: [{
          address: keyring[0].address,
          name: this.action === 'recovery' ? this.form.walletName : 'Wallet-1',
          isNeedNote: this.form.isNeedNote,
          type: 'seed',
          walletIndex: 0,
          index: 0
        }],
        registered: '1'
      })
      localStorage.clear()
      localStorage.setItem('registered', '1')

      if (this.form.isNeedNote) {
        localStorage.setItem('isNeedNote', this.form.isNeedNote)
      }

      this.saving = false

      if (this.currStep === 3) {
        this.currStep = this.currStep + 2
        return
      }
      this.currStep++
    },

    onPwdChange () {
      if (this.form.password.length < 8) {
        this.validate.valid = false
      } else {
        this.validate.valid = true
      }
      if (this.form.password && this.form.cfmPassword) this.samePwd = this.form.password === this.form.cfmPassword
    },

    onCfmPwdChange () {
      if (this.form.password && this.form.cfmPassword) this.samePwd = this.form.password === this.form.cfmPassword
    },

    async nextStep (action) {
      this.resetForm()

      if (typeof action === 'string' && this.currStep === 1) {
        this.action = action
      }

      if (this.currStep === 2 && this.action === 'create' && !this.showMnemonic) {
        this.showMnemonic = true
        const rp = await this.generateMnemonicAndSeed()
        this.form.mnemonic = this.mnemonic = rp.mnemonic
        this.createdMnemonicArr.forEach((v, index) => {
          this.verifyMnemonicArr[index] = {
            txt: '',
            acceptIdx: ''
          }
        })

        return
      }

      if (this.currStep === 2 && this.action === 'create' && this.showMnemonic) {
        if (!this.isSaved) {
          this.isSaved = true
          this.randomCreatedMnemonicArr.forEach(v => {
            v.active = false
          })
          return
        } else {
          this.form.mnemonic = this.mnemonic
          this.form.isNeedNote = action === 'backup'
          if (action === 'backup') {
            this.verifyMnemonicArr.forEach((v, idx) => {
              this.$set(this.verifyMnemonicArr, idx, { txt: '', acceptIdx: '' })
            })
            this.verifyIndex = 0
          }
        }
      }

      if (this.currStep === 2 && this.action === 'recovery') {
        this.showImportIpt = true
        return
      }

      this.currStep++
    },
    prevStep () {
      if (this.currStep === 4) {
        this.form.password = ''
        this.form.cfmPassword = ''
      } else {
        this.resetForm()
      }
      if (this.currStep === 2) {
        if (this.action === 'create' && this.showMnemonic && !this.isSaved) {
          this.showMnemonic = false
          return
        }
        if (this.action === 'recovery' && this.showImportIpt) {
          this.showImportIpt = false
          return
        }
      }

      if (this.currStep === 2 && this.action === 'create' && this.isSaved) {
        this.isSaved = false
        this.form.mnemonic = this.mnemonic

        this.verifyMnemonicArr.forEach((v, index) => {
          this.$set(this.verifyMnemonicArr, index, { txt: '', acceptIdx: '' })
        })
        this.verifyIndex = 0
        return
      }
      if (this.currStep === 3) {
        this.saving = false
        if (this.action === 'recovery') {
          this.form.mnemonic = this.normalizeMnemonic
          this.validate.valid = true
          this.samePwd = true
          this.form.password = ''
          this.form.cfmPassword = ''
        }
        if (this.action === 'create') {
          this.randomCreatedMnemonicArr.forEach(v => {
            v.active = false
          })
          this.verifyMnemonicArr.forEach((v, index) => {
            this.$set(this.verifyMnemonicArr, index, { txt: '', acceptIdx: '' })
          })
          this.verifyIndex = 0
        }
      }
      this.currStep--
      if (this.currStep === 1) {
        this.showMnemonic = false
        this.showImportIpt = false
      }
    },

    resetForm () {
      Object.assign(this.form, JSON.parse(this.bakForm))
      this.validate.valid = true
      this.samePwd = true
    },

    finish () {
      window.close()
    },

    async generateMnemonicAndSeed () {
      this.generating = true
      const mnemonic = bip39GenerateMnemonic(wordlist)
      this.generating = false
      return { mnemonic }
    },

    selectkVerifyItem (i, index) {
      if (i.txt) return
      this.verifyIndex = index
    },

    deleteVerifyItem (i, index) {
      this.$set(this.randomCreatedMnemonicArr, i.acceptIdx, { txt: i.txt, active: false })
      this.$set(this.verifyMnemonicArr, index, { txt: '', acceptIdx: '' })
      this.verifyIndex = index
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
    handleTip () {
      this.$message({
        message: 'Coming soon',
        iconClass: 'mico-error',
        customClass: 'sty1-message error',
        duration: 3000,
        offset: 68
      })
    }
  }
}
</script>

<style lang="scss">
  ::-webkit-scrollbar-thumb {
    background-color: #373C45 !important;
  }
</style>
<style lang="scss" src="@/assets/css/views/_sign.scss" scoped></style>
