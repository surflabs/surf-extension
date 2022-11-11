<template>
  <div class="sty1-cell mui-fl-col">
    <div class="mui-nav">
      <h5 class="pg-title1 taplight2" @click="$router.go(-1)">
        <i class="mico-arrow-right-sty1"/>Auto-Lock Timer
      </h5>
    </div>
    <div class="mui-shr-0">
      <p class="base-tip marg-b">How long should we wait to lock your wallet after it has been idle?</p>
    </div>

    <form class="mui-fl-1 mui-fl-col mui-fl-btw">
      <div class="form-item">
        <mui-input
          v-model="time"
          title="Auto-Lock Timer"
          :clearIcon="false"
          @input="handleInput"
        />
        <p class="minutes">Minutes</p>
      </div>
      <div class="mui-fl-btw">
        <m-button class="mui-fl-1 fz16 gray" round native-type="button" @click="$router.go(-1)">Cancel</m-button>
        <m-button class="mui-fl-1 fz16" round type="info" native-type="submit" :disabled="!time" @click="submit">Save</m-button>
      </div>
    </form>
  </div>
</template>

<script>
import MuiInput from '@/components/mui-input'
export default {
  name: 'AutoLock',
  components: {
    MuiInput
  },
  data () {
    return {
      time: '15'
    }
  },
  async created () {
    const { autoLockime } = await this.$crmStorage.get('autoLockime')
    this.time = autoLockime || '15'
  },
  methods: {
    handleInput () {
      this.$nextTick(() => {
        this.time = this.time.replace(/[^0-9]/g, '').substring(0, 9)
        if (Number(this.time) === 0) {
          this.time = ''
        }
      })
    },
    async submit (e) {
      e.preventDefault()
      await this.$crmStorage.set({ autoLockime: this.time, loginExpiry: Date.now() + this.time * 60 * 1000 })
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" src="@/assets/css/views/my/_base.scss" scoped></style>
<style lang="scss" src="@/assets/css/views/my/_autolock.scss" scoped></style>
