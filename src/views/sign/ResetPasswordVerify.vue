<template>
  <div class="sty2-cell mui-fl-col mui-fl-btw">
    <div class="mui-shr-0">
      <div class="mui-nav mui-fl-vert">
        <h5 class="pg-title1 taplight2" @click="$router.go(-1)">
          <i class="mico-arrow-right-sty1"/>Reset Password
        </h5>
      </div>
      <p class="base-tip">Verify your seed phrase to set new password.</p>
    </div>

    <form class="mui-fl-1 mui-fl-col mui-fl-btw">
      <div class="form-item">
        <!-- <m-field
          v-model="txtValue"
          rows="4"
          autosize
          type="textarea"
          class="sty11-textarea clear pad-b22 pad-r42"
          :class="{ 'error': invalid }"
          @change="handleChangeMnemonic"
          @input="handleInputMnemonic"
        />
        <template v-if="txtValue">
          <i class="icon-close input-icon" @click="txtValue = '', invalid = false"></i>
          <p :class="{'mlength': 1, 'b52': invalid }">{{ mnemonicLength }}</p>
        </template> -->
        <mui-input
          v-model="txtValue"
          title="Verify seed phrase"
          placeholder="Please enter..."
          :length="mnemonicLength"
          type="textarea"
          @input="handleInputMnemonic"
          :error="invalid"
          :errorMsg="'Incorrect seed phrase.'"
        />
        <!-- <p v-if="invalid" :class="{ 'form-item-info': 1, 'small': 1, err: invalid }">Please enter the correct seed phrase to reset your password.</p> -->

      </div>

      <!-- <div class="mui-fl-btw"> -->
        <!-- <m-button class="mui-fl-1 fz18 gray" native-type="button" @click="$router.go(-1)">Cancel</m-button> -->
      <m-button class="fz18" block round type="info" native-type="submit" :disabled="txtValue === ''" :loading="submitting" @click="submit">Next</m-button>
      <!-- </div> -->
    </form>
  </div>
</template>

<script>
// import { MD5 as MoDe5 } from 'crypto-js'
// import { signKey } from '@/utils/create'

import MuiInput from '@/components/mui-input'
import { aesDecrypt3 } from '@/utils/common'

export default {
  name: 'ResetPassword',
  components: {
    MuiInput
  },
  data () {
    return {
      submitting: false,
      txtValue: '',
      invalid: false
    }
  },
  computed: {
    normalizeValue () {
      return this.txtValue.trim().replace(/\s+/g, ' ')
    },
    mnemonicLength () {
      return this.txtValue ? (this.normalizeValue.split(' ') || []).length : 0
    },
    isStayHere () {
      return this.$route.name === 'resetPwdVerify'
    }
  },
  methods: {
    async handleChangeMnemonic () {
      if (this.txtValue === '') {
        return false
      }
      const { mep } = await this.$crmStorage.get(['mep'])

      const pwd = await aesDecrypt3(mep, this.normalizeValue)
      if (!pwd || !this.isStayHere) {
        this.invalid = true
      } else {
        this.invalid = false
        this.$store.commit('SET_RESET_PARAM', pwd)
      }
    },
    handleInputMnemonic () {
      this.invalid = false
    },
    async submit (e) {
      e.preventDefault()
      this.submitting = true

      await this.handleChangeMnemonic()

      if (this.txtValue === '' || this.invalid === true) {
        this.invalid = true
        this.submitting = false
        return
      }
      this.$router.push({
        path: '/resetnewpwd',
        query: { s: 'resetnewpwd' }
      })
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/my/_base.scss" scoped></style>
<style lang="scss" scoped>
  .mlength {
    font-size: 14px;
    line-height: 22px;
    color: var(--text4-color);
    position: absolute;
    bottom: 12px;
    right: 16px;
    z-index: 10;
    &.b52 {
      bottom: 52px;
    }
  }
</style>
