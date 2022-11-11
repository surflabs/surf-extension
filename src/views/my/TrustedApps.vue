<template>
  <div class="sty2-cell mui-fl-col">
    <div class="mui-nav mui-fl-vert mui-shr-0">
      <h5 class="pg-title1 taplight2" @click="$router.go(-1)">
        <i class="mico-arrow-right-sty1"/>Trusted Apps
      </h5>
    </div>

    <ul class="sty01-gp scroll-view mui-fl-1" v-if="Object.entries(this.appsByOwner).length > 0">
      <li class="sty01-gp-head mui-flex">
        <span class="mui-fl-1">Apps</span>
        <!-- <span class="mui-shr-0 sty01-gp-col1 mui-fl-hori">Auto-approve</span> -->
        <span class="mui-shr-0 sty01-gp-col2 mui-fl-hori">Revoke</span>
      </li>

      <li v-for="[origin, val] of appsByOwner" :key="origin" class="mui-fl-vert">
        <m-image
          class="sty1-image radius_0 mui-shr-0"
          width="20"
          height="20"
          :src="val.favIconUrl"
          :loading-icon="darkMode ? placMapIconDark : placMapIcon"
          :error-icon="darkMode ? failMapIconDark : failMapIcon"
        />
        <p class="sty01-gp-t mui-fl-1 txt-ovfl nopadd">{{ origin | getHostname }}</p>
        <!-- <div class="sty01-gp-col1 mui-fl-central mui-shr-0">
          <m-switch v-model="data.autoApprove" @change="change" class="sty1-switch" size="20px" />
        </div> -->
        <div class="sty01-gp-col2 mui-fl-central mui-shr-0">
          <span class="sty01-gp-act2 mico-error taplight2" @click="askRevoke(origin)" />
        </div>
      </li>
    </ul>

    <div v-else>
      <no-list txt="No Content" />
    </div>

    <m-popup v-model="show" :close-on-click-overlay="false" class="sty1-popup mui-fl-col mui-fl-vert">
      <div class="sty5-gp">
        <div class="t">Revoke</div>
        <div class="c">Are you sure you want to disconnect {{ currRemoveOrigin }}? You may lose site functionality.</div>
        <div class="mui-fl-btw mui-fl-vert">
          <m-button class="gray middle-sty1 mui-fl-1" round @click="show = false">Cancel</m-button>
          <m-button class="middle-sty1 mui-fl-1" round type="danger" @click="doRevoke">Revoke</m-button>
        </div>
      </div>
    </m-popup>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { placeIcon } from '../../utils/mixin'
import NoList from '@/components/no-list'

export default {
  name: 'TrustedApps',
  components: {
    NoList
  },
  mixins: [placeIcon],
  data () {
    return {
      apps: {},
      show: false,
      currRemoveOrigin: ''
    }
  },
  computed: {
    ...mapGetters(['pubKey']),

    appsByOwner () {
      return Object.entries(this.apps[this.pubKey] || {}).sort((a, b) => {
        if (a[1].expiry > b[1].expiry) {
          return -1
        } else if (b[1].expiry > a[1].expiry) {
          return 1
        }
        return 0
      })
    }
  },
  async created () {
    const { trustedApps = {} } = await this.$crmStorage.get('trustedApps')
    this.apps = trustedApps
  },
  methods: {
    ...mapMutations([
      'SET_TRUSTED_APPS'
    ]),

    askRevoke (origin) {
      this.currRemoveOrigin = origin
      this.show = true
    },
    doRevoke () {
      const clone = JSON.parse(JSON.stringify(this.apps))
      delete clone[this.pubKey][this.currRemoveOrigin]
      this.apps = clone
      this.$crmStorage.set({ trustedApps: clone })
      this.SET_TRUSTED_APPS(clone)
      this.show = false
    },
    change () {
      this.$crmStorage.set({ trustedApps: this.apps })
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/my/_trusted-apps.scss" scoped></style>
