import {
  isDebug,
} from './Command.mjs'

export const colorMap = {
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  purple: 35,
  cyan: 36,
  white: 37,
  reset: 0,
  // - 红色：\x1b[31m
  // - 绿色：\x1b[32m
  // - 黄色：\x1b[33m
  // - 蓝色：\x1b[34m
  // - 紫色：\x1b[35m
  // - 青色：\x1b[36m
  // - 白色：\x1b[37m
  // - 重置颜色：\x1b[0m
};

export const logInTerminal = (...args) => {
  if (isDebug) {
    console.log(...args)
  }
}

export const getColoredStr = (str, color = colorMap.white) => {
  return `\x1b[${color}m${str.replace(/\x1b\[\d+m([\s\S]*?)\x1b\[0m/g, (match) => `\x1b[0m${match}\x1b[${color}m`)}\x1b[0m`
}

const colorize = {}

Object.keys(colorMap).forEach((color) => {
  colorize[color] = (str = '') => {
    if (!str) return ''
    return getColoredStr(str, colorMap[color])
  }
})

export default colorize