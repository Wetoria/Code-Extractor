const containsChineseRegStr = '[\u4e00-\u9fa5]'
const singleQuoteStringContentStr = '([^\']|(\\\'))'
export const singleQuoteContentContainsChineseStr = `(${singleQuoteStringContentStr})*${containsChineseRegStr}+(${singleQuoteStringContentStr})*`

export function containsChinese(str) {
  const regex = new RegExp(containsChineseRegStr, 'g');
  return regex.test(str);
}

export function getI18NReg() {
  return /AtomIntl.get\(.*?(('\))|(}\))|(]\)))/g
}

export function getSingleQuoteReg() {
  return /'.*?'/g
}