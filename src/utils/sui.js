import { isSuiMoveObject } from '@mysten/sui.js'

const COIN_TYPE = '0x2::coin::Coin'
const COIN_TYPE_ARG_REGEX = /^0x2::coin::Coin<(.+)>$/
export const DEFAULT_GAS_BUDGET_FOR_PAY = 150
export const DEFAULT_GAS_BUDGET_FOR_TRANSFER_SUI = 100

export function isCoin (obj) {
  return isSuiMoveObject(obj.data) && obj.data.type.startsWith(COIN_TYPE)
}

export function getCoinSymbol (coinTypeArg) {
  return coinTypeArg.substring(coinTypeArg.lastIndexOf(':') + 1)
}

export function getBalance (obj) {
  return obj.fields.balance
}

export function getCoinTypeArg (obj) {
  const res = obj.type.match(COIN_TYPE_ARG_REGEX)
  // console.log(res ? res[1] : null)
  return res ? res[1] : null
}

export function isSUI (obj) {
  const arg = getCoinTypeArg(obj)
  return arg ? getCoinSymbol(arg) === 'SUI' : false
}

export function getID (obj) {
  return obj.fields.id.id
}

export function computeGasCostForPay (numInputCoins) {
  // TODO: improve the gas budget estimation
  return (
    DEFAULT_GAS_BUDGET_FOR_PAY *
        Math.max(2, Math.min(100, numInputCoins / 2))
  )
}

export function sortByBalance (coins) {
  return coins.sort((a, b) =>
    a.balance < b.balance
      ? -1
      : a.balance > b.balance
        ? 1
        : 0
  )
}

export function selectCoinsWithBalanceGreaterThanOrEqual (coins, amount, exclude = []) {
  return sortByBalance(
    coins.filter(
      (c) => c.balance >= amount
    )
  )
}
