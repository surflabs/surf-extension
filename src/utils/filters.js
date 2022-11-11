/**
 * @description Vue global filters
 */

import np from './number-precision'
import { numberFormat } from './common'
import BigNumber from 'bignumber.js'
import store from '@/store'

export const BIG_TEN = new BigNumber(10)
const BN = BigNumber.clone({ ROUNDING_MODE: 1, DECIMAL_PLACES: 9 })

export const timestampDate = (timestamp, isZerofill = false) => {
  const time = new Date(Number(timestamp + (isZerofill ? '000' : '')))
  const Y = time.getFullYear()
  const M = (time.getMonth() + 1) < 10 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1
  const d = time.getDate() < 10 ? '0' + time.getDate() : time.getDate()
  const h = time.getHours() < 10 ? '0' + time.getHours() : time.getHours()
  const m = time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()
  const s = time.getSeconds() < 10 ? '0' + time.getSeconds() : time.getSeconds()
  return Y + '-' + M + '-' + d + ' ' + h + ':' + m + ':' + s
}

export const formatPubKey = (pubKey, length = 4, preLength) => {
  if (!pubKey || typeof pubKey !== 'string' || pubKey.length < (length * 2 + 1)) {
    return pubKey
  }
  return pubKey.substr(0, preLength || length) + '...' + pubKey.substr(length * -1, length)
}

export function subRadio (num, radio = 2, needPos) {
  if (np.isNum(num)) {
    const arr = num.toString().split('.')
    if (arr[1]) {
      num = `${arr[0]}.${arr[1].substring(0, radio)}`
    }
    const n = np.round(Number(num), radio)
    let f = n.toFixed(radio)
    f = numberFormat(f, '', radio)
    return n > 0 && needPos ? '+' + f : f
  } else {
    return num
  }
}

export function bn2Str (num, maximumFractionDigits = 20) {
  const BN = BigNumber.clone({ ROUNDING_MODE: 1, DECIMAL_PLACES: maximumFractionDigits })
  if (np.isNum(num)) {
    return new BN(num).toString(10)
  } else {
    return num
  }
}

export function getHostname (origin) {
  if (typeof origin !== 'string') {
    return origin
  }
  return origin.replace(/https?:\/\/(www.)?/i, '')
}

export const formatBalance = (num, mode = 1) => {
  if (new BigNumber(num).gte(100)) {
    const BN_DP0 = BigNumber.clone({ ROUNDING_MODE: mode, DECIMAL_PLACES: 0 })
    const step1 = new BN_DP0(num).toString(10)
    return new BN_DP0(step1).toFormat()
    //
  } else if (new BigNumber(num).gte(10)) {
    const BN_DP1 = BigNumber.clone({ ROUNDING_MODE: mode, DECIMAL_PLACES: 1 })
    const step1 = new BN_DP1(num).toString(10)
    return new BN_DP1(step1).toFormat()
    //
  } else if (new BigNumber(num).gte(1)) {
    const BN_DP2 = BigNumber.clone({ ROUNDING_MODE: mode, DECIMAL_PLACES: 2 })
    const step1 = new BN_DP2(num).toString(10)
    return new BN_DP2(step1).toFormat()
    //
  } else {
    for (let i = 4; i < 10; i++) {
      const BN = BigNumber.clone({ ROUNDING_MODE: mode, DECIMAL_PLACES: i })
      const step1 = new BN(num)
      const step1Str = new BN(num).toString(10)
      if (new BN(step1Str).eq(0)) {
        if (i < 9) {
          continue
        } else {
          return 0
        }
      } else {
        return step1.toString(10)
      }
    }
  }
}

export const getNewGoodsList = (params) => {
  var temp = {}
  for (var i in params) {
    var key = params[i].symbol
    if (temp[key]) {
      temp[key].symbol = params[i].symbol
      temp[key].balance += params[i].balance
      temp[key].allObjArr.push({
        id: params[i].fields.id.id,
        balance: params[i].balance
      })
      temp[key].logoURI = params[i].logoURI
      temp[key].address = params[i].address
      temp[key].decimals = params[i].decimals
    } else {
      temp[key] = {}
      temp[key].symbol = params[i].symbol
      temp[key].balance = params[i].balance
      temp[key].allObjArr = [{ id: params[i]?.fields?.id?.id, balance: params[i].balance }]
      temp[key].logoURI = params[i].logoURI
      temp[key].address = params[i].address
      temp[key].decimals = params[i].decimals
    }
  }
  var newArry = []
  for (var k in temp) {
    newArry.push(temp[k])
  }
  return newArry
}

export const formatSui = (num) => {
  const n = new BN(num).dividedBy(BIG_TEN.pow(store.getters.suiDecimals))
  return new BN(n.toString(10)).toFormat()
}

const filters = {
  timestampDate,
  formatPubKey,
  subRadio,
  bn2Str,
  getHostname,
  // displayBalance,
  formatBalance,
  formatSui
}

const install = function (Vue) {
  Object.keys(filters).forEach(key => {
    Vue.filter(key, filters[key])
  })
}

// auto install
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default Object.assign(filters, { install })
