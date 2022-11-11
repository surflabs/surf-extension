// import BigNumber from 'bignumber.js'
// import bip39 from 'bip39-light'
// import nacl from 'tweetnacl'
import { Ed25519Keypair } from '@mysten/sui.js'

// import { backgroundStorage as bgStorage, bs58ToUsualObject } from '@/utils/common'

// const BIG_TEN = new BigNumber(10)
// const BN = BigNumber.clone({ ROUNDING_MODE: 1, DECIMAL_PLACES: 9 })

export function generateKeypair (monmonic) {
  try {
    const keyPair = Ed25519Keypair.deriveKeypair(monmonic)
    const address = keyPair.getPublicKey().toSuiAddress()
    const secretKey = Buffer.from(keyPair.keypair.secretKey).toString('hex')
    return {
      address: '0x' + address,
      secretKey
    }
  } catch (err) {
    console.log(err)
    return undefined
  }
}

export function generateKeypairFromPrivateKey (privateKey) {
  try {
    const _secretKey = Buffer.from(privateKey, 'hex')
    const keyPair = Ed25519Keypair.fromSecretKey(_secretKey)
    const address = keyPair.getPublicKey().toSuiAddress()
    const secretKey = Buffer.from(keyPair.keypair.secretKey).toString('hex')
    return {
      address: '0x' + address,
      secretKey
    }
  } catch (err) {
    console.log(err)
    return undefined
  }
}
