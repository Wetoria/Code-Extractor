import {
  logLineDebugInfo
} from './FileUtils.mjs'
import {
  containsChinese,
} from './RegExpUtils.mjs'

function baseFilter(fn) {
  return (fileLineList) => {
    logLineDebugInfo()
    logLineDebugInfo(`========== ${fn.name} start ==========`)
    const result = fn(fileLineList)
    logLineDebugInfo(`========== ${fn.name} end ==========`)
    logLineDebugInfo()
    return result
  }
}


export function collectLineHasChinese(fileLineList) {
  return fileLineList.filter((fileLine) => containsChinese(fileLine.value))
}

let isMultiLineCommentsFlag = false;
function isMultiLineComments(str) {
  // If the comments of your file is correct.
  // These rules will work correctly.
  // If it is missing some comment rule,
  // add it by yourself or open a pull request.
  const commentStartFlagReg = /(\{\/\*)|(\/\*\*)|(\/\*)|(<!--)/;
  const commentEndFlagReg = /(\*\/\})|(\*\/)|(-->)/;
  logLineDebugInfo(`Multi judge | isStartFlag: ${commentStartFlagReg.test(str)} isEndFlag: ${commentEndFlagReg.test(str)} string: ${str}`)
  if (commentStartFlagReg.test(str)) {
    isMultiLineCommentsFlag = true
  }
  logLineDebugInfo(`Is multi line comment|${isMultiLineCommentsFlag}`)
  if (commentEndFlagReg.test(str)) {
    isMultiLineCommentsFlag = false
    return true
  }
  if (isMultiLineCommentsFlag) {
    return true
  }
}

function multiLineCommentFilter(fileLineList) {
  return fileLineList.filter((fileLine) => {
    logLineDebugInfo()
    if (isMultiLineComments(fileLine.value)) {
      return false
    }
    logLineDebugInfo(`After Multi line judge |${fileLine.value}|`)
    return true
  })
}
export function filterMultiLineComment(...args) {
  return baseFilter(multiLineCommentFilter)(...args)
}

export function filterDisabledSingleLine(fileLineList) {
  return fileLineList.filter((fileLine) => {
    return !fileLine.value.includes('// disable-extract-line')
  })
}

function removeI18NContent(str) {
  return str
    .replace(/AtomIntl.get\([^\)]*?\)/g, '')
}

export function i18nContentFilter(fileLineList) {
  return fileLineList.filter((fileLine) => {
    fileLine.value = removeI18NContent(fileLine.value)
    return fileLine.value
  })
}

function removeSingleLineComment(str = '') {
  return str
    // 过滤行内注释。ex： expression // comment 形式的注释
    .replace(/(?<=(\s+|;|^|:))\/\/.*$/g, '')
    // /* */ 格式
    .replace(/\/\*.*?\*\//g, '')
    // 过滤 JSX 单行注释
    .replace(/{\/\*.*?\*\/}$/g, '')
    // TODO html、CSS 注释或者其他
}
function singleLineCommentFilter(fileLineList) {
  return fileLineList.filter((fileLine) => {
    fileLine.value = removeSingleLineComment(fileLine.value)
    return fileLine.value
  })
}
export const filterSingleLineComment = (...args) => {
  return singleLineCommentFilter(...args)
  // return baseFilter(singleLineCommentFilter)(...args)
}

function blackRowFilter(fileLineList) {
  return fileLineList.filter((fileLine) => {
    return fileLine.value.trim()
  })
}
export function filterBlankRow(...args) {
  return baseFilter(blackRowFilter)(...args)
}
