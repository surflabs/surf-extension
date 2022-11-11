<template>
  <div class="sty2-cell send-nft mui-fl-col">
    <div class="mui-nav mui-fl-vert mui-shr-0">
      <h5 class="pg-title1 taplight2" @click="goback">
        <i class="mico-arrow-right-sty1"/>Send NFT
      </h5>
    </div>

    <div class="scroll-view mui-fl-1">
      <div v-show="detail" class="mui-fl-central" style="margin-top: 12px;position: relative">
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
      <div class="form-item marg">
        <mui-input
          v-model="receiverKey"
          type="textarea"
          :rows="1"
          title="Receiver address"
          placeholder="Please enter..."
          :error="validate.valid"
          :errorMsg="validate.msg"
          :domainOwner="domainOwner"
          :payadd="receiverKey"
          :loading="resolveloading"
          @blur="receiveBlur"
          @input="receiveInput"
        />
      </div>

      <div>
        <div class="sty1-tip mui-flex">
          <i class="mui-shr-0 mico-warn"></i>
          <div class="mui-fl-1 warn-tip">
            <p>Make sure Receiver's address is correct. Your assets cannot be recovered once a transaction is completed.</p>
          </div>
        </div>
        <div class="mui-fl-btw footer-box">
          <m-button class="mui-fl-1 fz16 gray" round @click="goback">Back</m-button>
          <m-button class="mui-fl-1 fz16" round type="info" @click="onsend" :disabled="!receiverKey || validate.valid">Send</m-button>
        </div>
      </div>
    </div>
    <!-- </div> -->
  </div>
</template>
<script>
// import VrItem from './components/VrItem.vue'
import { placeIcon } from '../../utils/mixin'
// import AudioItem from './components/AudioItem.vue'
// import VideoItem from './components/VideoItem.vue'
import MuiInput from '@/components/mui-input'
import { sleep } from '@/utils/common'
import { mapGetters, mapState } from 'vuex'
import { isValidSuiAddress } from '@mysten/sui.js'

export default {
  name: 'SendNft',
  mixins: [placeIcon],
  components: {
    MuiInput
    // VrItem,
    // AudioItem,
    // VideoItem
  },
  data () {
    return {
      receiverKey: null,
      imgLoading: true,
      resolveloading: false,
      domainOwner: null,
      invalid: false,
      loading: true,
      // detail: JSON.parse(this.$route.query.detail || '{}'),

      validate: {
        valid: false,
        msg: ''
      },
      style: {
        width: 218
      }
    }
  },
  computed: {
    ...mapState({
      ethEndpoint: ({ eth }) => eth.ethEndpoint,
      ethChainId: ({ eth }) => eth.ethChainId
    }),
    ...mapGetters(['curWallet', 'pubKey']),

    detail () {
      return JSON.parse(this.$route.query.detail || '{}')
    },

    errorImg () {
      return require('@/assets/img/collectibles/nonft.png')
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (from.name !== 'sendConfirm') {
        vm.receiverKey = null
      }
    })
  },
  methods: {
    imageView () {
      this.$imagePreview({ images: [this.detail.url], closeable: true })
    },
    async onsend () {
      await sleep(300)
      if (this.validate.valid) { return }
      this.receiverKey = this.receiverKey.trim()
      if (this.pubKey.toLowerCase() === this.receiverKey.toLowerCase()) {
        this.$message({
          message: 'This is your own address. You cannot send assets to yourself.',
          iconClass: 'mico-warn',
          customClass: 'sty1-message sty2-message',
          duration: 2000,
          offset: 270,
          center: true
        })
        return
      }
      const obj = { name: this.detail.name, receiverKey: this.receiverKey, id: this.detail.id, url: this.detail.url }

      this.$router.push({
        path: '/nft-send-confirm',
        query: { detail: JSON.stringify(obj) }
      })
    },
    async receiveBlur () {
      if (!this.receiverKey) { return }
      try {
        if (!isValidSuiAddress(this.receiverKey)) {
          this.validate = {
            valid: true,
            msg: 'Please enter the correct address.'
          }
        }
      } catch (error) {
        this.$log(error)
        this.validate = {
          valid: true,
          msg: 'Please enter the correct address.'
        }
      }
    },
    async receiveInput () {
      this.validate = {
        valid: false,
        msg: ''
      }
      this.invalid = false
      // try {
      // } catch (error) {
      //   this.resolveloading = false
      //   this.invalid = true
      // }
    },
    onclear () {
      this.receiverKey = null
    },
    goback () {
      history.go(-1)
    }
  }
}
</script>
<style
  lang="scss"
  src="@/assets/css/views/collectibles/_send-nft.scss"
  scoped
></style>
