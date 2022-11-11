<template>
  <div class="_OnlineBlocked">
    <div class="_dialog">
      <div class="_head">
        <img :src="logo" alt="" srcset="" />
      </div>
      <div class="_t1">{{getHostUrl(redirectUrl)}} is blocked!</div>
      <div class="_desc">
        <span>
This website is blocked as a part of a community-maintained
        </span>
        <span>
list of malicious websites, if you belive the website has
        </span>
        <span>
been blocked in error, please file an issue.
        </span>
      </div>
      <div class="_footer">
        <div class="_link" @click="linkTo(redirectUrl)">Ignore warning, show anyway</div>
      </div>
    </div>
  </div>
</template>
<script>
import { chromeStorage } from '@/utils/common'
const getRequest = (myUrl = location.search) => {
  var url = decodeURI(myUrl)
  var theRequest = {}
  if (url.indexOf('?') !== -1) {
    const str = url.substr(1)
    const strs = str.split('&')
    for (var i = 0; i < strs.length; i++) {
      theRequest[strs[i].split('=')[0]] = unescape(strs[i].split('=')[1])
    }
  }
  return theRequest
}
/**
 * @param {Array} Arr
 * @param {Array<String> || String} key
 * @returns []
 */
const objArrSet = (Arr, key) => {
  var obj = {}
  var keyStr = key
  const arrays = Arr.reduce((setArr, item) => {
    if (Array.isArray(key)) {
      keyStr = key.reduce((a, b) => item[a] + item[b])
      if (!obj[keyStr]) {
        obj[keyStr] = true && setArr.push(item)
      }
    } else {
      if (!obj[item[keyStr]]) {
        obj[item[keyStr]] = true && setArr.push(item)
      }
    }
    return setArr
  }, [])
  return arrays
}
export default {
  data () {
    return {
      logo: require('@/assets/img/logo2.png'),
      redirectUrl: ''
    }
  },
  created () {
    this.onMessage()
  },
  methods: {
    onMessage () {
      const urlobj = getRequest()
      this.redirectUrl = decodeURIComponent(urlobj.url)
    },
    async linkTo (url) {
      const storageData = await chromeStorage.get('onlineBlocked') || {}
      let onlineBlocked = storageData.onlineBlocked ? JSON.parse(storageData.onlineBlocked) : []
      onlineBlocked = [...[{
        date: new Date().getTime(), url: url.split('?') ? url.split('?')[0] : ' '
      }], ...onlineBlocked]
      onlineBlocked = objArrSet(onlineBlocked, 'url')
      chromeStorage.set({ onlineBlocked: JSON.stringify(onlineBlocked) })
      window.location.href = url
    },
    getHostUrl (url) {
      const urlstr = url.split('/')
      let urls = ''
      if (urlstr[2]) {
        urls = urlstr[2]
      }
      return urls
    }

  }
}
</script>
<style lang="scss" scoped>
._OnlineBlocked {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000000;
  ._dialog {
    width: calc(464px - 90px);
    // height: 350px;
    background: #ffffff;
    border-radius: 24px;
    padding: 40px 46px 40px 44px;
    ._head {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
      img {
        width: 72px;
        height: 72px;
        border-radius: 50%;
      }
    }
    ._t1 {
      font-style: normal;
      font-weight: 700;
      font-size: 28px;
      line-height: 40px;
      text-align: center;
      color: #FF7171;
      margin-bottom: 12px;
    }
    ._desc {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      text-align: center;
      color: #292c33;
      margin-bottom: 50px;
      span{
          display: inline-block;
      }
    }
    ._footer {
      ._link {
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 20px;
        /* identical to box height, or 125% */

        text-align: center;

        color: #292c33;
        cursor: pointer;
        &:hover{
            text-decoration:underline;
        }
      }
    }
  }
}
</style>
