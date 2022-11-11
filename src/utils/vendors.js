import crypto from 'crypto'

function createWindow (url) {
  chrome.windows.create({
    type: 'popup',
    url: url,
    top: 20,
    left: window.screen.width - 391 - 20,
    width: 391,
    height: 639
  })
}

export const purchaseWithMoonPay = (walletAddress) => {
  const k = Buffer.of(...[115, 107, 95, 108, 105, 118, 101, 95, 71, 72, 79, 52, 49, 117, 116, 70, 90, 85, 101, 54, 82, 77, 68, 84, 97, 72, 89, 114, 71, 89, 74, 52, 109, 118, 101, 120, 48, 122, 122, 75])

  const url = new URL('https://buy.moonpay.com/')
  url.search = new URLSearchParams({
    apiKey: 'pk_live_F4eMMsDmvps8xIoUESmGkwQDc5Hal',
    currencyCode: 'sol',
    walletAddress,
    colorCode: '#6E66FA'
  }).toString()

  url.searchParams.set('signature', crypto
    .createHmac('sha256', k.toString())
    .update(url.search)
    .digest('base64')
  )

  createWindow(url.toString())
}

export const purchaseWithRamp = (walletAddress) => {
  const url = new URL(process.env.VUE_APP_RAMP_URL)

  url.search = new URLSearchParams({
    userAddress: walletAddress,
    defaultAsset: 'SOLANA_SOL',
    hostApiKey: process.env.VUE_APP_RAMP_KEY,
    hostAppName: 'Surf',
    hostLogoUrl: 'https://surf.tech/favicon.ico'
  }).toString()

  createWindow(url.toString())
}

export const purchaseWithTransak = (walletAddress) => {
  const url = new URL(process.env.VUE_APP_TRANSAK_URL)

  url.search = new URLSearchParams({
    apiKey: process.env.VUE_APP_TRANSAK_KEY,
    walletAddress,
    defaultCryptoCurrency: 'SOL',
    themeColor: '#6E66FA'
  }).toString()

  createWindow(url.toString())
}
