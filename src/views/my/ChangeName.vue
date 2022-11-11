<template>
  <div class="sty2-cell mui-fl-col mui-fl-btw">
    <div class="mui-nav">
      <h5 class="pg-title1 taplight2" @click="$router.go(-1)">
        <i class="mico-arrow-right-sty1" />Change Wallet Name
      </h5>
    </div>

    <form class="diy-holder mui-fl-1 mui-fl-col mui-fl-btw">
      <div class="form-item marg-t">
        <mui-input
          v-model="form.walName"
          title="Wallet name"
          placeholder="Enter wallet name ..."
          maxlength="20"
          @input="handleInput"
          :error="validate.valid"
          :errorMsg="validate.msg"
        />
      </div>

      <div class="mui-fl-btw">
        <m-button class="mui-fl-1 fz16 gray" round native-type="button" @click="$router.go(-1)">Cancel</m-button>
        <m-button class="mui-fl-1 fz16" round type="info" native-type="submit" :disabled="disabled" :loading="submitting" @click="submit">Save</m-button>
      </div>
    </form>
  </div>
</template>

<script>
import MuiInput from '@/components/mui-input'
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'ChangeName',
  components: {
    MuiInput
  },
  data () {
    return {
      submitting: false,
      form: {
        walName: ''
      },
      validate: {
        valid: false,
        msg: ''
      }
    }
  },
  computed: {
    ...mapState(['accounts']),
    ...mapGetters(['curWalIdx']),

    disabled () {
      return this.form.walName === ''
    },
    isStayHere () {
      return this.$route.name === 'chgName'
    }
  },
  methods: {
    handleInput () {
      this.validate.valid = this.accounts.filter((item) => { return item.name === this.form.walName }).length > 0
      this.validate.msg = this.validate.valid ? 'This name has been created, try another one.' : ''
      if (!this.validate.valid && this.form.walName !== '') {
        this.validate.valid = this.form.walName.length > 20
        this.validate.msg = this.validate.valid ? 'No more than 20 characters.' : ''
      }
    },
    async submit (e) {
      e.preventDefault()
      if (this.validate.valid) {
        return
      }
      this.submitting = true

      const accounts = [...this.accounts]
      accounts[this.curWalIdx].name = this.form.walName

      this.$store.commit('SET_ACCOUNTS', accounts)
      this.submitting = false
      this.$message({
        message: 'Success',
        iconClass: 'mico-success',
        customClass: 'sty1-message',
        duration: 500,
        offset: 270,
        center: true,
        onClose: () => {
          this.isStayHere && this.$router.go(-1)
        }
      })
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/my/_base.scss" scoped></style>
<style lang="scss" src="@/assets/css/views/my/_chgname.scss" scoped></style>
