<template>
  <div class="sty4-cell mui-fl-col">
    <div class="mui-nav mui-fl-vert mui-shr-0">
      <h5 class="pg-title1 taplight2" @click="goback">
        <i class="mico-arrow-right-sty1" />{{ title }}
      </h5>
    </div>
    <div v-show="!loading" class="scroll-view mui-fl-1">
      <ul class="mui-fl-central mui-fl-col top-box">
        <li class="logo-box">
          <!-- <img class="nft" v-if="title.includes('NFT')" :src="detail.url" alt="">
          <img class="coin" v-else :src="detail.url" alt=""> -->
          <div class="mui-fl-central sty6-gp">
            <m-image
              v-if="detail.url"
              :class="['sty1-image', 'mui-shr-0', title.includes('NFT') ? 'sty5-image' : '']"
              :width="title.includes('NFT') ? '96' : '64'"
              :height="title.includes('NFT') ? '96' : '64'"
              :src="detail.url"
              fit="cover"
              :loading-icon="darkMode ? placMapIconDark : placMapIcon"
              :error-icon="darkMode ? failMapIconDark : failMapIcon"
              />
            <i v-else :class="['ico', 'mui-shr-0', detail.url ? '' : 'unknown']" />
          </div>
          <i :class="['icon', 'mui-fl-central', title.includes('Sent') ? 'red mico-record-pay' : title.includes('Received') ? 'green mico-record-receive' : 'blue mico-record-success']" />
        </li>
        <li v-show="detail.amount">{{ pubKey === detail.sender ? '-' : '+' }}{{ formatSui(detail.amount) | formatBalance }}</li>
      </ul>

      <ul class="content-box">
        <li v-show="detail.fields" class="mui-fl-vert mui-fl-btw">
          <p>NFT Name</p>
          <p>{{ detail.fields && detail.fields.name }}</p>
        </li>
        <li v-show="(title.includes('Sent') || title.includes('Received')) && type !== 'PaySui'" class="mui-fl-vert mui-fl-btw">
          <p>
            {{ title.includes('Sent') ? 'To' : 'From' }}
          </p>
          <p>
            {{ (title.includes('Sent') ? detail.recipient : detail.sender) | formatPubKey(4, 4) }}
          </p>
        </li>
        <li v-show="type !== 'PaySui'" class="mui-fl-vert mui-fl-btw">
          <p>
            Gas Fee
          </p>
          <p>{{ formatSui(detail.gasFee) }} SUI</p>
        </li>
        <li v-show="detail.totalAmount" class="mui-fl-vert mui-fl-btw">
          <p>
            Total Amount
          </p>
          <p>{{ formatSui(detail.totalAmount) | formatBalance }} SUI</p>
        </li>
        <li class="mui-fl-vert mui-fl-btw">
          <p>
            Date
          </p>
          <p>{{ detail.timestamp | formatDate }}</p>
        </li>
      </ul>
    </div>

    <div class="mui-fl-btw footer-box">
      <m-button class="mui-fl-1 fz18" type="info" round @click="toView" :disabled="loading">View in Explorer</m-button>
    </div>
  </div>
</template>
<script>
import BigNumber from 'bignumber.js'
import { mapGetters } from 'vuex'
import { placeIcon } from '../../utils/mixin'
import { isCoin, getCoinTypeArg, getCoinSymbol } from '@/utils/sui'

export const BIG_TEN = new BigNumber(10)
const BN = BigNumber.clone({ ROUNDING_MODE: 1, DECIMAL_PLACES: 9 })

