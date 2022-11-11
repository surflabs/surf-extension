<template>
  <div>
    <div :class="{'mui-input-wrap-sty1': 1, 'err': error}">
      <div class="mui-fl-vert mui-fl-btw">
        <p class="mui-input--title">{{ title }}</p>
        <p v-if="maxlength" :class="{'mui-input--limit': 1, 'err': error}">{{ value.length + '/' + maxlength }}</p>
        <p v-if="length" class="mui-input--limit">{{ length }}</p>
      </div>
      <div class="mui-fl-vert mui-fl-btw">
        <m-field
          v-if="type === 'textarea'"
          v-model="value"
          class="sty11-textarea"
          :placeholder="placeholder"
          :rows="rows"
          autosize
          type="textarea"
          @input="input"
          @focus="focus"
          @blur="blur"
          @change="change"
          ref="ndInput"
        />

        <input
          v-else
          v-focus="focused"
          :type="realType"
          :placeholder="placeholder"
          v-model="value"
          :readonly="readonly"
          :disabled="disabled"
          :class="{'mui-input--input': 1, 'has-value': value !== ''}"
          @input="input"
          @focus="focus"
          @blur="blur"
          @change="change"
          @keydown="onKeyDown"
          ref="ndInput"
        />

        <p class="mui-fl-vert mui-input--icons">
          <i v-if="clearIcon && isFocused && value && !loading && !readonly && !resolveloading && !domainOwner" class="mico-solid-close icon-solid-close taplight2" @mousedown="handleClear"/>
          <i v-if="eyeIcon" :class="{'icon-visible taplight2': 1, 'mico-invisible': realType === 'password', 'mico-visible': realType === 'text'}" @click="handleEyes"/>
          <m-button v-if="domainOwner" round class="mui-input-payaddbut" @click="ensfun">SNS</m-button>
        </p>

        <div v-if="ensbut" class="mui-input-domainOwnertip mui-fl-col">
          <div class="triangle"></div>
          <div class="handtip">{{payadd}}</div>
          <div class="dow">{{domainOwner}}</div>
        </div>
      </div>
    </div>
    <p v-if="error && errorMsg" class="mui-input-sty1--err van-fade-enter-active">{{ errorMsg }}</p>
  </div>
</template>

