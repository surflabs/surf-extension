<template>
  <div class="sty2-cell mui-fl-col">
    <div class="mui-nav mui-fl-vert mui-shr-0">
      <h5 class="pg-title1 taplight2" @click="goback">
        <i class="mico-arrow-right-sty1" />Details
      </h5>
    </div>

    <div class="scroll-view mui-fl-1">
      <div class="mui-fl-central" style="margin-top: 12px;position: relative">
        <!-- <div :class="loading ? 'loading' : 'img-box'" v-if="detail.category === 'image'">
          <img class="img"  @load="loading = false" :src="detail.image" @error="loading = false,detail.image = errorImg" alt="" />
        </div> -->
        <!-- <m-loading v-show="loading" size="30px"  color="#6E66FA" class="img-load" /> -->
        <m-image
          @click="imageView()"
          :src="detail.url"
          class="sty2-image"
          height="218px"
          loading-icon=""
          @load="loading = false"
          @error="loading = false, detail.url = errorImg"
        />
        <!-- <video-item v-else-if="detail.category === 'video'" :detail="detail" :playUrl="playUrl" />
        <audio-item v-else-if="detail.category === 'audio'" :detail="detail" :playUrl="playUrl" />
        <vr-item v-else :detail="detail" :stylee="style" :errorImg="errorImg" /> -->
      </div>
      <div class="title">{{ detail.name }}</div>
      <!-- <div class="content">
        {{ detail.description }}
      </div> -->
      <div class="content">
        <p :style="{ height: height ? (height + 'px') : 'auto' }" :class="foldStyle" ref="ndContentRef">{{ detail.description }}</p>
        <p v-show="showMore" @click="onFold">
          <!-- {{ !fold ? 'More' : 'Less' }} -->
          <span v-if="!fold">
            More<i class="mico-arrow-bottom" />
          </span>
          <span v-else>
            Less<i class="mico-arrow-top" />
          </span>
        </p>
      </div>
    </div>

    <div class="footer-box mui-shr-0">
      <!-- <div class="send-btn" @click="toSend">Send</div> -->
      <m-button class="gray fz18" round block @click="toSend">Send</m-button>
    </div>
  </div>
</template>
<script>
// import VrItem from './components/VrItem.vue'
import { placeIcon } from '../../utils/mixin'
// import AudioItem from './components/AudioItem.vue'
// import VideoItem from './components/VideoItem.vue'
export default {
  // components: { VrItem, AudioItem, VideoItem },
  name: 'Detail',
  mixins: [placeIcon],
  data () {
    return {
      isplay: true,
      loading: true,
      count: 0,
      timer: null,
      detail: {},
      style: {
        width: 218
      },
      files: [],
      type: 0,
      playUrl: '',
      showMore: false,
      fold: false,
      height: null,
      foldStyle: null
    }
  },
  computed: {
    errorImg () {
      return require('@/assets/img/collectibles/nonft.png')
    }
  },
  created () {
    this.detail = JSON.parse(this.$route.query.detail)
    // this.files = this.detail.files ? JSON.parse(this.detail.files) : []
    // this.files.forEach(item => {
    //   if (typeof item !== 'string') {
    //     if (item.type.includes('video') || item.type.includes('audio')) {
    //       this.playUrl = item.uri
    //     }
    //   } else {
    //     if (this.detail.animation_url) {
    //       this.playUrl = this.detail.animation_url
    //     } else {
    //       this.playUrl = this.detail.image
    //     }
    //   }
    // })
  },
  mounted () {
    this.getLines()
  },
  methods: {
    getLines () {
      const clientHeight = this.$refs.ndContentRef.clientHeight
      if (!clientHeight) {
        return
      }
      if (clientHeight <= 54) {
        this.height = clientHeight
        this.showMore = false
      } else {
        this.showMore = true
        this.height = 54
        this.foldStyle = 'unfold'
      }
    },
    onFold () {
      this.fold = !this.fold
      if (this.fold) {
        this.height = null
        this.foldStyle = 'fold'
      } else {
        this.height = 54
        this.foldStyle = 'unfold'
      }
    },
    goback () {
      // history.go(-1)
      this.$router.back()
    },
    imageView () {
      this.$imagePreview({ images: [this.detail.url], closeable: true, className: 'sty1-image-view' })
    },
    toSend () {
      this.$router.push({
        path: 'sendNft',
        query: { detail: JSON.stringify(this.detail) }
      })
    }
  }
}
</script>
<style
  lang="scss"
  src="@/assets/css/views/collectibles/_collect-detail.scss"
  scoped
></style>
