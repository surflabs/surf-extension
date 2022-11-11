<template>
  <div class="sty2-cell mui-fl-col mui-fl-btw">
    <div class="mui-fl-1">
      <div class="mui-nav mui-fl-vert">
        <h5 class="pg-title1 taplight2" @click="$router.go(-1)">
          <i class="mico-arrow-right-sty1"/>Your Seed Phrase
        </h5>
      </div>

      <div :class="{'content mui-fl-col mui-fl-central': 1, 'h328': txtValueArr.length === 24, 'h160': txtValueArr.length === 12}" v-if="!show">
        <p class="copy-btn mui-fl-central">
          <span class="mui-fl-vert taplight2" @click="show = true">
            <i class="mico-click" /> Click to reveal Seed Phrase
          </span>
        </p>
        <p class="tip">Make sure no one is watching your screen. Save it in a place where only you can access. If you lose it, not even Surf can help you recover it.</p>
      </div>

      <ul class="content-words mui-fl-wrap mui-fl-vert" v-if="show">
        <li v-for="(i, index) of txtValueArr" :key="index">{{ i }}</li>
      </ul>
      <input v-model="txtValue" ref="ndTxtarea" class="ipt-hidden">
    </div>

    <div class="mui-shr-0">
      <p v-if="show" :class="{'copy-btn mui-fl-central marg-b': 1, 'disabled': copyBtnDisabled}">
        <span class="mui-fl-vert taplight2" @click="copy">
          <i v-if="!copyBtnDisabled" class="mico-copy" /> {{ copytext }}
        </span>
      </p>
      <m-button class="fz18 mui-fl-1" type="info" round block :disabled="!show" @click="savedIt">I've saved it</m-button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'Export',
  data () {
    return {
      show: false,
      copytext: 'Copy to clipboard',
      copyBtnDisabled: false,
      source: ''
    }
  },
  computed: {
    ...mapState(['mainWallet', 'accounts']),
    ...mapGetters(['curWallet', 'curWalIdx', 'curAccount']),

    txtValue () {
      return this.curWallet.mnemonic || this.mainWallet.mnemonic
    },
    txtValueArr () {
      return this.txtValue && this.txtValue.split(' ')
    }
  },
  created () {
    this.$store.commit('SET_PWD_VALID_PASS', false)
  },
  methods: {
    async copy () {
      if (this.copyBtnDisabled) return
      this.$refs.ndTxtarea.select()
      document.execCommand('copy')
      this.copytext = 'copied!'
      this.copyBtnDisabled = true
      setTimeout(() => {
        this.copyBtnDisabled = false
        this.copytext = 'Copy to clipboard'
      }, 1000)
      this.backup()
    },
    savedIt () {
      this.$router.back()
      this.backup()
    },
    async backup () {
      if (this.curAccount.isNeedNote) {
        const accounts = [...this.accounts]

        accounts[this.curWalIdx].isNeedNote = false

        this.$store.commit('SET_ACCOUNTS', accounts)
      }
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/my/_export.scss" scoped></style>
