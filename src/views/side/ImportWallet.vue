<template>
  <div class="sty2-cell mui-fl-col">
    <div class="mui-nav mui-fl-vert mui-shr-0">
      <h5 class="pg-title1 taplight2" @click="goback">
        <i class="mico-arrow-right-sty1"/>{{ pgTitle }}
      </h5>
    </div>

    <template v-if="currStep === 1">
      <form class="mui-fl-1 mui-fl-col mui-fl-btw">
        <div>
          <div class="form-item marg-t">
            <mui-input
              v-model="form.txtValue"
              type="textarea"
              :title="this.source === 'private' ? 'Your private key' : 'Your seed phrase'"
              :length="this.source === 'private' ? 0 : mnemonicLength"
              :placeholder="`Please enter ${this.source === 'private' ? 'private key' : 'seed phrase'} ...`"
              @blur="handleBlurNounTextarea"
              @input="handleInputNounTextarea"
              :error="txtValidate.invalid"
              :errorMsg="txtValidate.msg"
              @clear="clearSeedPhrase"
            />
          </div>

          <div class="form-item">
            <mui-input
              v-model="form.walName"
              title="Wallet name"
              placeholder="Enter wallet name ..."
              maxlength="20"
              @input="handleNameInput"
              :error="nameValidate.invalid"
              :errorMsg="nameValidate.msg"
              :focused="false"
            />
          </div>
        </div>

        <m-button class="fz18" type="info" native-type="submit" round block :loading="creating" @click="submit" :disabled="disabled">Import</m-button>
      </form>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import MuiInput from '@/components/mui-input'
import { generateKeypair, generateKeypairFromPrivateKey } from '@/utils/create'
import { aesEncrypt3 } from '@/utils/common'
import { placeIcon } from '@/utils/mixin'

import {
  validateMnemonic as bip39ValidateMnemonic
} from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english'

export default {
  name: 'ImportWallet',
  mixins: [placeIcon],
  components: {
    MuiInput
  },
  data () {
    return {
      currStep: 1,
      source: this.$route.query.s,
      form: {
        txtValue: '',
        walName: '',
        path: {
          value: "m/44'/501'/0'/0'",
          label: 'bip44Change'
        }
      },
      txtValidate: {
        invalid: false,
        msg: ''
      },
      nameValidate: {
        invalid: false,
        msg: ''
      },

      scrKey: '',
      address: '',

      creating: false,
      verifying: false,
      loading: false
    }
  },
  computed: {
    ...mapState(['allWalletList', 'mainWallet', 'accounts']),

    pgTitle () {
      let txt = ''
      if (this.source === 'private') {
        txt = 'Import Private Key'
      } else {
        if (this.currStep === 1) {
          txt = 'Import Seed Phrase'
        } else {
          txt = 'Select Child Wallet'
        }
      }
      return txt
    },
    disabled () {
      return this.normalizeValue === '' || this.form.walName === '' || this.txtValidate.invalid || this.nameValidate.invalid
    },
    normalizeValue () {
      return this.form.txtValue.trim().replace(/\s+/g, ' ')
    },
    mnemonicLength () {
      return this.form.txtValue ? (this.normalizeValue.split(' ') || []).length : 0
    },
    walletList () {
      return this.allWalletList
    },
    isStayHere () {
      return this.$route.name === 'ImportWallet'
    }
  },
  created () {
    this.$store.commit('SET_PWD_VALID_PASS', false)
  },
  methods: {
    goback () {
      if (this.currStep === 1) {
        this.$router.back()
      } else {
        this.currStep--
      }
    },
    handleInputNounTextarea () {
      this.txtValidate.invalid = false
      this.verifying = true
    },
    async handleBlurNounTextarea () {
      if (this.form.txtValue === '') {
        return false
      }
      this.verifying = true
      if (this.source === 'private') {
        const rp = generateKeypairFromPrivateKey(this.normalizeValue)
        if (rp === undefined || this.accounts.filter(item => { return item.address === rp.address }).length > 0) {
          this.txtValidate.invalid = true
          this.txtValidate.msg = rp === undefined ? 'Please re-enter the correct Private Key.' : 'This wallet already imported.'
          this.verifying = false
          return
        }
        this.scrKey = rp.secretKey
        this.address = rp.address
        this.verifying = false
      } else {
        if (!bip39ValidateMnemonic(this.normalizeValue, wordlist)) {
          this.txtValidate.invalid = true
          this.txtValidate.msg = 'Try again. Please enter the correct seed phrase in order.'
          this.verifying = false
          return
        }

        this.txtValidate.invalid = false

        if (!this.txtValidate.invalid) {
          this.txtValidate.invalid = false
          const rp = generateKeypair(this.normalizeValue)
          this.txtValidate.invalid = this.accounts.filter(item => { return item.address === rp.address }).length > 0
          if (this.txtValidate.invalid) {
            this.txtValidate.msg = 'This wallet already imported.'
            this.verifying = false
            return
          }
          this.scrKey = rp.secretKey
          this.address = rp.address

          this.verifying = false
        }
      }
    },

    handleNameInput () {
      this.nameValidate.invalid = this.accounts.filter((item) => { return item.name === this.form.walName }).length > 0
      this.nameValidate.msg = this.nameValidate.invalid ? 'This name has been created, try another one.' : ''
      if (!this.nameValidate.invalid && this.form.walName !== '') {
        this.nameValidate.invalid = this.form.walName.length > 20
        this.nameValidate.msg = this.nameValidate.invalid ? 'No more than 20 characters.' : ''
      }
    },

    clearSeedPhrase () {
      // this.gotChildWalletTxt = 'Add Child Wallet'
    },

    async submit (e) {
      e.preventDefault()
      if (this.creating || this.verifying) {
        return
      }
      this.creating = true
      const list = [{
        scrKey: this.scrKey,
        address: this.address,
        mnemonic: this.source === 'private' ? null : this.normalizeValue
      }]
      const nonSecretList = [{
        name: this.form.walName,
        address: this.address,
        type: this.source === 'private' ? 'key' : 'seed',
        walletIndex: this.source === 'private' ? undefined : 0,
        index: this.mainWallet.total
      }]
      const accounts = [...this.accounts]
      const keyring = [...this.allWalletList]

      const total = this.mainWallet.total
      const hdw = { ...this.mainWallet, total: total + list.length }
      accounts.push(...nonSecretList)
      keyring.push(...list)

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
          if (!this.isStayHere) return
          this.$router.push({
            name: 'home'
          })
          this.creating = false
        }
      })
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/side/_importwallet.scss" scoped></style>
