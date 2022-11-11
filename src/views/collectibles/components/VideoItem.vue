<template>
  <div class="video-box">
  <video
    ref="myVideo"
    id="myVideo"
    width="327"
    :src="playUrl"
    class="video"
    preload
    :poster="detail.image"
    @timeupdate="videoTimeupdate"
    controlsList="nodownload"
    disablePictureInPicture="true"
    @click="videoPlay"
    @canplay="videoCanplay"
  ></video>
  <transition name="fade">
    <div v-show="isVideoPlay" @click.stop="operateVideo" class="play">
      <i class="mui-fl-central mico-arrow-right-solid pause-btn"></i>
    </div>
  </transition>
  <div class="controls-box mui-fl-btw mui-fl-vert"  v-show="showProcess">
    <m-slider class="style1-slider" button-size="6px" active-color="var(--text9-color)" bar-height="4px" inactive-color="#C8C9CC" v-model="videoPercent" :disabled="!videoDuration" @input="onVideoChange" />
    <m-loading v-if="!videoDuration" size="12px" color="var(--text9-color)" class="cent" />
    <div class="time-text" v-else>
      {{ videoCurrentTime }}/{{ videoDuration }}
    </div>
    <div class="full-screen" @click="open">
      <img src="@/assets/img/collectibles/fullScreen.png" alt="" />
    </div>
  </div>
</div>
</template>
<script>
import { formatSeconds } from '../../../utils/collectibles'
export default {
  props: ['detail', 'playUrl'],
  data () {
    return {
      isVideoPlay: true,
      videoPercent: 0,
      videoCurrentTime: null,
      videoDuration: null,
      showProcess: false
    }
  },
  methods: {
    videoTimeupdate (e) {
      if (e.target.currentTime === e.target.duration) {
        this.isVideoPlay = true
      }
      if (this.$refs.myVideo) {
        this.videoCurrentTime = formatSeconds(this.$refs.myVideo.currentTime)
        this.videoPercent = (this.$refs.myVideo.currentTime / this.$refs.myVideo.duration) * 100
      }
    },
    onVideoChange (val) {
      this.$refs.myVideo.currentTime = (val / 100) * this.$refs.myVideo.duration
    },
    operateVideo () {
      this.showProcess = true
      if (!this.videoDuration) {
        return
      }
      this.isVideoPlay = false
      if (this.$refs.myVideo.paused) {
        this.$refs.myVideo.play()
        // this.isplay = false
      } else {
        this.$refs.myVideo.pause()
        // this.isplay = true
      }
    },
    videoCanplay () {
      if (this.$refs.myVideo) {
        this.videoCurrentTime = formatSeconds(this.$refs.myVideo.currentTime)
        this.videoDuration = formatSeconds(this.$refs.myVideo.duration)
      }
    },
    videoPlay () {
      if (this.$refs.myVideo.paused) {
        this.$refs.myVideo.play()
        this.isVideoPlay = false
      } else {
        this.$refs.myVideo.pause()
        this.isVideoPlay = true
      }
    },
    open () {
      chrome.tabs.create({
        // url: 'video.html?file=' + this.playUrl
        url: this.playUrl
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
