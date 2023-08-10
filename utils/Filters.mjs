import {
  logLineDebugInfo
} from './FileUtils.mjs'

let containsChineseRegStr = '[\u4e00-\u9fa5]'

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

export function containsChinese(str) {
  const regex = new RegExp(containsChineseRegStr, 'g');
  return regex.test(str);
}

export function getLineHasChinese(fileLineList) {
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
export const filterMultiLineComment = baseFilter(multiLineCommentFilter)
