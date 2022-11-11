import bs58 from 'bs58'
import nacl from 'tweetnacl'

export function createSignature (method, data, scrKey) {
  let results

  try {
    const k = bs58.decode(scrKey)

    if (method === 'SIGN_TRANSACTION') {
      const m = bs58.decode(data.message)
      results = bs58.encode(nacl.sign.detached(m, k))
    } else if (method === 'SIGN_ALL_TRANSACTIONS') {
      const m = data.messages.map((m) => bs58.decode(m))
      results = m.map(x => bs58.encode(nacl.sign.detached(x, k)))
    } else if (method === 'SIGN_MESSAGE') {
      const m = new Uint8Array(Object.keys(data.message).length)

      for (const [index, value] of Object.entries(data.message)) {
        m[index] = value
      }
      results = bs58.encode(nacl.sign.detached(m, k))
    }
  } catch (err) {
    console.error(err)
  }

  return results
}
