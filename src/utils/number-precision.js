import np from 'number-precision'

np.isNum = function (num) {
  const n = Number(num)
  try {
    const r = !(typeof n !== 'number' || isNaN(n) || (num.trim && num.trim() === ''))
    return r
  } catch (e) {
    return false
  }
}

/**
 * np.round(-4.465, 2) => -4.47, not -4.46
 */
const _round = np.round
np.round = function (num, radio) {
  if (np.isNum(num)) {
    if (num >= 0) {
      return _round(num, radio)
    } else {
      return np.times(_round(Math.abs(num), radio), -1)
    }
  } else {
    return num
  }
}

np.roundToStr = function (num, radio) {
  return np.round(num, radio).toFixed(radio)
}

export default np
