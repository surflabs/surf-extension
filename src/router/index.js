import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

// import Header from '@/popup/Header'
import TabBar from '@/popup/TabBar'

import Login from '@/views/sign/Login.vue'
import ResetPasswordVerify from '@/views/sign/ResetPasswordVerify.vue'
import Home from '@/views/home/Home.vue'
import SignTransaction from '@/views/sign/SignTransaction.vue'
import Connect from '@/views/sign/Connect.vue'

import my from './my'

import { chromeStorage } from '@/utils/common'

const originalPush = VueRouter.prototype.push
const originalReplace = VueRouter.prototype.replace

VueRouter.prototype.push = function push (to, onResolve, onReject) {
  store.commit('SET_ROUTING_DIRECTION', 'forward')

  if (onResolve || onReject) {
    return originalPush.call(
      this,
      to,
      () => {
        typeof onResolve === 'function' && onResolve()
      },
      (err) => {
        if (err.type !== VueRouter.NavigationFailureType.redirected) {
          store.commit('SET_ROUTING_DIRECTION', '')
        }
        typeof onReject === 'function' && onReject()
      }
    )
  }
  return originalPush.call(this, to).catch((err) => {
    if (err.type === VueRouter.NavigationFailureType.redirected) {
      // resolve err
      return err
    }
    store.commit('SET_ROUTING_DIRECTION', '')
    // rethrow error
    return Promise.reject(err)
  })
}

VueRouter.prototype.replace = function replace (to, onResolve, onReject) {
  store.commit('SET_ROUTING_DIRECTION', 'forward')

  if (onResolve || onReject) {
    return originalReplace.call(this, to, onResolve, onReject)
  }
  return originalReplace.call(this, to).catch((err) => {
    if (err.type === VueRouter.NavigationFailureType.redirected) {
      // resolve err
      return err
    }
    store.commit('SET_ROUTING_DIRECTION', '')
    // rethrow error
    return Promise.reject(err)
  })
}

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: TabBar,
    children: [
      {
        path: '',
        name: 'home',
        component: Home,
        meta: {
          source: 'tab',
          keepAlive: true
        }
      },
      {
        path: 'collectibles',
        name: 'collectibles',
        component: () => import('@/views/collectibles/Collectibles.vue'),
        meta: {
          source: 'tab',
          keepAlive: true
        }
      },
      {
        path: 'record',
        name: 'record',
        component: () => import('@/views/record/Record.vue'),
        meta: {
          source: 'tab',
          keepAlive: true
        }
      },
      {
        path: 'my',
        name: 'my',
        component: () => import('@/views/my/My.vue'),
        meta: {
          source: 'tab',
          keepAlive: true
        }
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      noAuth: true
    }
  },
  {
    path: '/resetpwd-verify',
    name: 'resetPwdVerify',
    component: ResetPasswordVerify,
    meta: {
      noAuth: true
    }
  },
  ...my,
  {
    path: '/connect',
    name: 'connect',
    component: Connect
  },
  {
    path: '/sign-tx',
    name: 'signTx',
    component: SignTransaction
  },
  {
    path: '/collectDetail',
    name: 'collectDetail',
    component: () => import('@/views/collectibles/Detail.vue')
  },
  {
    path: '/sendNft',
    name: 'sendNft',
    component: () => import('@/views/collectibles/SendNft.vue'),
    meta: {
      keepAlive: true
    }
  },
  {
    path: '/nft-send-confirm',
    name: 'sendConfirm',
    component: () => import('@/views/collectibles/SendConfirm.vue')
  },
  // {
  //   path: '/popularToken',
  //   name: 'PopularToken',
  //   component: () => import('@/views/home/PopularToken.vue')
  // },
  // {
  //   path: '/manualToken',
  //   name: 'ManualToken',
  //   component: () => import('@/views/home/ManualToken.vue')
  // },
  {
    path: '/receivespage',
    name: 'Receivespage',
    component: () => import('@/views/home/Receivespage.vue'),
    meta: {
      animation: 'up'
    }
  },
  {
    path: '/receivesqrcode',
    name: 'Receivesqrcode',
    component: () => import('@/views/home/Receivesqrcode.vue')
  },
  {
    path: '/token-send-confirm',
    name: 'Sendconfirm',
    component: () => import('@/views/home/Sendconfirm.vue')
  },
  {
    path: '/sendpage',
    name: 'Sendpage',
    component: () => import('@/views/home/Sendpage.vue'),
    meta: {
      animation: 'down'
    }
  },
  {
    path: '/purchase-methods',
    name: 'purchaseMethods',
    component: () => import('@/views/home/PurchaseMethods.vue')
  },
  // {
  //   path: '/staking-methods',
  //   name: 'stakingMethods',
  //   component: () => import('@/views/home/StakingMethods.vue'),
  //   meta: {
  //     keepAlive: true
  //   }
  // },
  // {
  //   path: '/pool-detail',
  //   name: 'poolDetail',
  //   component: () => import('@/views/home/PoolDetail.vue')
  // },
  // {
  //   path: '/stakeds',
  //   name: 'stakeds',
  //   component: () => import('@/views/home/Stakeds.vue')
  // },
  // {
  //   path: '/staking-detail',
  //   name: 'stakingDetail',
  //   component: () => import('@/views/home/StakingDetail.vue')
  // },
  // {
  //   path: '/staked-detail',
  //   name: 'stakedDetail',
  //   component: () => import('@/views/home/StakedDetail.vue')
  // },
  {
    path: '/addWallet',
    name: 'AddWallet',
    component: () => import('@/views/side/AddWallet.vue')
  },
  {
    path: '/importWallet',
    name: 'ImportWallet',
    component: () => import('@/views/side/ImportWallet.vue'),
    meta: {
      needPwd: 1
    }
  },
  {
    path: '/create-new-wallet',
    name: 'createNewWallet',
    component: () => import('@/views/side/CreateNewWallet.vue'),
    meta: {
      needPwd: 1
    }
  },
  {
    path: '/token-record',
    name: 'tokenRecord',
    component: () => import('@/views/record/Record.vue')
  },
  {
    path: '/record-detail',
    name: 'recordDetail',
    component: () => import('@/views/record/RecordDetail.vue')
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.noAuth)) {
    next()
    //
  } else {
    //
    let loginAccount = store.state.loginAccount
    let loginExpiry = store.state.loginExpiry
    const isLaunch = !loginAccount || !loginExpiry

    if (isLaunch) {
      const [rp1, rp2] = await Promise.all([
        chromeStorage.get('loginAccount'),
        chromeStorage.get('loginExpiry')
      ])

      loginAccount = rp1.loginAccount
      loginExpiry = rp2.loginExpiry

      store.commit('SET_LOGIN_ACCOUNT', loginAccount)
      store.commit('SET_LOGIN_EXPIRY', loginExpiry || 0)
    }

    if (isLaunch && Date.now() > loginExpiry) {
      store.commit('SET_LOGIN_EXPIRY', 0)
      next({ name: 'login', query: { redirect: to.fullPath }, replace: true })
      //
    } else {
      //
      if (to.meta.needPwd) {
        store.state.pwdValidPass ? next() : next('/')
      } else {
        next()
      }
    }
  }
})

export default router
