<template>
  <div>
    <div class="sty2-cell pg-chg-pass mui-fl-col">
      <div class="mui-shr-0">
        <div class="mui-nav mui-fl-vert">
          <h5 class="pg-title1 taplight2" @click="$router.go(-1)">
            <i class="mico-arrow-right-sty1"/>{{ pgHead.title }}
          </h5>
        </div>
        <p class="base-tip">{{ pgHead.tip }}</p>
      </div>

      <form class="mui-fl-1 mui-fl-col mui-fl-btw">
        <div>
          <div class="form-item">
            <input-password
              v-model="form.password"
              title="New password"
              @change="onPwdChange"
              :invalid="!validate.valid"
              :showMsg="false"
              :readonly="!saveDisabled && saving"
            />
            <p :class="{ 'form-item-info': 1, err: !validate.valid }">At least 8 characters.</p>
          </div>
              <!-- <input-password v-model="form.cfmPassword" :focus="false" @change="onCfmPwdChange" :redBorder="!samePwd"/> -->
          <div class="form-item">
            <input-password
              v-model="form.cfmPassword"
              title="Confirm password"
              @change="onCfmPwdChange"
              :invalid="!samePwd"
              :showMsg="false"
              :focused="false"
              :readonly="!saveDisabled && saving"
            />
            <p v-show="!samePwd" class="form-item-info small err">Please enter the same password.</p>
          </div>
        </div>
        <div class="mui-fl-btw">
          <m-button class="mui-fl-1 fz16 gray" round native-type="button" @click="$router.go(isStayResetNewPwdPage ? -2 : -1)">Cancel</m-button>
          <m-button class="mui-fl-1 fz16" round type="info" :disabled="saveDisabled" native-type="submit" :loading="!saveDisabled && saving" @click="submitPwd">Save</m-button>
        </div>
      </form>
    </div>
    <div v-if="!saveDisabled && saving" class="sty2-mask"></div>

    <!-- <div v-if="saving" class="mui-fl-col mui-fl-vert load-tip">
      <i class="mui-saving"></i>
      <p class="t1">Saving...</p>
    </div> -->

    <!-- <div v-if="success" class="mui-fl-col mui-fl-vert load-tip">
      <i class="save-success mico-selected"></i>
      <p class="t1">Save Success</p>
      <p class="t2 taplight2" @click="done">{{ doneTxt }}</p>
    </div> -->
    <!-- <toast v-model="value" type="error" size="large" msg='Try again, Please choose in order.' title="Backup Fail!" /> -->
  </div>
</template>

<script>
import InputPassword from '@/components/input-password'
// import toast from '@/components/toast'
import { aesDecrypt3 } from '@/utils/common'
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'SetNewPassword',
  components: { InputPassword },
  data () {
    return {
      value: true,
      submitting: false,
      form: {
        password: '',
        cfmPassword: ''
      },
      validate: {
        valid: true,
        msg: ''
      },
      samePwd: true,
      source: '',
      saving: false
    }
  },
  computed: {
    ...mapState(['allWalletList', 'mainWallet']),
    ...mapGetters(['walletList']),

    pgHead () {
      const txt = {
        setnewpwd: { title: 'Change Password', tip: 'You will use this to unlock your wallet.' },
        resetnewpwd: { title: 'Reset Password', tip: 'You will use this to unlock your wallet.' }
      }
      return txt[this.source]
    },
    isStayNewPwdPage () {
      return this.$route.name === 'setNewPass'
    },
    isStayResetNewPwdPage () {
      return this.$route.name === 'resetNewPwd'
    },
    saveDisabled () {
      return this.form.password === '' || this.form.cfmPassword === ''
    }
  },
  created () {
    this.$store.commit('SET_PWD_VALID_PASS', false)
    this.source = this.$route.query.s
  },
  methods: {
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
    async submitPwd (e) {
      e.preventDefault()
      if (this.form.password === '') {
        this.validate.valid = false
        return
      }
      this.samePwd = this.form.password === this.form.cfmPassword

      if (this.validate.valid && this.samePwd) {
        this.submitting = true

        if (this.source === 'setnewpwd') {
          if (this.mainWallet.password === this.form.password) {
            this.submitting = false
            this.$message({
              message: 'Same as old password',
              iconClass: 'mico-warn',
              customClass: 'sty1-message',
              duration: 1500,
              offset: 270,
              center: true
            })
            return
          }
          this.saving = true

          const keyring = [...this.allWalletList]
          const hdw = { ...this.mainWallet }

          hdw.password = this.form.password
          await this.$store.dispatch(
            'syncWalletStorage',
            {
              keyring,
              hdw,
              mmwNeedUpdate: true,
              needUnlocked: true
            }
          )

          this.saving = false

          this.$message({
            message: 'Success',
            iconClass: 'mico-success',
            customClass: 'sty1-message',
            duration: 1000,
            offset: 270,
            center: true,
            onClose: () => {
              this.isStayNewPwdPage && this.$router.replace({ name: 'my' })
            }
          })
          await this.$crmStorage.remove('errpass')
        } else {
          const resetParam = this.$store.state.resetParam
          if (resetParam === this.form.password) {
            this.submitting = false
            this.$message({
              message: 'Same as old password',
              iconClass: 'mico-warn',
              customClass: 'sty1-message',
              duration: 1500,
              offset: 270,
              center: true
            })
            return
          }
          this.saving = true
          const { keyringData } = await this.$crmStorage.get('keyringData')
          const rp = JSON.parse(await aesDecrypt3(keyringData, resetParam)) || {}
          const { keyring, hdw } = await rp

          if (!keyring) {
            this.saving = false
            this.$message({
              message: 'Fail',
              iconClass: 'mico-error',
              customClass: 'sty1-message error',
              duration: 3000,
              offset: 270,
              center: true
            })
            return
          }

          hdw.password = this.form.password

          await this.$store.dispatch(
            'syncWalletStorage',
            {
              keyring,
              hdw,
              mmwNeedUpdate: true
            }
          )

          this.$store.commit('SET_RESET_PARAM', null)
          await this.$crmStorage.remove('errpass')
          this.$message({
            message: 'Success',
            iconClass: 'mico-success',
            customClass: 'sty1-message',
            duration: 1000,
            offset: 270,
            center: true,
            onClose: async () => {
              this.saving = false
              const { autoLockime } = await this.$crmStorage.get('autoLockime')
              const time = this.$np.isNum(autoLockime) ? Number(autoLockime) : 15
              this.$store.commit('SET_LOGIN_EXPIRY', Date.now() + time * 60 * 1000)
              this.$router.replace(this.$route.query.redirect || '/')
            }
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/my/_base.scss" scoped></style>
<style lang="scss" src="@/assets/css/views/my/_setnewpass.scss" scoped></style>