export default {
  mixins: [placeIcon],
  data () {
    return {
      detail: {},
      loading: true
    }
  },
  computed: {
    ...mapGetters(['pubKey', 'fullnodeProvider', 'suiDecimals']),
    ...mapGetters({
      balancesList: 'filterBalancesList'
    }),
    title () {
      return this.$route.query.title || ''
    },
    type () {
      return this.$route.query.type || ''
    }
  },
  filters: {
    upperCase (str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    },
    formatDate (timestamp) {
      const time = new Date(Number(timestamp))
      const Y = time.getFullYear()
      const M = time.getMonth()
      const d = time.getDate() < 10 ? '0' + time.getDate() : time.getDate()
      let h = time.getHours()
      const m = time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()
      const arr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

      let str
      if (h > 12) {
        h -= 12
        str = 'pm'
      } else {
        str = 'am'
      }
      return arr[M] + ' ' + d + ', ' + Y + ' at ' + (h < 10 ? ('0' + h) : h) + ':' + m + ' ' + str
    }
  },
  async created () {
    if (!this.balancesList.length) {
      await this.$store.dispatch('_getBalancesList', {
        updateBalanceList: 1
      })
    }
    this.fetchDetail()
  },
  methods: {
    async fetchDetail () {
      try {
        const id = this.$route.query.id
        const rp = await this.fullnodeProvider.getTransactionWithEffectsBatch([id])
        // console.log('rpp: ', rp)
        const data = rp[0].certificate.data
        const gasUsed = rp[0].effects.gasUsed
        const type = Object.keys(data.transactions[0])[0]
        const transaction = Object.values(data.transactions[0])[0]

        this.detail = {
          txId: id,
          sender: data.sender,
          recipient: transaction.recipient
            ? transaction.recipient
            : transaction.recipients
              ? transaction.recipients[0]
              : '',
          amount: transaction.amount || (transaction.amounts ? transaction.amounts.reduce((a, b) => a + b) : 0),
          gasFee: this.$np.minus(this.$np.plus(gasUsed.computationCost, gasUsed.storageCost), gasUsed.storageRebate),
          timestamp: rp[0].timestamp_ms
        }

        // else if (type === 'Call') {
        //   const objectId = transaction.package.objectId
        //   const coinInfo = await this.gatewayProvider.getObjectBatch([objectId])
        //   const disassembled = coinInfo[0].details.data.disassembled
        //   // Object.assign(this.detail, { objectId, fields: disassembled, url: fields.url.replace(/^ipfs:\/\//, 'https://ipfs.io/ipfs/') })
        // }
        let obj = {}
        if (type === 'TransferObject') {
          const objectId = transaction.objectRef.objectId
          const coinInfo = await this.fullnodeProvider.getObjectBatch([objectId])

          if (coinInfo[0].status !== 'Deleted') {
            if (isCoin(coinInfo[0].details)) {
              const arg = getCoinTypeArg(coinInfo[0].details.data)
              const name = getCoinSymbol(arg)

              obj = {
                name,
                url: name === 'SUI' ? require('@/assets/img/sui.png') : ''
              }
            } else {
              const fields = coinInfo[0].details.data.fields
              obj = {
                objectId,
                fields,
                url: fields.url?.replace(/^ipfs:\/\//, 'https://ipfs.io/ipfs/') || ''
              }
            }
          } else {
            obj = {
              url: require('@/assets/img/sui.png')
            }
          }
        } else if (type === 'TransferSui' || type === 'PaySui' || type === 'Pay') {
          const find = this.balancesList.find(i => i.symbol === 'SUI')
          obj = {
            name: 'SUI',
            url: find?.logoURI || '',
            totalAmount: this.$np.plus(this.detail.amount, this.detail.gasFee)
          }
        } else if (this.title.includes('Trading')) {
          let url
          if (this.title.includes('NFT')) {
            url = transaction.arguments[2]?.replace(/^ipfs:\/\//, 'https://ipfs.io/ipfs/') || ''
          } else {
            const find = this.balancesList.find(i => i.symbol === 'SUI')
            url = find?.logoURI || ''
          }
          obj = {
            url
          }
        }
        Object.assign(this.detail, obj)

        // console.log('detail: ', this.detail)
      } catch (error) {
        this.$log('fetchDetail Failed: ', error)
      } finally {
        this.loading = false
      }
    },
    toView () {
      const link = `https://explorer.devnet.sui.io/transactions/${encodeURIComponent(this.detail.txId)}`
      chrome.tabs.create({
        url: link
      })
    },
    goback () {
      this.$router.back()
    },
    formatSui (num) {
      const n = new BN(num).dividedBy(BIG_TEN.pow(this.suiDecimals))
      return n.toFormat(9)
    }
  }
}
</script>
<style lang="scss" src="@/assets/css/views/record/_record-detail.scss" scoped></style>
