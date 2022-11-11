import Vue from 'vue'
import VueRouter from 'vue-router'

import Sign from '@/views/sign/Sign.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'sign',
    component: Sign
  }
]

const router = new VueRouter({
  routes
})

export default router
