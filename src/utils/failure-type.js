export const ProviderFailureType = {
  suspended: {
    code: 4000,
    message: 'Surf is suspended, please refresh the page and try again.'
  },
  userRejectedRequest: {
    code: 4001,
    message: 'The user rejected the request.'
  },
  unauthorized: {
    code: 4100,
    message: 'The requested method and/or account has not been authorized by the user.'
  },
  unsupportedMethod: {
    code: 4200,
    message: 'The Provider does not support the requested method.'
  },
  disconnected: {
    code: 4900,
    message: 'The Provider is disconnected from all chains.'
  },
  chainDisconnected: {
    code: 4901,
    message: 'The Provider is not connected to the requested chain.'
  },
  chainMismatch: {
    code: 4902,
    message: 'Please switch to the other chain and try again.'
  },
  notSecure: {
    message: 'Your access source is not secure!'
  }
}

export const BASE_FEE_PER_GAS_RATE = '1.4'
