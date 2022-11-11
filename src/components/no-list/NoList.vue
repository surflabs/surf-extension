<template>
  <div class="sty2-gp mui-fl-col mui-fl-vert">
    <p class="placmap" :style="{ backgroundImage: `${bgImage}`, backgroundSize: '100px' }"></p>
    <p class="tip">{{ txt }}</p>
  </div>
</template>

<script>
export default {
  name: 'NoList',
  props: {
    txt: {
      type: String,
      required: false,
      default: 'No Records'
    },
    networkError: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    bgImage () {
      var bgImg = ''
      if (this.networkError) {
        bgImg = 'var(--network-error-placemap)'
        return bgImg
      }
      const routeName = this.$route.name
      if (routeName === 'collectibles') {
        bgImg = 'var(--no-colletion-placmap)'
      } else if (routeName === 'record' || routeName === 'tokenRecord') {
        bgImg = 'var(--no-record-placmap)'
      } else if (routeName === 'trustedApps') {
        bgImg = 'var(--no-popular-token-placmap)'
      }
      if (routeName === 'PopularToken' || routeName === 'Receivespage') {
        if (this.txt === 'No Results') {
          bgImg = 'var(--no-result-placmap)'
        } else if (this.txt === 'No Records') {
          bgImg = 'var(--no-popular-token-placmap)'
        }
      }
      return bgImg
    }
  }
}
</script>
