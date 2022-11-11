import Vue from 'vue'
import App from './App.vue'
import router from '../router'
import store from '../store'
import Mui from '@/components/_mui'
import Elui from '@/components/_elui'
import directives from '@/utils/directives'
import filters from '@/utils/filters'
import api from '@/api'
import np from '@/utils/number-precision'
// import VueNativeSock from 'vue-native-websocket'
import { chromeStorage, backgroundStorage, log } from '@/utils/common'

if (!store.state.registered) {
  chrome.tabs.create({ url: 'index.html' })
}

const qr = new URLSearchParams(location.hash.replace(/^.*\?/, ''))
const redirectQr = new URLSearchParams(qr.get('redirect'))
const id = qr.get('id') || redirectQr.get('id')
// chrome.alarms.clear('AUTO_LOCK_TIMER')
chrome.runtime.connect({
  name: 'POPUP_CONNECT_CHANNEL' + id
})

const theme = store.state.theme
const ndHtml = document.querySelector('html')
if (!theme || theme === 'dark') {
  ndHtml.classList.add('dark')
  // const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  // if (mediaQuery.matches) {
  //   store.commit('SET_THEME', { theme: 'dark', setLocal: false })
  //   ndHtml.classList.add('dark')
  // } else {
  //   store.commit('SET_THEME', { theme: 'light', setLocal: false })
  //   ndHtml.classList.remove('dark')
  // }
} else {
  ndHtml.classList.remove('dark')
}

Vue.use(Mui)
Vue.use(Elui)
Vue.use(directives)
Vue.use(filters)

Vue.config.productionTip = false
np.enableBoundaryChecking(false)

Object.defineProperty(Vue.prototype, '$api', { value: api })
Object.defineProperty(Vue.prototype, '$crmStorage', { value: chromeStorage })
Object.defineProperty(Vue.prototype, '$bgStorage', { value: backgroundStorage })
Object.defineProperty(Vue.prototype, '$sendMessage', { value: chrome.runtime.sendMessage })
Object.defineProperty(Vue.prototype, '$np', { value: np })
Object.defineProperty(Vue.prototype, '$log', { value: log })
// delete chrome.runtime.sendMessage

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
