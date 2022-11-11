import axios from 'axios'
import { MD5 } from 'crypto-js'

import * as sign from './sign'

const apis = {
  sign
}

const defaults = {
  headers: {},
  successResponseHandler: () => {},
  errorResponseHandler: () => {}
}

const encrypt = data => {
  const key = Buffer.of(...[83, 108, 111, 112, 101, 50, 48, 50, 49, 64, 48, 57, 49, 55])

  if (Object.prototype.toString.call(data) === '[object Object]') {
    const keys = Object.keys(data).sort()
    let str = ''

    for (const k of keys) {
      if (!data[k] || data[k] === '0' || k === 'sign' || typeof data[k] === 'object') continue
      str += data[k]
    }

    return MD5(str + key.toString()).toString()
  } else if (data) {
    return MD5(data + key.toString()).toString()
  }
  return MD5(key.toString()).toString()
}

const request = function (event, data = {}, options = {}) {
  const path = event.split('.')
  const cfg = Object.assign({
    baseURL: process.env.VUE_APP_HYAPI_URL
  }, apis[path[0]][path[1]](data))
  const {
    autoHandleSuccess = true,
    autoHandleError = true
  } = options || {}

  cfg.headers = Object.assign({
    timestamp: Date.now(),
    sign: encrypt(cfg.method.toLowerCase() === 'post' || cfg.method.toLowerCase() === 'put' ? cfg.data : cfg.params)
  }, defaults.headers, cfg.headers || {})

  return new Promise(resolve => {
    axios.request(cfg)
      .then(({ data }) => {
        resolve(data)
        if (data.code === 80000000 || Object.prototype.toString.call(data) === '[object Blob]') {
          autoHandleSuccess && defaults.successResponseHandler(data)
        } else {
          autoHandleError && defaults.errorResponseHandler(data)
        }
      })
      .catch(e => {
        resolve(e)
        if (!axios.isCancel(e)) {
          defaults.errorResponseHandler(e)
        }
      })
  })
}

export default {
  defaults,
  request
}
