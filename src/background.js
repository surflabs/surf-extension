// import axios from 'axios'
import { chromeStorage } from '@/utils/common'
// import api from '@/api'
// import { openUrlCurrentTab } from '@/utils/browser-helpers'
import { ProviderFailureType } from '@/utils/failure-type'
// import { ETH_CLUSTERS } from '@/utils/clusters'

const responseHandlers = new Map()
const backgroundStorage = new Map()

function wakePromise (msgId, message) {
  backgroundStorage.delete(msgId)
  const rp = responseHandlers.get(msgId)

  responseHandlers.delete(msgId)
  const id = msgId.replace(/^\w+-/gi, '')

  typeof rp === 'function' && rp(Object.assign(message || {}, { id }))
}

browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  const {
    channel,
    id: msgId,
    fromChain = 'sui',
    method,
    params
  } = message
  let popupLeft = 600

  if (channel === 'CONTENT_SCRIPT') {
    try {
      // https://owasp.org/www-community/attacks/Clickjacking
      if (sender.frameId !== 0) {
        return {
          id: msgId,
          message: ProviderFailureType.notSecure.message
        }
      }

      const { registered } = await chromeStorage.get('registered')

      if (registered !== '1' && method !== 'HAS_PERMISSIONS') {
        method !== 'DISCONNECT' && chrome.tabs.create({ url: 'index.html' })
        return { id: msgId }
      }

      const [{ workArea }] = await chrome.system.display.getInfo()
      popupLeft = workArea.width - 391 - 20

      const { trustedApps = {} } = await chromeStorage.get('trustedApps')
      const { loginAccount } = await chromeStorage.get('loginAccount')
      let trustedByCurrWallet

      if (loginAccount) {
        trustedByCurrWallet = (trustedApps[loginAccount] || {})[sender.origin]
      }

      if (method === 'GET_ACCOUNTS') {
        if (trustedByCurrWallet) {
          trustedApps[loginAccount][sender.origin].expiry = Date.now() + Number(process.env.VUE_APP_CONNECTED_PERIOD)
          chromeStorage.set({ trustedApps })

          return {
            id: msgId,
            code: 200,
            data: [loginAccount]
          }
          //
        } else {
          return { id: msgId, message: ProviderFailureType.unauthorized.message }

          // return new Promise(resolve => {
          //   responseHandlers.set(id, resolve)
          // })
          // responseHandlers.set(id, sendResponse)
          // return true
        }
        //
        //
        //
      } else if (method === 'HAS_PERMISSIONS') {
        return { id: msgId, code: 200, data: !!trustedByCurrWallet }
        //
        //
        //
      } else if (method === 'REQUEST_PERMISSIONS') {
        //
        if (trustedByCurrWallet) {
          return { id: msgId, code: 200, data: true }
        } else {
          const id = `${sender.tab.id}-${msgId}`

          chrome.windows.create({
            type: 'popup',
            url: `popup.html#/connect?origin=${sender.origin}&id=${id}&fromChain=${fromChain}&favIconUrl=${sender.tab.favIconUrl}&title=${sender.tab.title}`,
            top: 20,
            left: popupLeft,
            width: 391,
            height: 639
          })

          return new Promise(resolve => {
            responseHandlers.set(id, resolve)
          })
        }
        //
        //
        //
      } else if (
        method === 'EXECUTE_MOVECALL' ||
        method === 'EXECUTE_SERIALIZED_MOVECALL' ||
        method === 'SIGN_AND_EXECUTE_TRANSACTION'
      ) {
        if (!trustedByCurrWallet) {
          return { id: msgId, message: ProviderFailureType.unauthorized.message }
        }

        const id = `${sender.tab.id}-${msgId}`

        backgroundStorage.set(id, params)

        chrome.windows.create({
          type: 'popup',
          url: `popup.html#/sign-tx?origin=${sender.origin}&id=${id}&method=${method}&fromChain=${fromChain}&title=${sender.tab.title}&favIconUrl=${sender.tab.favIconUrl}`,
          top: 20,
          left: popupLeft,
          width: 391,
          height: 639
        })

        return new Promise(resolve => {
          responseHandlers.set(id, resolve)
        })
        //
        //
        //
      } else if (method === 'DISCONNECT') {
        //
        //
        //
      }
    } catch (error) {
      console.log(error)
      return { id: msgId, message: error.message }
    }
    //
    //
    //
  } else if (channel === 'POPUP_TO_DAPP') {
    if (!msgId) return
    wakePromise(msgId, message)
    //
    //
    //
  } else if (channel === 'GET_STORAGE') {
    if (!sender.url.includes('popup.html')) {
      return
    }
    const value = backgroundStorage.get(message.key)
    return value
    //
    //
    //
  } else if (channel === 'SET_STORAGE') {
    backgroundStorage.set(message.key, message.value)
    //
    //
    //
  } else if (channel === 'REMOVE_STORAGE') {
    backgroundStorage.delete(message.key)
    //
    //
    //
  } else if (channel === 'CLEAR_STORAGE') {
    const blocklist = backgroundStorage.get('blocklist')
    backgroundStorage.clear()
    backgroundStorage.set('blocklist', blocklist)
  }
})

chrome.runtime.onConnect.addListener(port => {
  port.onDisconnect.addListener(async port => {
    if (port.name.startsWith('POPUP_CONNECT_CHANNEL')) {
      const msgId = port.name.split('POPUP_CONNECT_CHANNEL')[1]

      if (msgId) {
        wakePromise(msgId, {
          code: ProviderFailureType.userRejectedRequest.code,
          message: ProviderFailureType.userRejectedRequest.message
        })
      }
    }
  })
})
