import { registerWallet } from '@mysten/wallet-standard'
import { WalletStandardInterface } from '@/utils/wallet-standard-Interface'

class DAppInterface {
  static #responseHandlers = new Map()
  static #requestCount = 0

  constructor () {
    this.#listenResponse()
  }

  #listener (ev) {
    const { id, code, message, data } = ev.detail || {}
    const { resolve, reject } = DAppInterface.#responseHandlers.get(id) || {}
    DAppInterface.#responseHandlers.delete(id)

    if (code === 200) {
      typeof resolve === 'function' && resolve(data)
    } else {
      const rp = {}
      if (code) rp.code = code
      if (data) rp.data = data
      if (message) rp.message = message || 'Unknown error'
      typeof reject === 'function' && reject(rp)
    }
  }

  // eslint-disable-next-line no-dupe-class-members
  #listenResponse () {
    window.removeEventListener('SURF_RESPONSE', this.#listener)
    window.addEventListener('SURF_RESPONSE', this.#listener)
  }

  // eslint-disable-next-line no-dupe-class-members
  #saveHandler (handler) {
    DAppInterface.#requestCount++
    const id = `${DAppInterface.#requestCount}_${Date.now()}`
    DAppInterface.#responseHandlers.set(id, handler)
    return id
  }

  // eslint-disable-next-line no-dupe-class-members
  #request (method, params) {
    return new Promise((resolve, reject) => {
      const id = this.#saveHandler({ resolve, reject })

      window.dispatchEvent(new CustomEvent('SURF_REQUEST', {
        detail: {
          id,
          method,
          params
        }
      }))
    })
  }

  /**
   * @returns {Promise<boolean>}
   */
  hasPermissions () {
    return this.#request('HAS_PERMISSIONS')
  }

  /**
   * @returns {Promise<boolean>}
   */
  requestPermissions () {
    return this.#request('REQUEST_PERMISSIONS')
  }

  /**
   * @returns {Promise<string[]>}
   */
  getAccounts () {
    return this.#request('GET_ACCOUNTS')
  }

  /**
   * @param {MoveCallTransaction} tx
   */
  executeMoveCall (tx) {
    return this.#request('EXECUTE_MOVECALL', tx)
  }

  /**
   * @param {string|Uint8Array} tx
   */
  executeSerializedMoveCall (tx) {
    return this.#request('EXECUTE_SERIALIZED_MOVECALL', tx)
  }

  signAndExecuteTransaction (tx) {
    return this.#request('SIGN_AND_EXECUTE_TRANSACTION', tx)
  }
}

const api = new DAppInterface()

try {
  registerWallet(new WalletStandardInterface(api))
} catch {}

Object.defineProperty(window, 'sui', {
  enumerable: false,
  configurable: false,
  value: api
})
