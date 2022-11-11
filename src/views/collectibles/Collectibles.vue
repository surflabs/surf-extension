<template>
  <div ref="ndMain" class="sty3-cell" @click="hidePin">
    <div class="mui-nav mui-fl-vert">
      <h5 class="pg-title1 mui-fl-1">Collectibles</h5>
      <i v-show="listVisible" :class="['mico-col', columns === 2 ? 'mico-muti-col' : 'mico-double-col']" @click="setGridPattern(columns === 2 ? 3 : 2)"></i>
      <i class="mico-add-circle ico taplight2" slot="reference" @click="$router.push({ name: 'Receivesqrcode', query: { jumpPage: 'SUI' } })" />
      <!-- <e-popover
        placement="bottom"
        width="150"
        trigger="hover"
        popper-class="sty1-popover sty2-popover">
        <p class="tip">Click to mint your demo NFT</p>
        <i class="mico-add-circle ico taplight2" slot="reference" @click="$router.push({ name: 'Receivesqrcode', query: { jumpPage: 'SUI' } })" />
      </e-popover> -->

      <div class="popover" v-if="(isFirstToNft === true || isFirstToNft === 'true') && showMintNft">
        <div class="t1">Click to mint your demo NFT</div>
      </div>
    </div>
    <div
      :style="{marginTop: listVisible ? '12px' : 0, minHeight: 'calc(100% - 64px)'}"
      @mousedown="mousedown"
      @mousemove="mousemove"
      @mouseup="mouseup"
      @scroll="hidePin"
    >
      <div style="overflow: hidden">
        <div
          v-show="scroll_load.top > 0"
          class="list-box"
          :style="{ marginTop: -40 + scroll_load.top + 'px' }"
        >
          <span v-if="scroll_load.state === 1">Pull down to refresh...</span>
          <span v-else-if="scroll_load.state === 2">Refresh after release...</span>
          <m-loading
            v-else-if="scroll_load.state === 3"
            size="16px"
            color="var(--text9-color)"
          />
        </div>
      </div>
      <div>
        <m-list
          v-if="listVisible"
          v-model="loading"
          :finished="finished"
          finished-text=" "
          loading-text=" "
          @load="fetchNFTData"
        >
          <div v-if="skeletonShow">
            <ul :class="[ 'mui-fl-wrap', 'waterfall-box', columns === 2 ? '' : 'waterfall-muti-box' ]">
              <li v-for="index of columns === 2 ? 4: 12" :key="'skeleton' + index" class="list-item m-skeleton" style="cursor: auto">
                <m-skeleton :row="1" :row-width="columns === 2 ? '156px' : '100px'" class="sty1-skeleton sty3-skeleton" :class="[ columns === 2 ? 'sty4-skeleton' : 'sty5-skeleton' ]" />
                <p v-show="columns === 2" class="nft-name">
                  <m-skeleton :row="1" row-width="124px" class="sty1-skeleton sty3-skeleton" />
                </p>
              </li>
            </ul>
          </div>
          <ul v-else :class="[ 'mui-fl-wrap', 'waterfall-box', columns === 2 ? '' : 'waterfall-muti-box' ]">
            <li class="list-item" v-for="(item, index) of topNfts" :key="index" @click="toDetail($event, item)" @contextmenu.prevent.stop="toTop($event, index)" :style="{cursor: (index === 0 && showCancelTop) || index ? 'pointer' : 'auto'}">
              <div class="img-box">
                <m-image
                  :src="!item.error ? item.url : errorImg"
                  :class="['sty2-image', columns === 3 ? 'sty3-image' : '']"
                  :height="columns === 2 ? 156 : 100"
                  :width="columns === 2 ? 156 : 100"
                  fit="cover"
                  @load="load(item, index)"
                  @error="error(item, index)"
                  loading-icon=""
                >
                </m-image>
                <!-- <p class="pause-box mui-fl-central">
                  <i v-show="item.properties && item.properties.category === 'video'" class="mui-fl-central mico-arrow-right-solid pause-btn video-pause"></i>
                </p> -->
              </div>
              <p class="t1 nft-name" v-show="columns === 2">{{ item.name || '' }}</p>
              <div v-show="pinIndex === index && showPin" :class="['pin-box', !offsetLeft ? 'offset-right' : '']" :style="activePin">
                <p v-if="pinIndex !== 0" @click.stop="toPin" class="mui-fl-vert">
                  <i class="mico-top"></i>
                  Pin
                </p>
                <p v-else @click.stop="toPin" class="mui-fl-vert">
                  <i class="mico-cancel-top"></i>
                  Unpin
                </p>
              </div>
            </li>
          </ul>

          <template #loading>
            <span />
          </template>
        </m-list>
        <div v-else>
          <no-list :txt="txt" :network-error="networkError"  />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import axios from 'axios'
