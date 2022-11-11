<template>
  <div class="sty2-cell mui-fl-col mui-fl-btw">
    <div class="mui-shr-0">
      <div class="mui-nav ">
        <h5 class="pg-title1 taplight2" @click="$router.go(-1)">
          <i class="mico-arrow-right-sty1"/>{{ pgHead.title }}
        </h5>
      </div>
      <p class="base-tip">{{ pgHead.tip }}</p>
    </div>

    <form class="mui-fl-1 mui-fl-col mui-fl-btw">
      <div class="form-item">
        <!-- <input-password v-model="password" ref="ndPwd" @blur="handleBlur" @input="handleInput" /> -->
        <input-password
          ref="ndPwd"
          v-model="password"
          :title="pgHead.iptTitle"
          :invalid="invalid"
          @blur="handleBlur"
          @input="handleInput"
        />
      </div>

      <div>
        <div class="sty1-tip mui-flex" v-if="source === 'private' || source === 'mnemonic'">
          <i class="mui-shr-0 mico-warn"></i>
          <div class="mui-fl-1">
            Make sure no one is watching your screen. Save it in a place where only you can access. If you lose it, not even Surf can help you recover it.
          </div>
        </div>
        <div class="mui-fl-btw">
          <template v-if="source === 'remove'">
            <m-button class="mui-fl-1 fz16 gray" round native-type="button" @click="$router.go(-1)">Cancel</m-button>
            <m-button class="mui-fl-1 fz16" round type="danger" native-type="submit" :disabled="disabled" :loading="submitting" @click="submit">Remove</m-button>
          </template>
          <template v-else>
            <m-button class="mui-fl-1 fz18" round type="info" native-type="submit" :disabled="disabled" :loading="submitting" @click="submit">Next</m-button>
          </template>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import InputPassword from '@/components/input-password'
import { aesEncrypt3 } from '@/utils/common'
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'ConfirmPassword',
  components: { InputPassword },
  data () {
    return {
      submitting: false,
      source: '',
      password: '',
      invalid: false
    }
  },
  computed: {
    ...mapState(['allWalletList', 'mainWallet', 'accounts']),
    ...mapGetters(['curWalIdx', 'pubKey']),

    disabled () {
      return this.password === ''
    },
    pgHead () {
      const txt = {
        setnewpass: {
          title: 'Change Password', iptTitle: 'Current password', tip: 'Verify your password to set new password.'
        },
        private: {
          title: 'Show Private Key', iptTitle: 'Verify password', tip: 'Verify your password to show private key.'
        },
        mnemonic: {
          title: 'Show Seed Phrase', iptTitle: 'Verify password', tip: 'Verify your password to backup seed phrase.'
        },
        remove: {
          title: 'Remove Wallet', iptTitle: 'Verify password', tip: 'Verify your password to remove wallet.'
        },
        createNewWallet: {
          title: 'Create a New Wallet', iptTitle: 'Verify password', tip: 'Verify your password to create a new wallet.'
        },
        importPrivate: {
          title: 'Import Private Key', iptTitle: 'Verify password', tip: 'Verify your password to import private key.'
        },
        importSeedPhrase: {
          title: 'Import Seed Phrase', iptTitle: 'Verify password', tip: 'Verify your password to import seed phrase.'
        }
      }
      return txt[this.source]
    },
    isStayHere () {
      return this.$route.name === 'confirmPwd'
    }
  },
  created () {
    this.source = this.$route.query.s
  },
  methods: {
    handleBlur (e) {
      this.invalid = e
    },
    handleInput (e) {
      this.invalid = false
    },
    async submit (e) {
      e.preventDefault()
      this.submitting = true

      const rp = await this.$refs.ndPwd.validate()
      // this.invalid = rp !== 'success'
      if (rp && rp.keyring && this.isStayHere) {
        this.$store.commit('SET_PWD_VALID_PASS', true)
        if (this.source === 'createNewWallet') {
          this.$router.replace({
            path: '/create-new-wallet',
            query: {
              currStep: 1
            }
          })
        } else if (this.source === 'importPrivate') {
          this.$router.replace({
            path: '/importWallet',
            query: {
              s: 'private'
            }
          })
        } else if (this.source === 'importSeedPhrase') {
          this.$router.replace({
            path: '/importWallet',
            query: {
              s: 'seedPhrase'
            }
          })
        } else if (this.source === 'remove') {
          this.remove()
        } else {
          this.$router.replace({
            path: this.source === 'setnewpass' ? '/setnewpass' : `/export-${this.source}`,
            query: {
              s: this.source === 'setnewpass' ? 'setnewpwd' : this.$route.query.s
            }
          })
        }
      } else {
        this.submitting = false
      }
    },
    async remove () {
      const accounts = [...this.accounts]
      const keyring = [...this.allWalletList]
      const hdw = { ...this.mainWallet }

      // let needNoteNum = 0
      // Object.keys(this.allWalletList).forEach(m => {
      //   needNoteNum = needNoteNum + this.allWalletList[m].filter(v => v.isNeedNote).length
      // })
      // if (needNoteNum === 0) {
      //   hdw.isNeedNote = false
      //   localStorage.removeItem('hasNoteInfo')
      // }

      accounts.splice(this.curWalIdx, 1)
      keyring.splice(this.curWalIdx, 1)

      if (keyring.length === 0) {
        localStorage.clear()
        await Promise.all([
          this.$crmStorage.remove(['keyringData', 'accounts', 'loginAccount'])
        ])
        this.$store.commit('CLEAR_HIDDEN_TOKENS', this.pubKey)
        chrome.tabs.create({ url: 'index.html' })
      } else {
        const ciphertext = await aesEncrypt3(
          JSON.stringify({ keyring, hdw }),
          this.mainWallet.password
        )
        if (!this.isStayHere) return
        await this.$crmStorage.set({
          keyringData: ciphertext
        })

        this.$store.commit('SET_ACCOUNTS', accounts)
        this.$store.commit('SET_ALL_WALLET_LIST', keyring)
        this.$store.commit('SET_MAIN_WALLET', hdw)

        this.$store.commit('CLEAR_BALANCES')
        this.$store.commit('CLEAR_HIDDEN_TOKENS', this.pubKey)

        if (keyring.length === 0) {
          this.$store.commit('SET_CUR_WAL_IDX', 0)
        } else {
          this.$store.commit('SET_CUR_WAL_IDX', this.curWalIdx)
        }
      }
      this.$message({
        message: 'Remove Success',
        iconClass: 'mico-success',
        customClass: 'sty1-message',
        duration: 500,
        offset: 270,
        center: true,
        onClose: () => {
          this.isStayHere && this.$router.replace('/')
        }
      })
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/my/_base.scss" scoped></style>
