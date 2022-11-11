<template>
  <div class="sty2-cell">
    <div class="mui-nav mui-fl-vert">
      <h5 class="pg-title1 taplight2" @click="$router.back()">
        <i class="mico-arrow-right-sty1"/>Change Network
      </h5>
    </div>
    <ul class="mui-flex">
      <div class="list mui-fl-1">
        <li v-for="(i, index) of networkList" :key="index" class="mui-fl-vert mui-fl-btw taplight2" @click="selectAndJudgeNetwork(i, index)">
          <div style="overflow:hidden">
            <p class="n">{{ i.label }}</p>
            <p class="u txt-ovfl nopadd">{{ i.apiUrl }}</p>
          </div>
          <p v-show="ischecked(i)" class="icon-checked"></p>
        </li>
      </div>
    </ul>

    <!-- <m-popup v-model="show" class="sty1-popup mui-fl-col mui-fl-vert" :close-on-click-overlay='false'>
      <div class="sty5-gp">
        <i class="mico-Unionmico-warn-big icon warn-icon mui-shr-0"></i>

        <div class="t">Attention</div>
        <div class="c mb28 txt-l">
          You are about to switch to the {{ selectInfo && selectInfo.label }}; this network is meant for {{ envNetwork.toLowerCase() }} purposes only. Please be aware that tokens on the {{ envNetwork }} Network DO NOT HOLD ANY REAL MONETARY VALUE. Be sceptical of any party sending you Devnet token. Do you wish to proceed?
        </div>
        <div class="mui-fl-btw mui-fl-vert">
          <m-button class="gray middle-sty1 mui-fl-1" round type="info" @click="show = false">Cancel</m-button>
          <m-button class="middle-sty1 mui-fl-1" round type="info" @click="switchNetwork">Proceed</m-button>
        </div>
      </div>
    </m-popup> -->
  </div>
</template>

<script>
import { CLUSTERS_SUI } from '@/utils/clusters'
import { mapState } from 'vuex'

export default {
  name: 'ChangeNetwork',
  data () {
    return {
      networkList: CLUSTERS_SUI,
      show: false,
      selectInfo: null,
      envNetwork: ''
    }
  },

  computed: {
    ...mapState(['endpoint', 'allWalletList'])
  },

  methods: {
    ischecked (item) {
      return item.apiUrl === this.endpoint
    },
    selectAndJudgeNetwork (i, index) {
      if (i.apiUrl === this.endpoint) return
      this.selectInfo = i
      this.envNetwork = this.envNetworkTxt(i.label)
    },

    envNetworkTxt (label) {
      let txt = ''
      if (label.indexOf('Test') !== -1) {
        txt = 'Test'
      } else if (label.indexOf('Dev') !== -1) {
        txt = 'Development'
      }
      return txt
    },

    switchNetwork () {
      this.networkList.list.forEach(v => {
        v.ischecked = false
      })
      this.selectInfo.ischecked = true
      this.allWalletList.forEach(v => {
        this.$store.commit('SET_SPECIFIED_PUBKEY_BALANCES', {
          specifiedPubKey: v.address,
          balancesList: []
        })
      })

      this.$store.commit('SET_ENDPOINT', this.selectInfo.apiUrl)
      this.$store.commit('CLEAR_BALANCES')
      this.$store.commit('SET_LASTTIME_SEND', '')
      this.$router.push('/')
      this.show = false
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/my/_base.scss" scoped></style>
<style lang="scss" src="@/assets/css/views/my/_chgnetwork.scss" scoped></style>
