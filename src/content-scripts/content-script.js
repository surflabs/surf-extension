import { ProviderFailureType } from '@/utils/failure-type'
const container = document.head || document.documentElement
const ndScript = document.createElement('script')
ndScript.setAttribute('async', 'false')
ndScript.src = chrome.runtime.getURL('js/inpage-script.js')
container.insertBefore(ndScript, container.children[0])
container.removeChild(ndScript)

/**
 * @param {'sui'} fromChain sui
 */
const expand = (ev, fromChain = 'sui') => {
  return Object.assign(ev.detail || {}, {
    channel: 'CONTENT_SCRIPT',
    fromChain
  })
}

// eslint-disable-next-line no-unused-vars
// const port = chrome.runtime.connect({
//   name: 'CONTENT_SCRIPT_PORT'
// })

window.addEventListener('SURF_REQUEST', ev => {
  try {
    chrome.runtime.sendMessage(expand(ev), rp => {
      window.dispatchEvent(new CustomEvent('SURF_RESPONSE', { detail: rp }))
    })
  } catch (err) {
    window.dispatchEvent(new CustomEvent('SURF_RESPONSE', {
      detail: {
        id: ev.detail?.id,
        code: ProviderFailureType.suspended.code,
        message: ProviderFailureType.suspended.message
      }
    }))
  }
})