<script>
export default {
  name: 'MuiInput',
  model: {
    prop: '_value',
    event: 'input'
  },
  props: {
    resolveloading: {
      type: Boolean,
      default: false
    },
    domainOwner: {
      type: String,
      default: ''
    },
    paynewpbkadd: {
      type: Boolean,
      default: false
    },
    payadd: {
      type: String,
      default: ''
    },
    _value: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: 'Please enter...'
    },
    clearable: {
      type: Boolean,
      default: true
    },
    readonly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Password'
    },
    rows: {
      type: Number,
      default: 4
    },
    error: {
      type: Boolean,
      default: false
    },
    errorMsg: {
      type: String,
      default: ''
    },
    clearIcon: {
      type: Boolean,
      default: true
    },
    eyeIcon: {
      type: Boolean,
      default: false
    },
    maxlength: {
      type: String,
      default: ''
    },
    length: {
      type: Number,
      default: 0
    },
    focused: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      ensbut: false,
      time: '',
      watime: '',
      realType: this.type,
      isFocused: false
    }
  },
  computed: {
    value: {
      get () {
        return this._value
      },
      set (val) {
        this.$emit('input', val)
      }
    }
  },
  watch: {
    ensbut (val) {
      if (val) {
        window.clearTimeout(this.watime)
        this.watime = setTimeout(() => {
          this.ensbut = false
        }, 5000)
      }
    },
    domainOwner (val) {
      if (val) {
        if (this.ensbut) {
          this.ensbut = false
        }
        setTimeout(() => {
          this.ensbut = true
          window.clearTimeout(this.time)
          this.time = setTimeout(() => {
            this.domtime = false
            this.ensbut = false
          }, 3000)
        }, 0)
      } else {
        this.ensbut = false
      }
    }
  },
  methods: {
    input () {},
    focus () {
      this.isFocused = true
      this.$emit('focus')
    },
    blur () {
      this.isFocused = false
      this.$emit('blur')
    },
    change () {
      this.$emit('change')
    },
    ensfun () {
      if (this.ensbut) {
        window.clearTimeout(this.time)
        window.clearTimeout(this.watime)
        this.ensbut = false
      } else {
        this.ensbut = true
      }
    },
    handleClear () {
      this.value = ''
      this.$emit('clear')
      setTimeout(() => {
        this.$refs.ndInput.focus()
      }, 0)
    },
    handleEyes () {
      this.realType = this.realType === 'password' ? 'text' : 'password'
    },
    onKeyDown (e) {
      if (e.keyCode === 13) {
        this.$emit('keydown')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.mui-input-wrap-sty1 {
  background-color: #FAFAFB;
  padding: 11px;
  border-radius: 14px;
  border: 1px solid #FAFAFB;
  &.err {
    border-color: var(--border-err-color) !important;
  }
}

.mui-input--title {
  font-size: 14px;
  line-height: 18px;
  color: #6C6C6C;
  margin-bottom: 4px;
}

.mui-input--limit {
  font-size: 14px;
  line-height: 18px;
  color: var(--text4-color);
  &.err {
    color: var(--border-err-color) !important;
  }
}

.mui-input--input{
  display: block;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--bg-color4);
  border: none;
  color: #000;
  font-size: 14px;
  line-height: 22px !important;
  &::placeholder{
    font-size: 14px !important;
    line-height: 22px !important;
    color: #C0C0C0;
    font-weight: 400 !important;
    letter-spacing: normal;
  }
  &.has-value {
    &[type='password'] {
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
  }
}

.mui-input--icons {
  .icon-solid-close {
    color: #E8E8E8;
  }
  .icon-visible {
    color: #6C6C6C;
  }
  i {
    font-size: 20px;
    margin-left: 8px;
  }
}

.mui-input-sty1--err {
  font-size: 12px;
  line-height: 16px;
  color: var(--border-err-color);
  margin-top: 8px;
}
.mui-input-payaddbut {
  font-size: 12px;
  font-weight: 400;
  background: rgba(27, 209, 168, 0.1);
  padding: 2px 6px;
  width: 35px;
  height: 20px;
  border-radius: 6px;
  color: var(--toast-success-color);
  border: none;
}
.mui-input-domainOwnertip {
  // padding: 0 16px 0 32px;
  top: 70px;
  left: 0;
  margin: 0 auto;
  width: 327px;
  height: 60px;
  position: absolute;
  color: #FFFFFF;
  border-radius: 12px;
  font-weight: 400;
  background-color: #292C33;
  z-index: 10;
  font-size: 12px;
  // margin-left: -8px;

  -webkit-animation: fadeleftIn .4s;
  animation: fadeleftIn .4s;
  -webkit-animation-name: popIn;
  animation-name: popIn;
  @keyframes popIn {
      0% {
          -webkit-transform: scale3d(0, 0, 0);
          transform: scale3d(0.5, 0.5, 0.5);
          opacity: 0;
      }
      50% {
          -webkit-animation-timing-function: cubic-bezier(0.47, 0, 0.745, 0.715);
          animation-timing-function: cubic-bezier(0.47, 0, 0.745, 0.715);
      }
      100% {
          -webkit-transform: scale3d(1, 1, 1);
          transform: scale3d(1, 1, 1);
          -webkit-animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          opacity: 1;
      }
  }

  .triangle {
    border-left: 21px solid transparent;
    border-right: 21px solid transparent;
    border-bottom: 15px solid #292C33;
    position: absolute;
    top: -7px;
    right: 7.5px;
    z-index: 1;
  }
  .handtip {
    margin: 12px 0 4px 16px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 16px;
    margin-left: 16px;
  }
  .dow {
    line-height: 16px;
    margin-left: 16px;
  }
}

.grey-model {
  .mui-input-wrap-sty1 {
    background-color: #FFFFFF;
    border: 1px solid transparent;
    .mui-input--title {
    color: #6C6C6C;
    }
    .mui-input--limit {
      color: #6C6C6C;
    }
    .mui-input--input {
      background: transparent;
      color: #000;
      &::placeholder {
        color: #C0C0C0;
      }
    }
    .mui-input--icons {
      .icon-solid-close {
        color: #E8E8E8;
      }
      .icon-visible {
        color: #6C6C6C;
      }
    }
  }
  &::v-deep {
    .van-cell {
      background-color: transparent;
      color: #FFFFFF;
    }
    .van-field__control {
      color: #000 !important;
      &::placeholder {
        color: #6C6C6C;
      }
    }
  }
}

</style>
