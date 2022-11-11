import Vue from 'vue'
import VueRouter from 'vue-router'

import OnlineBlocked from '@/views/local/OnlineBlocked.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'online-blocked',
    component: OnlineBlocked
  }
]

const router = new VueRouter({
  routes
})

export default router
