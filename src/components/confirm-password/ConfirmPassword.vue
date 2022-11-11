<template>
  <div>
    <m-popup v-model="showPwdConfirm" class="sty1-popup mui-fl-col mui-fl-vert">
      <div class="sty5-gp">
        <div class="t">Enter your password to confirm the transaction</div>
        <form class="sty1-form-item">
          <input-password
            ref="ndPwd"
            v-model="password"
            title="Password"
            :invalid="invalid"
            @blur="handleBlur"
            @input="handleInput"
          />
          <p v-if="!hideReset" class="reset taplight2" @click="$router.push('/resetpwd-verify')">
            Reset Password
          </p>
          <m-button class="middle-sty1" type="info" round block native-type="submit" :disabled="disabled" :loading="submitting" @click="onKeyDown">Confirm</m-button>
        </form>
      </div>
    </m-popup>
  </div>
</template>
<script>
import InputPassword from '../input-password'

export default {
  components: { InputPassword },
  props: {
    // showPwdConfirm: {
    //   default: false,
    //   typeof: Boolean,
    //   required: true
    // }
    hideReset: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      submitting: false,
      showPwdConfirm: false,
      password: '',
      disabled: true,
      invalid: false
    }
  },
  methods: {
    handleBlur (e) {
      this.invalid = e
    },
    handleInput (e) {
      this.invalid = false
      this.disabled = !this.password.length > 0
    },
    async onKeyDown (e) {
      e.preventDefault()
      if (!this.showPwdConfirm) {
        return
      }
      if (this.submitting) {
        return
      }
      this.submitting = true
      const rp = await this.$refs.ndPwd.validate()
      this.invalid = !rp || !rp.keyring

      if (!this.invalid) {
        // this.showPwdConfirm = false
        // this.confirm()
        this.$emit('confirm')
        this.submitting = false
      } else {
        this.submitting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.middle-sty1 {
  margin: 20px auto 0;
}
</style>
