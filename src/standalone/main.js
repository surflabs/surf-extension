import Vue from 'vue'
import App from './App.vue'
import router from '../router/sign'
import Mui from '@/components/_mui'
import Elui from '@/components/_elui'
import directives from '@/utils/directives'
import { chromeStorage, backgroundStorage } from '@/utils/common'
import api from '@/api'
import store from '../store'

Vue.use(Mui)
Vue.use(Elui)
Vue.use(directives)
Vue.config.productionTip = false

Object.defineProperty(Vue.prototype, '$api', { value: api })
Object.defineProperty(Vue.prototype, '$crmStorage', { value: chromeStorage })
Object.defineProperty(Vue.prototype, '$bgStorage', { value: backgroundStorage })
Object.defineProperty(Vue.prototype, '$sendMessage', { value: chrome.runtime.sendMessage })
delete chrome.runtime.sendMessage

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
