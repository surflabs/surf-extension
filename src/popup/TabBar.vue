<template>
  <div class="mui-fl-1-ovhide mui-fl-col">
    <!-- <router-view v-if="!$route.meta.keepAlive" class="mui-tab-content mui-fl-1" /> -->
    <keep-alive>
      <router-view ref="ndMain" class="mui-tab-content mui-fl-1" />
    </keep-alive>
    <footer class="mui-footer mui-shr-0 mui-flex">
      <router-link
        v-for="item of tabs"
        :key="item.ico"
        :class="{ 'mui-fl-1': 1, [item.name]: 1, taplight2: 1, 'mui-fl-central item': 1  }"
        :to="item.url"
        tag="div"
        replace
      >
      </router-link>
    </footer>
  </div>
</template>

<script>
// import lottie from 'lottie-web'
// import collectiblesAnimJson from '@/assets/animation-data/collectibles.json'
// import homeAnimJson from '@/assets/animation-data/home.json'
// import swapAnimJson from '@/assets/animation-data/swap.json'
// import myAnimJson from '@/assets/animation-data/my.json'
// import collectiblesAnimDarkJson from '@/assets/animation-data/collectibles-dark.json'
// import homeAnimDarkJson from '@/assets/animation-data/home-dark.json'
// import swapAnimDarkJson from '@/assets/animation-data/swap-dark.json'
// import myAnimDarkJson from '@/assets/animation-data/my-dark.json'

export default {
  name: 'TabBar',
  data () {
    return {
      // tabs: [
      //   { url: '/', ico: 'mico-tab-wallet', sIco: 'mico-tab-wallet-selected', name: 'home', animData: homeAnimJson, animDataDark: homeAnimDarkJson },
      //   { url: 'collectibles', ico: 'mico-tab-nft', sIco: 'mico-tab-nft-selected', name: 'collectibles', animData: collectiblesAnimJson, animDataDark: collectiblesAnimDarkJson },
      //   { url: 'swap', ico: 'mico-tab-swap', sIco: 'mico-tab-swap-selected', name: 'swap', animData: swapAnimJson, animDataDark: swapAnimDarkJson },
      //   // { url: 'record', ico: 'record' },
      //   { url: 'my', ico: 'mico-tab-my', sIco: 'mico-tab-my-selected', name: 'my', animData: myAnimJson, animDataDark: myAnimDarkJson }
      // ],
      tabs: [
        { url: '/', ico: 'mico-tab-wallet', sIco: 'mico-tab-wallet', name: 'wallet' },
        { url: 'collectibles', ico: 'mico-tab-nft', sIco: 'mico-tab-nft', name: 'nft' },
        { url: 'record', ico: 'mico-tab-record', sIco: 'mico-tab-record', name: 'record' },
        { url: 'my', ico: 'mico-tab-my', sIco: 'mico-tab-my', name: 'my' }
      ],
      showAni: true
    }
  },
  // computed: {
  //   darkMode () {
  //     return this.$store.state.theme === 'dark'
  //   }
  // },
  // watch: {
  //   darkMode () {
  //     // this.toLottie()
  //     lottie.destroy()
  //     this.showAni = true
  //   },
  //   $route () {
  //     if (!this.tabs.find(item => item.name === this.$route.name)) {
  //       lottie.destroy()
  //       this.showAni = true
  //     }
  //   }
  // },
  mounted () {
    // this.toLottie()
  }
}
</script>
