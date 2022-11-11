export default {
  computed: {
    isConnectPage () {
      return this.$route.name === 'connect'
    },
    isSignTxPage () {
      return this.$route.name === 'signTx'
    }
  }
}
