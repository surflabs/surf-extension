<template>
  <div class="page-add">
    <div class="mui-nav">
      <h5 class="pg-title1 taplight2" @click="$router.back()">
        <i class="mico-arrow-right-sty1"/>Add Wallet
      </h5>
    </div>
    <ul class="sty7-gp medium marg-t">
      <router-link :to="{ path: '/confirmpwd', query: { s: 'createNewWallet' } }">
        <li class="mui-fl-btw mui-fl-vert taplight2">
          <p>Create a New Wallet</p>
          <i class="mico-arrow-right-sty1" />
        </li>
      </router-link>
    </ul>

    <ul class="sty7-gp medium">
      <router-link :to="{ path: '/confirmpwd', query: { s: 'importPrivate' } }">
        <li class="mui-fl-btw mui-fl-vert taplight2">
          <p>Import Private Key</p>
          <i class="mico-arrow-right-sty1" />
        </li>
      </router-link>
      <router-link :to="{ path: '/confirmpwd', query: { s: 'importSeedPhrase' } }">
        <li class="mui-fl-btw mui-fl-vert taplight2">
          <p>Import Seed Phrase</p>
          <i class="mico-arrow-right-sty1" />
        </li>
      </router-link>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'AddWallet',
  computed: {
    isStayHere () {
      return this.$route.name === 'AddWallet'
    }
  },
  methods: {
    // createWalet () {
    //   this.$router.push({
    //     path: '/create-new-wallet',
    //     query: {
    //       currStep: 1
    //     }
    //   })
    // },
    // importWallet (type) {
    //   this.$router.push({
    //     path: '/importWallet',
    //     query: {
    //       s: type
    //     }
    //   })
    // }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/side/_addwallet.scss" scoped></style>