import NoList from '@/components/no-list'
import { placeIcon } from '../../utils/mixin'
// import { collectibleMixin } from './mixin'
import { sleep } from '@/utils/common'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'Collectibles',
  components: { NoList },
  mixins: [placeIcon],
  data () {
    return {
      loading: false,
      finished: false,
      listVisible: true,
      skeletonShow: true,
      nfts: [],
      topNfts: [],
      scroll_load: {
        top: 0,
        startY: 0,
        touching: false,
        state: 0,
        scrolltop: true
      },
      needRefresh: false,
      // columns: 2,

      activePin: {},
      showPin: false,
      pinIndex: 0,
      offsetLeft: true,
      contextState: {
        x: 0,
        y: 0
      },

      cursor: null,

      networkError: false,
      txt: 'No Records',
      showMintNft: true
    }
  },
  computed: {
    ...mapState(['endpoint', 'isFirstToNft']),
    ...mapState({
      columns: ({ collectible }) => Number(collectible.gridPattern),
      // nftId: ({ collectible }) => collectible.nftId,
      nftList: ({ collectible }) => collectible.nftList
    }),
    ...mapGetters(['pubKey']),
    ...mapGetters({
      balancesList: 'filterBalancesList'
    }),

    dependenciesParams () {
      const { pubKey, endpoint } = this
      return { pubKey, endpoint }
    },
    errorImg () {
      return require('@/assets/img/collectibles/nonft.png')
    },
    showCancelTop () {
      return this.nfts.length && this.topSortNfts[this.endpoint]?.length
    },
    topSortNfts () {
      const store = this.$store.state.collectible.topSortNfts
      return (store && store[this.pubKey]) || {}
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$nextTick(() => {
        const prevScrY = to.meta.saveScrollY
        if (prevScrY) {
          vm.$refs.ndMain.scrollTop = prevScrY
        }
      })
      vm.needRefresh && vm.fetchNFTData()
    })
  },
  beforeRouteLeave (to, from, next) {
    this.$route.meta.saveScrollY = this.$refs.ndMain.scrollTop
    this.$store.commit('SET_ISFIRSTTONFT', false)
    next()
  },
  mounted () {
    document.addEventListener('mouseup', this.mouseup)
    document.addEventListener('mousemove', this.mousemove)
    document.addEventListener('scroll', this.hidePin, true)
  },
  watch: {
    dependenciesParams () {
      this.showPin = false
    },
    // async dependenciesParams (val) {
    //   this.needRefresh = true
    //   this.nfts = []
    //   this.topNfts = []

    //   setTimeout(() => {
    //     this.listVisible = true
    //     this.finished = false
    //     this.loading = true
    //     this.skeletonShow = true
    //   })

    //   if (val.pubKey || val.endpoint) {
    //     if (this.$route.name === 'collectibles') {
    //       // this.fetchNFTData()
    //       if (!this.nftList.length) {
    //         await this.$store.dispatch('getBalancesList')
    //       }
    //     }
    //   }
    // },
    async nftList () {
      // this.scroll_load.top = 40
      if (this.finished) {
        this.listVisible = true
        this.loading = true
        this.skeletonShow = true
        if (!this.nftList.length) {
          await this.$store.dispatch('getBalancesList')
        }
        this.fetchNFTData()
      }
    },
    columns () {
      this.hidePin()
    }
  },
  methods: {
    async fetchNFTData (refresh) {
      try {
        if (!this.nftList.length) {
          if (refresh) {
            await this.$store.dispatch('_getBalancesList', this.pubKey)
          } else {
            await this.$store.dispatch('getBalancesList')
          }
        }
        this.needRefresh = false
        this.loading = true
        if (this.nftList.length) {
          this.nfts = this.nftList.map(item => {
            const fields = item.fields
            return {
              name: fields.name,
              description: fields.description,
              url: (fields.url || fields.image).replace(/^ipfs:\/\//, 'https://ipfs.io/ipfs/'),
              id: fields.id.id,
              error: false,
              loading: true
            }
          })

          this.topNfts = JSON.parse(JSON.stringify(this.nfts))
          this.sortNfts()
        } else {
          this.topNfts = []
        }

        if (refresh) {
          this.scrollTo(this.scroll_load.top, 40)
          await sleep(500)
        }
      } catch (err) {
        console.log(err)
        this.listVisible = false
        this.nfts = []
        if (err && err.message.includes('Network request failed')) {
          // this.$toast('Network Error.')
          this.networkError = true
          this.txt = 'Network Error'
        }
      } finally {
        if (!this.topNfts.length) {
          this.listVisible = false
        }
        this.loading = false
        this.finished = true
        this.skeletonShow = false
        this.scroll_load.top = 0
        this.scroll_load.state = 0
      }
    },

    async sortNfts () {
      if (!this.topSortNfts[this.endpoint]) {
        return
      }
      const arr = this.topSortNfts[this.endpoint]
      arr.sort((a, b) => {
        if (a.sort > b.sort) {
          return -1
        } else {
          return 1
        }
      })
      const newArr = []
      const result = JSON.parse(JSON.stringify(this.nfts))
      arr.forEach((r, i) => {
        const obj = this.nfts.find(it => it.id === r.id)
        if (obj) {
          newArr.push(obj)
          const findIndex = result.findIndex(item => r.id === item.id)
          if (findIndex !== -1) {
            result.splice(findIndex, 1)
          }
        }
      })
      this.topNfts = newArr.concat(result)
    },

    async toTop (e, index) {
      if (e.x - this.contextState.x >= -5 && e.x - this.contextState.x <= 5 && e.y - this.contextState.y >= -5 && e.y - this.contextState.y <= 5) {
        return
      }
      this.contextState = {
        x: e.x,
        y: e.y
      }
      this.pinIndex = index
      if (!this.showCancelTop && this.topNfts[this.pinIndex].id === this.nfts[0].id) {
        this.hidePin()
        return
      }
      this.showPin = true
      if ((this.columns === 2 && !(index % 2)) || ((this.columns === 3) && !(index % 3))) {
        this.offsetLeft = true
      } else {
        this.offsetLeft = false
      }
      this.activePin = {
        position: 'absolute',
        top: (e.layerY + 5) + 'px',
        left: (this.offsetLeft ? (e.layerX - 18) : (e.layerX - (154 - 18))) + 'px'
      }
    },
    toPin () {
      // const tempOption = this.topNfts[this.pinIndex]
      const find = this.nfts.find(item => this.topNfts[this.pinIndex].id === item.id)

      if (!this.pinIndex) {
        let arr = this.topSortNfts[this.endpoint]
        arr = arr.filter(item => item.id !== find.id)
        this.$store.commit('SET_TOPSORT_NFTS', { walletAddress: this.pubKey, nfts: arr, endpoint: this.endpoint })
      } else {
        // this.topNfts.unshift(this.nfts[findIndex])
        if (!this.topSortNfts[this.endpoint]?.length) {
          const arr = [{ id: find.id, sort: 1 }]
          this.$store.commit('SET_TOPSORT_NFTS', { walletAddress: this.pubKey, nfts: arr, endpoint: this.endpoint })
        } else {
          const arr = this.topSortNfts[this.endpoint]

          const val = Math.max.apply(Math, arr.map(item => { return item.sort }))
          const i = arr.findIndex(item => item.id === find.id)

          if (i === -1) {
            arr.push({ id: find.id, sort: val + 1 })
          } else {
            arr[i].sort = val + 1
          }

          this.$store.commit('SET_TOPSORT_NFTS', { walletAddress: this.pubKey, nfts: arr, endpoint: this.endpoint })
        }
      }
      this.sortNfts()
      this.hidePin()
    },
    toDetail (e, item) {
      var diff = e.pageY - this.scroll_load.startY
      if (diff > 10 && this.$refs.ndMain.scrollTop <= 0) {
        e.preventDefault()
        return
      }
      this.hidePin()
      const obj = {
        name: item.name,
        description: item.description,
        url: item.url,
        id: item.id
      }
      this.$router.push({
        path: 'collectDetail',
        query: { detail: JSON.stringify(obj) }
      })
      // chrome.tabs.create({ url: 'detail' })
    },
    mousedown (e) {
      if (
        this.loading ||
        this.scroll_load.state === 3 ||
        this.$refs.ndMain.scrollTop > 0
      ) {
        return
      }
      this.scroll_load.startY = e.pageY

      this.scroll_load.touching = true
      this.scroll_load.state = 1
    },
    mousemove (e) {
      if (!this.scroll_load.touching) return
      var diff = e.pageY - this.scroll_load.startY

      if (diff > 0) {
        e.preventDefault()
      } else {
        this.scroll_load.top = 0
        this.scroll_load.touching = false
        return
      }
      this.scroll_load.top = Math.floor(diff * 0.25)
      // console.log('top: ', this.scroll_load.top)
      if (this.scroll_load.top >= 40) {
        this.scroll_load.state = 2
      } else {
        this.scroll_load.state = 1
      }
    },
    async mouseup (e) {
      // console.log('touchend', e, e.pageY)
      this.scroll_load.touching = false
      if (this.scroll_load.state === 3) {
        return
      }
      if (this.scroll_load.top >= 40) {
        this.refresh()
      } else {
        await this.scrollTo(this.scroll_load.top, 0, 10)
        this.scroll_load.state = 0
        // this.scroll_load.top = 0
      }
      // console.log('touchEnd')
    },
    refresh () {
      this.scroll_load.top = 40
      this.scroll_load.state = 3
      this.listVisible = true
      // this.finished = false
      this.$store.commit('SET_PROGRAM_ACCOUNTS_PROMISE', null)
      this.fetchNFTData(true)
    },
    async load (item) {
      item.loading = false
    },

    async error (item) {
      item.error = true
      item.loading = false
    },
    scrollTo (current, target, duration = 14) {
      let top = current
      let start = 0
      const change = current - target

      return new Promise(resolve => {
        const step = () => {
          start++
          top = this.easeOutQuad(start, current, change, duration)
          this.scroll_load.top = top
          if (top > target && start <= duration) {
            requestAnimationFrame(step)
          } else {
            resolve()
          }
        }
        step()
      })
    },
    hidePin () {
      this.showPin = false
      this.showMintNft = false
    },
    setGridPattern (num) {
      this.$store.commit('SET_GRIDPATTERN', num)
    },
    easeOutQuad (t, b, c, d) {
      return c * (t /= d) * (t - 2) + b
    }
  }
}
</script>
<style
  lang="scss"
  src="@/assets/css/views/collectibles/_collectibles.scss"
  scoped
></style>
