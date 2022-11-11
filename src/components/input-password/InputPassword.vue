<template>
  <div>
    <!-- <div :class="{ 'mui-input-wrap': 1, 'mui-fl-vert': 1 }">
      <input
        v-model="pasValue"
        :type="seePas ? 'text' : 'password'"
        class="mui-input fw500 mui-fl-1"
        :placeholder='placeholder'
        @input="handleInput"
        @blur="handleBlur"
        @change="handleChange"
        autofocus
      />
      <div class="mui-fl-vert">
        <i v-show="pasValue" class="icon-close" @click="clear"></i>
        <i
        :class="['mui-shr-0', seePas ? 'icon-see' : 'icon-unsee', source === 'sign' ? 'ml16' : '']"
        @click="seePas = !seePas"
      ></i>
      </div>
    </div> -->
    <mui-input
      type="password"
      v-model="pasValue"
      :title="title"
      placeholder="Please enter..."
      @input="handleInput"
      @blur="handleBlur"
      @change="handleChange"
      @keydown="onKeyDown"
      eyeIcon
      :error="invalid"
      :errorMsg="showMsg ? errorMsg || msg : ''"
      :focused="focused"
      :readonly="readonly"
    />
    <!-- <p v-if="invalid" :class="{ 'form-item-info': 1, err: invalid }">{{ msg }}</p> -->
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { aesDecrypt3 } from '@/utils/common'
import MuiInput from '@/components/mui-input'

export default {
  name: 'InputPassword',
  components: {
    MuiInput
  },
  model: {
    prop: '_value',
    event: 'input'
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    _value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    invalid: {
      type: Boolean,
      default: false
    },
    showMsg: {
      type: Boolean,
      default: true
    },
    errorMsg: {
      type: String,
      default: ''
    },
    focused: {
      type: Boolean,
      default: true
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      seePas: false,
      errPasNum: 0
    }
  },
  computed: {
    ...mapState(['allWalletList', 'mainWallet']),

    value: {
      get () {
        return this._value
      },
      set (val) {
        this.$emit('input', val)
      }
    },
    pasValue: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    },
    msg () {
      if (Number(this.errPasNum) < 5) {
        return 'Incorrect password'
      } else if (Number(this.errPasNum) >= 5 && Number(this.errPasNum) < 10) {
        return `Wait ${this.errPasNum} mins and try again`
      } else if (Number(this.errPasNum) >= 10) {
        return 'You have tried a lot. Please delete the plug-in, reset your account & password.'
      } else {
        return ''
      }
    }
  },
  methods: {
    handleInput () {},
    handleBlur () {
      this.$emit('blur', this.invalid)
    },
    handleChange () {
      this.$emit('change')
    },
    onKeyDown () {
      this.$emit('keydown')
    },
    async validate () {
      try {
        const { errpass = {} } = await this.$crmStorage.get('errpass')
        const recount = Date.parse(new Date()) - (2 + (errpass.num || 0)) * 60 * 1000 > errpass.timestamp
        const isNext = Date.parse(new Date()) - (errpass.num || 0) * 60 * 1000 > errpass.timestamp
        if ((errpass.num || 0) >= 10) {
          // this.invalid = true
          this.$emit('blur', true)
          this.errPasNum = errpass.num
          return false
        }
        if ((errpass.num || 0) > 4 && !isNext) {
          // this.invalid = true
          this.$emit('blur', true)
          this.errPasNum = recount ? 0 : errpass.num
          return 'wait'
        }

        const wdataRP = await this.$crmStorage.get('keyringData')
        const keyringData = JSON.parse(await aesDecrypt3(wdataRP.keyringData, this.pasValue))

        if (keyringData && this.pasValue === keyringData.hdw.password) {
          // this.invalid = false
          this.$emit('blur', false)
          await this.$crmStorage.remove('errpass')

          if (!this.allWalletList || !this.mainWallet) {
            this.$store.commit('SET_ALL_WALLET_LIST', keyringData.keyring)
            this.$store.commit('SET_MAIN_WALLET', keyringData.hdw)
          }

          return keyringData
        } else {
          // this.invalid = true
          this.$emit('blur', true)
          this.$crmStorage.set({
            errpass: {
              timestamp: Date.parse(new Date()),
              num: recount ? 1 : (errpass.num || 0) + 1
            }
          })
          this.errPasNum = recount ? 1 : (errpass.num || 0) + 1
          return 'fail'
        }
      } catch (e) {
        console.log(e)
        return 'fail'
      }
    }
  }
}
</script>
