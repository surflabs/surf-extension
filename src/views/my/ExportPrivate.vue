<template>
  <div class="sty2-cell mui-fl-col mui-fl-btw">
    <div>
      <div class="mui-nav mui-fl-vert">
        <h5 class="pg-title1 taplight2" @click="$router.go(-1)">
          <i class="mico-arrow-right-sty1"/>Your Private Key
        </h5>
      </div>

      <div class="content">
        <p class="t">{{ curWallet.scrKey }}</p>
        <p :class="{'copy-btn mt mui-fl-central': 1, 'disabled': copyBtnDisabled}">
          <span class="mui-fl-vert taplight2" @click="copy">
            <i v-if="!copyBtnDisabled" class="mico-copy" /> {{ copytext }}
          </span>
        </p>
      </div>
      <input v-model="curWallet.scrKey" ref="ndTxtarea" class="ipt-hidden">
    </div>
    <div>
      <div class="sty1-tip mui-flex">
        <i class="mui-shr-0 mico-warn"></i>
        <div class="mui-fl-1">
          Make sure no one is watching your screen. Save it in a place where only you can access. If you lose it, not even Surf can help you recover it.
        </div>
      </div>
      <div class="mui-fl-btw">
        <m-button class="fz18 mui-fl-1" type="info" round block @click="$router.back()">Done</m-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Export',
  data () {
    return {
      copytext: 'Copy to clipboard',
      copyBtnDisabled: false
    }
  },
  computed: {
    curWallet () {
      return this.$store.getters.curWallet
    }
  },
  created () {
    this.$store.commit('SET_PWD_VALID_PASS', false)
  },
  methods: {
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
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/my/_base.scss" scoped></style>
<style lang="scss" src="@/assets/css/views/my/_export.scss" scoped></style>
