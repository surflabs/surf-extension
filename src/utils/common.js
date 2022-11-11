import Vue from 'vue'
import { AES, MD5, enc } from 'crypto-js'
import bs58 from 'bs58'
import np from './number-precision'
import BigNumber from 'bignumber.js'

export const chromeStorage = {
  get (keys) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(keys, rp => {
        const err = chrome.runtime.lastError
        if (err) {
          Vue.prototype.$toast({
            message: err.message || err,
            duration: 3000
          })
          reject(err)
        } else {
          resolve(rp)
        }
      })
    })
  },
  set (data) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(data, () => {
        const err = chrome.runtime.lastError
        if (err) {
          Vue.prototype.$toast({
            message: err.message || err,
            duration: 3000
          })
          reject(err)
        } else {
          resolve(true)
        }
      })
    })
  },
  remove (keys) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(keys, () => {
        const err = chrome.runtime.lastError
        if (err) {
          Vue.prototype.$toast({
            message: err.message || err,
            duration: 3000
          })
          reject(err)
        } else {
          resolve(true)
        }
      })
    })
  },
  clear () {
    return new Promise((resolve, reject) => {
      chrome.storage.local.clear(() => {
        const err = chrome.runtime.lastError
        if (err) {
          Vue.prototype.$toast({
            message: err.message || err,
            duration: 3000
          })
          reject(err)
        } else {
          resolve(true)
        }
      })
    })
  }
}

export const backgroundStorage = {
  get (key) {
    return new Promise((resolve, reject) => {
      Vue.prototype.$sendMessage({
        channel: 'GET_STORAGE',
        key
      }, rp => {
        const err = chrome.runtime.lastError
        if (err) {
          Vue.prototype.$toast({
            message: err.message || err,
            duration: 3000
          })
          reject(err)
        } else {
          resolve(rp)
        }
      })
    })
  },
  set (key, value) {
    return new Promise((resolve, reject) => {
      Vue.prototype.$sendMessage({
        channel: 'SET_STORAGE',
        key,
        value
      }, () => {
        const err = chrome.runtime.lastError
        if (err) {
          Vue.prototype.$toast({
            message: err.message || err,
            duration: 3000
          })
          reject(err)
        } else {
          resolve(true)
        }
      })
    })
  },
  remove (key) {
    return new Promise((resolve, reject) => {
      Vue.prototype.$sendMessage({
        channel: 'REMOVE_STORAGE',
        key
      }, () => {
        const err = chrome.runtime.lastError
        if (err) {
          Vue.prototype.$toast({
            message: err.message || err,
            duration: 3000
          })
          reject(err)
        } else {
          resolve(true)
        }
      })
    })
  },
  clear () {
    return new Promise((resolve, reject) => {
      Vue.prototype.$sendMessage({
        channel: 'CLEAR_STORAGE'
      }, () => {
        const err = chrome.runtime.lastError
        if (err) {
          Vue.prototype.$toast({
            message: err.message || err,
            duration: 3000
          })
          reject(err)
        } else {
          resolve(true)
        }
      })
    })
  }
}

export const numberFormat = (
  number,
  style = 'currency',
  radio = 4,
  useGrouping = true
) => {
  if (style === 'currency') {
    const fmt = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      useGrouping
    })
    return fmt.format(number)
  } else {
    const fmt = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: radio,
      maximumFractionDigits: radio,
      useGrouping
    })
    return fmt.format(number)
  }
}

export const bnNumberFormat = (balance, radio = 9, mode = 4, isDivided = false, decimals = 8) => {
  if (np.isNum(balance)) {
    const BN = BigNumber.clone({ ROUNDING_MODE: mode, DECIMAL_PLACES: radio })

    const result = !isDivided ? new BN(balance).div(1) : new BN(balance).dividedBy(new BN(10).pow(decimals)) || new BN(0)

    return result.toFormat()
  } else {
    return balance
  }
}

/**
 * @param {object} objdata
 */
export const bufferTobs58Encode = (objdata) => {
  return bs58.encode(Buffer.from(JSON.stringify(objdata)))
}

export const bs58ToUsualObject = (string) => {
  if (!string) {
    return string
  }
  return JSON.parse(Buffer.from(bs58.decode(string)).toString())
}

export const log = (...rest) => {
  if (process.env.VUE_APP_LOG === '1') {
    console.log(...rest)
  }
}

export const aesEncrypt = (message) => {
  const key = enc.Latin1.parse('duHpTs0IfaK4du6M')
  const v = MD5(Date.now().toString()).toString().substr(8, 16)
  const iv = enc.Latin1.parse(v)
  return {
    k: AES.encrypt(message, key, { iv }).toString(),
    v
  }
}

export const aesEncrypt2 = (message, scrkey) => {
  const encrypted = AES.encrypt(message, scrkey)
  return encrypted.toString()
}

export const aesDecrypt2 = (ciphertext, scrkey) => {
  try {
    const decrypted = AES.decrypt(ciphertext, scrkey)
    return decrypted.toString(enc.Utf8)
  } catch (error) {
    return null
  }
}

const getWrappingKey = async (salt, phrase) => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    phrase,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 2048000,
      hash: 'SHA-512'
    },
    keyMaterial,
    { name: 'AES-KW', length: 256 },
    false,
    ['wrapKey', 'unwrapKey']
  )
}

const wrapCryptoKey = async (keyToWrap, phrase) => {
  const salt = crypto.getRandomValues(new Uint8Array(32))
  const wrappingKey = await getWrappingKey(salt, phrase)
  const wrappedKey = await crypto.subtle.wrapKey(
    'raw',
    keyToWrap,
    wrappingKey,
    'AES-KW'
  )

  return {
    wrappedKey,
    salt
  }
}

const unwrapCryptoKey = async (wrappedKey, salt, phrase) => {
  const unwrappingKey = await getWrappingKey(salt, phrase)

  return crypto.subtle.unwrapKey(
    'raw',
    wrappedKey,
    unwrappingKey,
    'AES-KW',
    'AES-GCM',
    false,
    ['encrypt', 'decrypt']
  )
}

export const aesEncrypt3 = async (message, phrase) => {
  const msgAsBytes = Buffer.from(message)
  const phraseAsBytes = Buffer.from(phrase)
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  )
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      additionalData: phraseAsBytes
    },
    key,
    msgAsBytes
  )
  const { wrappedKey, salt } = await wrapCryptoKey(key, phraseAsBytes)

  return {
    d: Buffer.from(ciphertext).toString('base64'),
    i: Buffer.from(iv).toString('base64'),
    k: Buffer.from(wrappedKey).toString('base64'),
    s: Buffer.from(salt).toString('base64')
  }
}

export const aesDecrypt3 = async (ciphertext, phrase) => {
  try {
    const { d, i, k, s } = ciphertext
    const phraseAsBytes = Buffer.from(phrase)

    const key = await unwrapCryptoKey(
      Buffer.from(k, 'base64'),
      Buffer.from(s, 'base64'),
      phraseAsBytes
    )
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: Buffer.from(i, 'base64'),
        additionalData: phraseAsBytes
      },
      key,
      Buffer.from(d, 'base64')
    )
    const plaintext = Buffer.from(decrypted).toString()

    return plaintext
    //
  } catch (error) {
    return null
  }
}

export const sleep = (time) => {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}
