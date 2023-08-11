import colorize from './Colorize.mjs'
import * as Command from './Command.mjs'

import {
  promiseChainExcutor,
} from './PromiseChain.mjs'

export function getNamedFunction(key, fn = () => {}) {
  const coloredKey = `${key}`
  const obj = {
    [coloredKey]: (...args) => {
      return fn(...args)
    }
  }
  return obj[coloredKey]
}

export let start = () => {
  let foldPath = Command.getCmdValue('--path')

  if (!foldPath) {
    console.log(colorize.red(`You did not pass a directory path, \nYou should run Code-Extractor with a directory path like ${colorize.yellow(`node index.mjs --path='./src'`)}`))
    return
  }
  return foldPath
}


export let usageHint = () => {
  if (Command.isDebug) {
    console.log()
    if (Command.isNotDebugingInVSCode) {
      console.log(colorize.yellow(`In order to get better debug experience, Please run script in VS Code\'s Terminal.`));
    } else {
      console.log(`${colorize.yellow(`Hint:`)} Use ${colorize.cyan(`opt + click`)} on file path, can jump to the specific line, to view code.`);
    }
    console.log()
  }
}

export let endHint = () => {
  console.log(colorize.green(`=== Code-Extractor is done ===`))
}

export function logInTerminal(fileLineList) {
  if (!Command.isDebug) {
    return
  }
  fileLineList.forEach((fileLine) => {
    const logLineString = fileLine.value
      // 单引号字符串
      .highLight(/('(([^'})]|\\')*[\u4e00-\u9fa5]+([^']|\\')*)')|("(([^"})]|\\")*[\u4e00-\u9fa5]+([^"]|\\")*)")|(`(([^`]|\\`)*[\u4e00-\u9fa5]+([^`]|\\`)*)`)|(((?<=(>\s*))([^{}<]*[\u4e00-\u9fa5]+[^{}<]*)(?=(\s*<))))|(((?<=(}\s*))([^<>{}]*[\u4e00-\u9fa5]+[^<>{}]*)(?=(\s*<))))|(((?<=(>\s*))([^<{]*[\u4e00-\u9fa5]+[^<{]*)(?=(\s*{))))|(((?<=(}\s*))([^><'"`}]*[\u4e00-\u9fa5]+[^><'"`"}]*)(?=(\s*{))))|(((?<=(^\s*))([^<}{>'"`]*[\u4e00-\u9fa5]+[^<{}]*)(?=(\s*(<|{|$)))))|(((?<=((>|})\s*))([^<>{}'"`]*[\u4e00-\u9fa5]+[^<>{}'"`]*)(?=$)))/g, colorize.colorMap.red)

    console.log(`|${logLineString}| ${colorize.blue(`Line from ${fileLine.filePath}:${fileLine.lineNumber}:${fileLine.colIndex}`)}`)
    // console.log(`Highlight    |${logLineString}|`)
  })

  return fileLineList
}

function getChecker({
  reg,
  condition = (arr) => arr && arr.length,
  prompt = () => {},
  endPrompt = () => {},
  checkerName,
}) {
  
  let key = `Check ${reg}`
  return getNamedFunction(checkerName || key, (fileLineList) => {
    let flag = false
    fileLineList.forEach((i) => {
      const num = i.value.match(reg)
      if (condition(num)) {
        if (!flag) {
          flag = true
        }
        prompt(i)
      }
    })
    endPrompt(flag)
  })
}

function getCheckerPromptOfFileInfo(fileLine) {
  return `\n${colorize.yellow(`Line is:`)} ${fileLine.value} |\n${colorize.yellow(`   from:`)} ${colorize.blue(`${fileLine.filePath}:${fileLine.lineNumber}\n`)}`
}


export const onlyOneBackQuoteLine = getChecker({
  checkerName: colorize.cyan('has only one back quoto line'),
  reg: /`/g,
  condition: (arr) => arr && arr.length && arr.length === 1,
  prompt: (i) => console.log(`${colorize.yellow(`Warning: `)} You have line only contains ${colorize.yellow(`1 back quote(\`)`)} ${getCheckerPromptOfFileInfo(i)}`),
  endPrompt: (executed) => {
    if (executed) {
      console.log(colorize.yellow(`This script will not extract multi line string of back quote(\`).`))
      console.log(colorize.yellow(`You should handle it by yourself.\n`))
    }
  }
})

export const checkHasTarget = getChecker({
  checkerName: colorize.cyan(`has \\' or \\" in line`),
  reg: /(\\')|(\\")/g,
  prompt: (i) => {
    console.log(`${colorize.yellow(`Warning: `)} You write string with ${colorize.yellow(`\\'`)} and ${colorize.yellow(`\\"`)} ${getCheckerPromptOfFileInfo(i)}`)
  },
  endPrompt: () => {
    console.log(colorize.yellow(`You must be careful of the results above. To ensure the final extract results is correctly.\n`))
  }
})



export const extractLines = (fileLineList) => {
  let reg = /('(([^'})]|\\')*[\u4e00-\u9fa5]+([^']|\\')*)')|("(([^"})]|\\")*[\u4e00-\u9fa5]+([^"]|\\")*)")|(`(([^`]|\\`)*[\u4e00-\u9fa5]+([^`]|\\`)*)`)|(((?<=(>\s*))([^{}<]*[\u4e00-\u9fa5]+[^{}<]*)(?=(\s*<))))|(((?<=(}\s*))([^<>{}]*[\u4e00-\u9fa5]+[^<>{}]*)(?=(\s*<))))|(((?<=(>\s*))([^<{]*[\u4e00-\u9fa5]+[^<{]*)(?=(\s*{))))|(((?<=(}\s*))([^><'"`}]*[\u4e00-\u9fa5]+[^><'"`"}]*)(?=(\s*{))))|(((?<=(^\s*))([^<}{>'"`]*[\u4e00-\u9fa5]+[^<{}]*)(?=(\s*(<|{|$)))))|(((?<=((>|})\s*))([^<>{}'"`]*[\u4e00-\u9fa5]+[^<>{}'"`]*)(?=$)))/g
  let backQuoteReg = /(`(([^`]|\\`)*[\u4e00-\u9fa5]+([^`]|\\`)*)`)/g
  const results = []
  fileLineList.forEach((fileLine) => {
    const matched = fileLine.value.match(reg)
    if (matched) {
      matched.forEach((match) => {
        const colIndex = fileLine.value.indexOf(match.trim())
        results.push({
          ...fileLine,
          value: match.trim(),
          colIndex: colIndex + 1,
        })
      })
    }
    return matched
  })
  return results
}

export {
  colorize,
}