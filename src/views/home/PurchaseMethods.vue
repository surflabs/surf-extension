<template>
  <div>
    <div class="mui-nav">
      <h1 class="pg-title1 taplight2" @click="goback">
        <i class="mico-arrow-right-sty1"/>Purchase Method
      </h1>
    </div>

    <ul class="sty6-gp">
      <li v-for="item of list" :key="item.name" @click="handleClk(item.name)" class="mui-fl-btw mui-fl-vert taplight">
        <div class="mui-fl-vert">
          <i :class="['ico', 'mui-shr-0', item.icon]"></i>
          <p class="t1">{{ item.name }}</p>
        </div>
        <i class="mico-arrow-right-sty1 mui-shr-0"></i>
      </li>
    </ul>
  </div>
</template>

<script>
import { purchaseWithMoonPay, purchaseWithRamp, purchaseWithTransak } from '../../utils/vendors'

export default {
  name: 'PurchaseMethods',
  data () {
    return {
    }
  },
  computed: {
    pubKey () {
      return this.$store.getters.pubKey
    },
    list () {
      return this.$store.state.paymentObj
    }
  },
  methods: {
    handleClk (name) {
      if (name === 'MoonPay') {
        purchaseWithMoonPay(this.pubKey)
      } else if (name === 'Ramp') {
        purchaseWithRamp(this.pubKey)
      } else if (name === 'Transak') {
        purchaseWithTransak(this.pubKey)
      }
    },
    goback () {
      this.$router.back()
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
