import { ProviderFailureType } from '@/utils/failure-type'

export default {
  data () {
    return {
      origin: this.$route.query.origin,
      title: this.$route.query.title || '',
      favIconUrl: this.$route.query.favIconUrl,
      showLogo: true
    }
  },
  computed: {
    shortTitle () {
      const t = this.title.toLowerCase()

      if (t.includes('home') && t.includes('|')) {
        const words = this.title.split('|')
        if (words[0].toLowerCase().includes('home')) {
          return words[1].trim()
        } else if (words[1].toLowerCase().includes('home')) {
          return words[0].trim()
        }
      }

      return this.title
    }
  },
  methods: {
    sendCancel () {
      this.$sendMessage({
        channel: 'POPUP_TO_DAPP',
        id: this.id,
        code: ProviderFailureType.userRejectedRequest.code,
        message: ProviderFailureType.userRejectedRequest.message
      })
    }
  }
}
