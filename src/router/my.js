export default [
  {
    path: '/chgname',
    name: 'chgName',
    component: () => import('@/views/my/ChangeName.vue')
  },
  {
    path: '/setnewpass',
    name: 'setNewPass',
    component: () => import('@/views/my/ChangePassword.vue'),
    meta: {
      needPwd: 1
    }
  },
  {
    path: '/resetnewpwd',
    name: 'resetNewPwd',
    component: () => import('@/views/my/ChangePassword.vue'),
    meta: {
      noAuth: true
    }
  },
  {
    path: '/autolock',
    name: 'autoLock',
    component: () => import('@/views/my/AutoLock.vue')
  },
  {
    path: '/chgnetwork',
    name: 'chgNetwork',
    component: () => import('@/views/my/ChangeNetwork.vue')
  },
  {
    path: '/confirmpwd',
    name: 'confirmPwd',
    component: () => import('@/views/my/ConfirmPassword.vue')
  },
  {
    path: '/export-private',
    name: 'exportPrivate',
    component: () => import('@/views/my/ExportPrivate.vue'),
    meta: {
      needPwd: 1
    }
  },
  {
    path: '/export-mnemonic',
    name: 'exportMnemonic',
    component: () => import('@/views/my/ExportMnemonic.vue'),
    meta: {
      needPwd: 1
    }
  },
  {
    path: '/remove',
    name: 'remove',
    component: () => import('@/views/my/RemoveWallet.vue')
  },
  {
    path: '/trusted-apps',
    name: 'trustedApps',
    component: () => import('@/views/my/TrustedApps.vue')
  }
]
