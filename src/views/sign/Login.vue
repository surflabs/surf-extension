<template>
  <div class="pg-login">
    <div class="mui-fl-col mui-fl-vert mui-shr-0">
      <img src="~@/assets/img/logo2.png" class="img-logo">
      <h5 class="title-logo">Welcome Back</h5>
    </div>
    <form>
      <input-password
        ref="ndPwd"
        v-model="password"
        title="Password"
        :invalid="invalid"
        @blur="handleBlur"
        @input="handleInput"
      />
      <p :class="{'reset taplight2': 1, 'mt66': invalid}" @click="$router.push('/resetpwd-verify')">
        Forgot password?
      </p>
      <m-button class="fz18 fw700" type="info" round block native-type="submit" :disabled="disabled" :loading="submitting" @click="submit">Unlock</m-button>
    </form>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import InputPassword from '@/components/input-password'

export default {
  name: 'Login',
  components: { InputPassword },
  data () {
    return {
      submitting: false,
      password: '',
      disabled: true,
      invalid: false
    }
  },
  computed: {
    ...mapState(['accounts']),
    ...mapState({
      isNeedNote: ({ common }) => common.isNeedNote,
      noMoreReminders: ({ common }) => common.noMoreReminders
    }),

    ...mapGetters(['pubKey'])
  },
  async created () {
  },
  methods: {
    handleBlur (e) {
      this.invalid = e
    },
    handleInput (e) {
      this.invalid = false
      this.disabled = !this.password.length > 0
    },
    async submit (e) {
      e.preventDefault()
      this.submitting = true

      const rp = await this.$refs.ndPwd.validate()
      this.invalid = !rp || !rp.keyring

      if (!this.invalid) {
        await this.updateLoginExpiry()

        const redirect = this.$route.query.redirect || ''

        if (redirect.startsWith('/connect')) {
          // e.g. /connect?origin=https%3A%2F%2Fraydium.io&id=291-7_1633967268867
          const qr = new URLSearchParams(redirect.replace(/\/connect/i, ''))
          const { trustedApps = {} } = await this.$crmStorage.get('trustedApps')
          const app = (trustedApps[this.pubKey] || {})[qr.get('origin')]
          const id = qr.get('id')

          if (app) {
            this.$sendMessage({
              channel: 'POPUP_TO_DAPP',
              id,
              origin: qr.get('origin'),
              method: 'CONNECTED',
              data: [this.pubKey],
              code: 200
            })

            window.close()
          } else {
            this.$router.replace(this.$route.query.redirect || '/')
          }
          //
        } else if (redirect.startsWith('/sign-tx')) {
          //
          this.$router.replace(this.$route.query.redirect || '/')
          //
        } else {
          this.$router.replace(this.$route.query.redirect || '/')
          // eslint-disable-next-line no-unused-vars
          const needNoteNum = this.accounts.filter(v => v.isNeedNote).length

          if (!this.noMoreReminders && this.isNeedNote && needNoteNum > 0) {
            const hasNoteInfo = JSON.parse(localStorage.getItem('hasNoteInfo')) || {}
            // Timestamp at zero o'clock of the day
            const zeroTimeStamp = Date.parse(new Date(new Date(new Date().toLocaleDateString()).getTime()))
            const isNewDay = hasNoteInfo.timestamp - zeroTimeStamp < 0
            const jsonString = JSON.stringify({
              num: isNewDay ? 1 : (hasNoteInfo.num - 0 + 1 || 1),
              isShow: true,
              timestamp: Date.parse(new Date())
            })
            this.$store.commit('SET_HAS_NOTE_INFO', jsonString)
          }
        }
      } else {
        this.submitting = false
      }
    },

    async updateLoginExpiry () {
      const { autoLockime } = await this.$crmStorage.get('autoLockime')
      const time = this.$np.isNum(autoLockime) ? Number(autoLockime) : 15
      this.$store.commit('SET_LOGIN_EXPIRY', Date.now() + time * 60 * 1000)
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/_login.scss" scoped></style>
