<template>
  <m-popup
    class="aside-swl"
    position="bottom"
    v-model="showPop"
    overlay
    :close-on-click-overlay="false"
    @click-overlay="handleClose">

    <div class="aside-swl--body">
      <p class="aside-swl-title mui-fl-central">Backup Reminder</p>
      <div v-if="isNeedNoteWalletList.length > 0" class="aside-swl--wallet mui-fl-vert">
        <img :src="walletIcon" alt="" class="mui-shr-0">
        <div class="mui-fl-1 mui-fl-btw mui-fl-vert_end">
          <div class="mui-fl-vert">
            <div class="mui-fl-col">
              <p class="t1">{{ isNeedNoteWalletList[0].name }}</p>
              <p class="t2 mui-fl-vert">
                {{ isNeedNoteWalletList[0].address | formatPubKey }}
                <i class="mico-copy taplight" @click="copyPubKey"></i>
              </p>
              <input type="text" v-model="isNeedNoteWalletList[0].address" ref="ndIptPubKey" class="ipt-hidden">
            </div>
          </div>
          <p v-if="balance !== ''" class="t3">{{ balance }}</p>
          <m-loading class="money" v-else size="20px"  color="#686868" />
        </div>
      </div>

      <p class="aside-swl-tip">
        You have not backed up your seed phrase. Failure to back up your seed phrase will put your assets at risk of being irretrievable and we recommend that you do so as soon as possible.
      </p>

      <div class="aside-swl-checkbox">
        <m-checkbox v-model="checked" class="sty2-checkbox mui-fl-vert">
          No more reminders
          <template #icon="props">
            <i v-if="props.checked" class="icon-checkbox-checked mico-selected"></i>
            <i v-else class="icon-checkbox-unchecked"></i>
          </template>
        </m-checkbox>
      </div>

      <div class="addwalbtn mui-shr-0 mui-fl-btw">
        <m-button block round class="mui-fl-1 fz18 gray " type="info" @click="later">Later</m-button>
        <m-button block round class="mui-fl-1 fz18" type="info" @click="backup">Back up</m-button>
      </div>
    </div>

  </m-popup>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { placeIcon } from '@/utils/mixin'

export default {
  name: 'Note',
  mixins: [placeIcon],
  data () {
    return {
      checked: false,
      loading: false,
      balance: ''
    }
  },
  model: {
    prop: 'showNoteTip',
    event: 'show'
  },
  props: {
    showNoteTip: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState(['accounts', 'mainWallet']),
    ...mapGetters(['curAccount', 'curWalIdx']),
    showPop: {
      get () {
        return this.$store.state.common.showNoteTip
      },
      set (val) {
        this.$store.commit('SET_SHOW_NOTETIP', val)
      }
    },
    isNeedNoteWalletList () {
      const list = []
      this.accounts.forEach(v => {
        if (v.isNeedNote) {
          list.push(v)
        }
      })
      return list
    },
    walletIcon () {
      return (this.walletIconList[this.isNeedNoteWalletList[0].index % 12] || {}).icon
    }
  },
  watch: {
    'showPop' (n) {
      if (n) {
        this.loading = true
        setTimeout(async () => {
          if (this.isNeedNoteWalletList.length > 0 && !this.balance) {
            const rp = await this.$store.dispatch('_getBalancesList', { specifiedPubKey: this.isNeedNoteWalletList[0].address })
            this.balance = rp[0].balance === 0 ? '$0.00' : '--'
            this.loading = false
          }
        }, 500)
      }
    }
  },
  methods: {
    copyPubKey () {
      this.$refs.ndIptPubKey.select()
      document.execCommand('copy')
      this.$message({
        message: 'Copy Success',
        iconClass: 'mico-success',
        customClass: 'sty1-message',
        duration: 1000,
        offset: 270,
        center: true
      })
    },
    handleClose () {
      const hasNoteInfo = JSON.parse(this.$store.state.common.hasNoteInfo)
      const jsonString = JSON.stringify({
        num: hasNoteInfo.num,
        isShow: false,
        timestamp: Date.parse(new Date())
      })
      this.$store.commit('SET_HAS_NOTE_INFO', jsonString)
      this.$store.commit('SET_SHOW_NOTETIP', false)
    },

    async noMoreReminders () {
      this.$store.commit('SET_HAS_NOTE_INFO', false)
      this.$store.commit('SET_NEED_NOTE', false)
      this.$store.commit('SET_NO_MORE_REMINDERS', true)
    },

    later () {
      this.handleClose()
      if (this.checked) {
        this.noMoreReminders()
      }
    },

    backup () {
      this.handleClose()
      this.$router.push({ path: '/confirmpwd', query: { s: 'mnemonic' } })
      if (this.checked) {
        this.noMoreReminders()
      }
      if (this.isNeedNoteWalletList[0].address === this.curAccount.address) {
        return
      }

      this.accounts.forEach((v, index) => {
        if (v.address === this.isNeedNoteWalletList[0].address) {
          localStorage.setItem('curWalIdx', index)
          this.$store.commit('CLEAR_BALANCES')
          this.$store.commit('SET_LASTTIME_SEND', '')
          this.$store.commit('SET_CUR_WAL_IDX', index)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .aside-swl {
    box-sizing: border-box;
    width: 100%;
    max-height: 528px;
    height: auto;
    background: var(--bg-color);
    overflow: hidden;
  }
  .aside-swl--body {
    box-sizing: border-box;
    padding: 24px 24px 36px 24px;
    width: 100%;

    .aside-swl-title {
      font-weight: 500;
      font-size: 18px;
      line-height: 24px;
      color: var(--text12-color);
    }

    .aside-swl--wallet {
      margin: 16px 0;
      padding: 17px 18px 17px 20px;
      border-radius: 14px;
      background-color: #FAFAFB;
      img {
        width: 44px;
        height: 44px;
        margin-right: 8px;
      }
      .t1 {
        font-weight: 500;
        line-height: 18px;
        color: #000000;
      }
      .t2 {
        margin-top: 8px;
        font-size: 12px;
        line-height: 16px;
        color: rgba(0, 0, 0, 0.5);
        i {
          margin-left: 2px;
          font-size: 16px;
          color: #6C6C6C;
        }
      }
      .t3 {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.8);
      }
    }

    .aside-swl-tip {
      line-height: 18px;
      // color: var(--text2-color);
      color: #6C6C6C;
    }

    .aside-swl-checkbox {
      margin: 16px 0;
      color: var(--text3-color);
      .icon-checkbox-checked {
        display: inline-block;
        color: var(--bg-color);
        background-color: var(--text9-color);
        border-radius: 2.5px;
        font-size: 13px;
        font-weight: 600;
      }
      .icon-checkbox-unchecked {
        display: inline-block;
        width: 10px;
        height: 10px;
        border: 1.5px solid #4C4F56;
        border-radius: 3px;
      }
    }

    .addwalbtn {
      .later {
        font-weight: 500;
        font-size: 16px;
        line-height: 22px;
        text-align: center;
        color: var(--text2-color);
        margin-top: 16px;
      }
    }
  }
</style>
