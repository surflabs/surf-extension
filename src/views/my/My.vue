<template>
  <div ref="ndMain" class="pg-my">
    <div class="wallet">
      <p class="pubkey mui-fl-vert">
        <span>{{ pubKey | formatPubKey }}</span>
        <i class="mico-copy taplight" @click="copyPubKey"></i>
      </p>
      <input type="text" v-model="pubKey" ref="ndIptPubKey" class="ipt-hidden">
      <div class="wname mui-fl-vert mui-fl-btw">
        <p class="txt-ovfl mui-fl-1">{{ curAccount.name }}</p>
        <i class="mui-shr-0 mico-arrow-right1 taplight2" @click="$router.push('/chgname')"/>
      </div>
    </div>
    <ul class="sty7-gp">
      <router-link :to="{ path: '/confirmpwd', query: { s: 'setnewpass' } }">
        <li class="taplight2 mui-fl-btw mui-fl-vert">
          <p class="mui-fl-vert">
            <i class="mico-password icon-sty1"></i>
            Change Password
          </p>
          <i class="mico-arrow-right-sty1"></i>
        </li>
      </router-link>
      <router-link :to="{ path: '/chgnetwork' }">
        <li class="taplight2 mui-fl-btw mui-fl-vert">
          <p class="mui-fl-vert">
            <i class="mico-network icon-sty1"></i>
            Change Network
          </p>
          <i class="mico-arrow-right-sty1"></i>
        </li>
      </router-link>
      <router-link :to="{ path: '/autolock' }">
        <li class="taplight2 mui-fl-btw mui-fl-vert">
          <p class="mui-fl-vert">
            <i class="mico-time-clock icon-sty1"></i>
            Auto-Lock Timer
          </p>
          <i class="mico-arrow-right-sty1"></i>
        </li>
      </router-link>
      <li class="mui-fl-btw mui-fl-vert">
        <p class="mui-fl-vert">
          <i class="mico-moon icon-sty1"></i>
          Dark Mode
        </p>
        <m-switch v-model="theme" class="sty1-switch" size="20px" @change="helpAndSupport"/>
      </li>
      <li class="taplight2 mui-fl-btw mui-fl-vert" @click="helpAndSupport">
        <p class="mui-fl-vert">
          <i class="mico-language icon-sty1"></i>
          Language
        </p>
        <p class="t2 mui-fl-vert">
          English
          <i class="mico-arrow-right-sty1"></i>
        </p>
      </li>
    </ul>

    <ul class="sty7-gp">
      <router-link :to="{ path: '/confirmpwd', query: { s: 'private' } }">
        <li class="taplight2 mui-fl-btw mui-fl-vert">
          <p class="mui-fl-vert">
            <i class="mico-private icon-sty1"></i>
            Show Private Key
          </p>
          <i class="mico-arrow-right-sty1"></i>
        </li>
      </router-link>
      <router-link v-if="curAccount.type === 'seed'" :to="{ path: '/confirmpwd', query: { s: 'mnemonic' } }">
        <li class="taplight2 mui-fl-btw mui-fl-vert">
          <p class="mui-fl-vert">
            <i class="mico-key icon-sty1"></i>
            Show Seed Phrase
          </p>
          <i class="mico-arrow-right-sty1"></i>
        </li>
      </router-link>
      <li class="taplight2 mui-fl-btw mui-fl-vert" @click="helpAndSupport">
        <p class="mui-fl-vert">
          <i class="mico-customer-service icon-sty1"></i>
          Help and Support
        </p>
        <i class="mico-arrow-right-sty1"></i>
      </li>
    </ul>

    <m-button class="fz18 delete-btn" round block type="danger" @click="$router.push('/remove')">
      <span class="mui-fl-vert">
        <i class="mico-delete" /> Remove
      </span>
    </m-button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'My',
  computed: {
    ...mapGetters(['pubKey', 'curAccount']),
    theme () {
      return false
    }
    // theme: {
    //   set (val) {
    //     const ndHtml = document.querySelector('html')
    //     if (!val) {
    //       ndHtml.classList.add('dark')
    //     } else {
    //       ndHtml.classList.remove('dark')
    //     }
    //     this.$store.commit('SET_THEME', {
    //       theme: !val ? 'dark' : 'light',
    //       setLocal: true
    //     })
    //   },
    //   get () {
    //     return this.$store.state.theme === 'light'
    //   }
    // }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$nextTick(() => {
        const prevScrY = to.meta.saveScrollY
        if (prevScrY) {
          vm.$refs.ndMain.scrollTop = prevScrY
        }
      })
    })
  },
  beforeRouteLeave (to, from, next) {
    this.$route.meta.saveScrollY = this.$refs.ndMain.scrollTop
    next()
  },
  methods: {
    copyPubKey () {
      this.$refs.ndIptPubKey.select()
      document.execCommand('copy')
      this.$message({
        message: 'Copy Success',
        iconClass: 'mico-success',
        customClass: 'sty1-message',
        duration: 1000,
        offset: 270,
        center: true
      })
    },
    helpAndSupport () {
      this.$message({
        message: 'Coming soon',
        iconClass: 'mico-warn',
        customClass: 'sty1-message',
        duration: 2000,
        offset: 270,
        center: true
      })
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/my/_my.scss" scoped></style>
