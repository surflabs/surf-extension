<template>
  <div class="wrap shadow">
    <Header />

    <!-- <transition :name="transitionName">
      <router-view class="mui-main slide-view" key="inner-page" />
    </transition> -->

    <transition :name="transitionName">
      <keep-alive include="TabBar,StakingMethods,SendNft">
        <router-view class="mui-main slide-view" />
      </keep-alive>
    </transition>
  </div>
</template>

<script>
import Header from '@/popup/Header'
import { mapState, mapMutations } from 'vuex'
import { placeIcon } from '@/utils/mixin'
export default {
  name: 'App',
  components: { Header },
  mixins: [placeIcon],
  data () {
    return {
      transitionName: 'slide-left',
      mouseDownType: ''
    }
  },
  computed: {
    ...mapState({
      // wsIsConnected: ({ ws }) => ws.isConnected,
      routingDirection: ({ common }) => common.routingDirection
    })
  },
  async created () {
    window.addEventListener('mousedown', e => {
      const types = ['', '', '', '', 'forward']
      this.mouseDownType = types[e.button]
    })

    const [
      { accounts }
    ] = await Promise.all([
      this.$crmStorage.get('accounts')
    ])
    accounts.forEach((v, index) => {
      if (!v.index) {
        v.index = index
      }
    })
    this.$store.commit('SET_ACCOUNTS', accounts)
  },
  mounted () {
    setTimeout(() => {
      if (!(window.innerWidth <= 375 && window.innerHeight === 600)) {
        document.querySelector('html').classList.add('browserHtml')
      }
    }, 200)
  },
  watch: {
    '$route' (to, from) {
      let name = this.routingDirection === 'forward' || this.mouseDownType === 'forward'
        ? 'slide-left'
        : 'slide-right'
      if (!from.name && from.fullPath === '/') {
        name = ''
      } else if (to.meta.source === 'tab' && from.name !== 'login' && from.meta.animation !== 'up') {
        name = 'slide-right'
      } else if (to.meta.animation === 'up' && from.meta.animation === 'down') {
        name = 'slide-up'
      } else if (to.meta.animation === 'down' && from.meta.animation === 'up') {
        name = 'slide-down'
      }
      this.SET_ROUTING_DIRECTION('')
      this.mouseDownType = ''
      this.transitionName = name
    }
  },
  methods: {
    ...mapMutations([
      'SET_ROUTING_DIRECTION'
    ])

    // ...mapActions([
    //   'accountUnsubscribe',
    //   'accountSubscribe',
    //   'programSubscribe'
    // ])
  }
}
</script>

<style lang="scss">
  .wrap {
    &.shadow {
      box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.1);

      overflow: hidden;
    }
  }
  html {
    width: 375px;
    // display: flex;
    // align-items: center;
    // justify-content: center;
    min-height: 600px;
  }
  body {
    width: 100%;
    max-height: 600px;
  }

  .browserHtml {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    body {
      width: 375px;
      height: 600px;
    }
  }
</style>
