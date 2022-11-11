export const getWalletInfo = ({ walletAddress }) => {
  return {
    method: 'post',
    url: '/verify/getWalletInfo',
    data: {
      walletAddress
    }
  }
}

export const verifyCode = ({ code, walletAddress }) => {
  return {
    method: 'post',
    url: '/verify/verifyCode',
    data: {
      code, walletAddress
    }
  }
}

export const airDrop = ({ FixedAmountRequest }) => {
  return {
    baseURL: process.env.VUE_APP_API_ENDPOINT_DEV_NET_FAUCET,
    method: 'post',
    url: '/gas',
    data: {
      FixedAmountRequest
    }
  }
}
