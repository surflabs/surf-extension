<template>
  <div class="sty3-cell mui-fl-col">
    <div class="scroll-view mui-fl-1 mui-fl-col">
      <div class="source-info mui-fl-col mui-fl-vert">
        <img class="mui-shr-0" v-if="showLogo" :src="favIconUrl" @error="showLogo = false">
        <h1 class="source-info-t">{{ shortTitle }}</h1>
        <p class="origin">{{ origin }}</p>
      </div>

      <h3>Want to connect to</h3>

      <div class="com-info">
        <div class="mui-fl-vert wallet-outer">
          <div class="wallet">
            <p class="txt-ovfl">{{ curAccount.name }}</p>
            <p>{{ curAccount.address | formatPubKey }}</p>
          </div>
        </div>
      </div>

      <h4 class="com-info-t">This app will be able to:</h4>
      <div class="com-info">
        <ul class="sty9-gp">
          <li class="mui-fl-vert"><i class="mico-success tick" /><span>View wallet balance and activity</span></li>
          <li class="mui-fl-vert"><i class="mico-success tick" /><span>Request approval for transactions</span></li>
        </ul>
      </div>

      <h4 class="com-info-t">It will not be able to:</h4>
      <div class="com-info">
        <ul class="sty9-gp">
          <li class="mui-fl-vert"><i class="mico-error cross" /><span>Move funds without your permission</span></li>
        </ul>
      </div>
    </div>

    <div class="bottom-act-bar mui-fl-btw">
      <m-button class="mui-fl-1 fz16 gray" round @click="cancel">Cancel</m-button>
      <m-button class="mui-fl-1 fz16" round type="info" @click="connect">Connect</m-button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import mixin from './mixin'

export default {
  name: 'Login',
  mixins: [mixin],
  data () {
    return {
      id: this.$route.query.id,
      origin: this.$route.query.origin,
      autoApprove: false,
      shieldMap: []
    }
  },
  computed: {
    ...mapGetters(['pubKey', 'curAccount']),

    isConnect () {
      let url = this.origin || ''
      url = url.split('?')[0]
      for (let i = 0; i < this.shieldMap.length; i++) {
        const el = this.shieldMap[i]
        if (url.indexOf(el) !== -1) {
          return false
        }
      }
      return true
    }
  },
  async created () {
    this.shieldMap = await this.$bgStorage.get('blocklist') || []
  },
  methods: {
    async connect () {
      this.$sendMessage({
        channel: 'POPUP_TO_DAPP',
        id: this.id,
        origin: this.origin,
        method: 'CONNECTED',
        data: [this.pubKey],
        code: 200
      })

      const { trustedApps = {} } = await this.$crmStorage.get('trustedApps')

      if (!trustedApps[this.pubKey]) {
        trustedApps[this.pubKey] = {}
      }
      trustedApps[this.pubKey][this.origin] = {
        favIconUrl: this.favIconUrl,
        permissions: ['viewAccount', 'suggestTransactions'],
        expiry: Date.now() + Number(process.env.VUE_APP_CONNECTED_PERIOD)
      }
      await this.$crmStorage.set({ trustedApps })
      window.close()
    },
    cancel () {
      this.sendCancel()
      window.close()
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/_connect.scss" scoped></style>
