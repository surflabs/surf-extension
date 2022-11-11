<template>
  <div class="audio-box">
    <img src="~@/assets/img/collectibles/audio.png" alt="">
    <!-- <img :src="!item.error ? item.image : errorImg" alt=""> -->
    <m-image
      v-show="detail.image"
      :src="detail.image"
      class="sty2-image sty4-image sty5-image"
      height="112px"
      loading-icon=""
      @load="loading = false"
      @error="loading = false"
    />
    <i :class="['mui-fl-central', 'pause-btn', !isAudioPlay ? 'play-btn' : 'mico-arrow-right-solid' ]" @click="operateAudio"></i>
    <audio
      ref="myAudio"
      @canplay="audioCanplay"
      @timeupdate="audioTimeupdate"
      :poster="detail.image || '@/assets/img/collectibles/audio.png'"
    >
      <source :src="playUrl" />
    </audio>
    <div class="process-box mui-fl-vert" v-show="showProcess">
      <m-slider class="style2-slider" button-size="6px" active-color="var(--text9-color)" bar-height="4px" inactive-color="#C8C9CC" v-model="audioPercent" :disabled="!audioDuration" @change="onAudioChange" />
      <m-loading v-if="!audioDuration" size="12px" color="var(--text9-color)" class="cent time-box" />
      <div class="time-box" v-else>
        {{ audioCurrentTime }}/{{ audioDuration }}
      </div>
    </div>
  </div>
</template>
<script>
import { placeIcon } from '../../../utils/mixin'
import { formatSeconds } from '../../../utils/collectibles'
export default {
  props: ['detail', 'playUrl'],
  mixins: [placeIcon],
  data () {
    return {
      audioPercent: 0,
      isAudioPlay: true,
      audioCurrentTime: null,
      audioDuration: null,
      showProcess: false
    }
  },
  computed: {
    errorImg () {
      return require('@/assets/img/collectibles/nonft.png')
    }
  },
  methods: {
    audioCanplay () {
      if (this.$refs.myAudio) {
        this.audioCurrentTime = formatSeconds(this.$refs.myAudio.currentTime)
        this.audioDuration = formatSeconds(this.$refs.myAudio.duration)
      }
    },
    audioTimeupdate (e) {
      if (e.target.currentTime === e.target.duration) {
        this.isAudioPlay = true
      }
      if (this.$refs.myAudio) {
        this.audioCurrentTime = formatSeconds(this.$refs.myAudio.currentTime)
        this.audioPercent = (this.$refs.myAudio.currentTime / this.$refs.myAudio.duration) * 100
      }
    },
    onAudioChange (val) {
      this.$refs.myAudio.currentTime = (val / 100) * this.$refs.myAudio.duration
    },
    operateAudio () {
      this.showProcess = true
      if (!this.audioDuration) {
        return
      }
      this.isAudioPlay = !this.isAudioPlay
      if (this.isAudioPlay) {
        this.$refs.myAudio.pause()
      } else {
        this.$refs.myAudio.play()
      }
    }
  }
}
</script>
<style
  lang="scss"
  src="@/assets/css/views/collectibles/_collect-detail.scss"
  scoped
></style>
