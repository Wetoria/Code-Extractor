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
      .highLight(/('(([^'})]|\\')*[\u4e00-\u9fa5]+([^']|\\')*)')|("(([^"})]|\\")*[\u4e00-\u9fa5]+([^"]|\\")*)")|(`(([^`]|\\`)*[\u4e00-\u9fa5]+([^`]|\\`)*)`)|(((?<=(>\s*))([^{}<]*[\u4e00-\u9fa5]+[^{}<]*)(?=(\s*<))))|(((?<=(}\s*))([^<>{}]*[\u4e00-\u9fa5]+[^<>{}]*)(?=(\s*<))))|(((?<=((>\s*)))([^<{}]*[\u4e00-\u9fa5]+[^<{}]*)(?=(\s*{))))|(((?<=(}\s*))([^><'"`}]*[\u4e00-\u9fa5]+[^><'"`"}]*)(?=(\s*{))))|(((?<=(^\s*))([^<}{>'"`]*[\u4e00-\u9fa5]+[^<{}]*)(?=(\s*(<|{|$)))))|(((?<=((>|})\s*))([^<>{}'"`]*[\u4e00-\u9fa5]+[^<>{}'"`]*)(?=$)))/g, colorize.colorMap.red)

    console.log(`|${logLineString}| ${colorize.blue(`Line from ${fileLine.filePath}:${fileLine.lineNumber}:${fileLine.colNumber}`)}`)
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
  let reg = /('(([^'})]|\\')*[\u4e00-\u9fa5]+([^']|\\')*)')|("(([^"})]|\\")*[\u4e00-\u9fa5]+([^"]|\\")*)")|(`(([^`]|\\`)*[\u4e00-\u9fa5]+([^`]|\\`)*)`)|(((?<=(>\s*))([^{}<]*[\u4e00-\u9fa5]+[^{}<]*)(?=(\s*<))))|(((?<=(}\s*))([^<>{}]*[\u4e00-\u9fa5]+[^<>{}]*)(?=(\s*<))))|(((?<=((>\s*)))([^<{}]*[\u4e00-\u9fa5]+[^<{}]*)(?=(\s*{))))|(((?<=(}\s*))([^><'"`}]*[\u4e00-\u9fa5]+[^><'"`"}]*)(?=(\s*{))))|(((?<=(^\s*))([^<}{>'"`]*[\u4e00-\u9fa5]+[^<{}]*)(?=(\s*(<|{|$)))))|(((?<=((>|})\s*))([^<>{}'"`]*[\u4e00-\u9fa5]+[^<>{}'"`]*)(?=$)))/g
  let backQuoteReg = /(`(([^`]|\\`)*[\u4e00-\u9fa5]+([^`]|\\`)*)`)/g
  const results = []
  fileLineList.forEach((fileLine) => {
    const matched = fileLine.value.match(reg)
    if (matched) {
      matched.forEach((match) => {
        const colNumber = fileLine.value.indexOf(match.trim())
        results.push({
          ...fileLine,
          matched: match.trim(),
          colNumber: colNumber + 1,
        })
      })
    }
    return matched
  })
  return results
}

export const removeDuplicate = (fileLineList) => {
  const map = new Map()
  const results = []
  const regToRemoveQuote = /(^('|"))|(('|")$)/g
  fileLineList.forEach((fileLine) => {
    const lineValue = fileLine.value.replace(regToRemoveQuote, '').trim()
    fileLine.value = lineValue
    const len = lineValue.length
    if (map.has(len)) {
      const temp = map.get(len)
      const notExist = !temp.find(i => i.value.replace(regToRemoveQuote, '').trim() === lineValue)
      if (notExist) {
        temp.push(fileLine)
        results.push(fileLine)
      }
    } else {
      let temp = []
      map.set(len, temp)
      results.push(fileLine)
      temp.push(fileLine)
    }
  })
  console.log('After removed, lines is ', results.length)
  return results
}

export const format = (fileLineList) => {
  let reg = /('(([^'})]|\\')*[\u4e00-\u9fa5]+([^']|\\')*)')|("(([^"})]|\\")*[\u4e00-\u9fa5]+([^"]|\\")*)")|(`(([^`]|\\`)*[\u4e00-\u9fa5]+([^`]|\\`)*)`)|(((?<=(>\s*))([^{}<]*[\u4e00-\u9fa5]+[^{}<]*)(?=(\s*<))))|(((?<=(}\s*))([^<>{}]*[\u4e00-\u9fa5]+[^<>{}]*)(?=(\s*<))))|(((?<=(>\s*))([^<{}]*[\u4e00-\u9fa5]+[^<{}]*)(?=(\s*{))))|(((?<=(}\s*))([^><'"`{}]*[\u4e00-\u9fa5]+[^><'"`"{}]*)(?=(\s*{))))|(((?<=(^\s*))([^<}{>'"`]*[\u4e00-\u9fa5]+[^<{}]*)(?=(\s*(<|{|$)))))|(((?<=((>|})\s*))([^<>{}'"`]*[\u4e00-\u9fa5]+[^<>{}'"`]*)(?=$)))/g
  let backVarReg = /\${[^{}]*}/g
  let keyIndex = 0
  const keyMap = {}
  fileLineList.forEach((fileLine) => {
    if (backVarReg.test(fileLine.matched)) {
      fileLine.isBackQuoteString = true
      let index = 0;
      let strInBackQuote = []
      let isObjectParam = false
      let lockMatchRule = false
      fileLine.formatted = fileLine.matched.replace(backVarReg, (stringInBackQuote) => {
        strInBackQuote.push(`${stringInBackQuote.replace(/\$|{|}/g, '')}`)
        const reg = /(?<=(\${))[a-zA-Z0-9_]*(?=})/g
        const matched = stringInBackQuote.match(reg)
        if (!lockMatchRule && matched) {
          isObjectParam = true
          return `{${matched[0]}}`
        }
        lockMatchRule = true;
        return `{${index++}}`
      }).replace(/'|"|`/g, '').trim()
      const temp = strInBackQuote.join(', ')
      fileLine.template = isObjectParam ? `{${temp}}` : `[${temp}]`
    } else {
      if (fileLine.matched.includes('\'')) {
        fileLine.isSingleQutoString = true
      }
      if (fileLine.matched.includes('\"')) {
        fileLine.isDoubleQutoString = true
      }
      fileLine.formatted = fileLine.matched.replace(/'|"|`/g, '').trim()
    }
    const readyChineseKey = fileLine.formatted
    if (keyMap[readyChineseKey]) {
      fileLine.chineseKey = readyChineseKey + (++keyIndex);
      keyMap[fileLine.chineseKey] = true;
    } else {
      fileLine.chineseKey = readyChineseKey;
      keyMap[fileLine.chineseKey] = true;
    }
    fileLine.key = fileLine.filePath.replace(/(?<!(\.|^))\.{1}.*$/g, '').replaceAll(/^.*src(\/)?/g, '@/').replaceAll('/', '.').replace(/(^\.)|(\.$)/g, '')
    const isString = fileLine.isSingleQutoString || fileLine.isBackQuoteString || fileLine.isDoubleQutoString
    fileLine.isString = isString
    const formatedStr = `AtomIntl.localeData['${fileLine.chineseKey}']`
    const params = fileLine.template ? `, ${fileLine.template}` : ''
    const stringWithFunc = `AtomIntl.get(${formatedStr}${params})`
    fileLine.readyToReplace = fileLine.isSingleQutoString || fileLine.isBackQuoteString ? stringWithFunc : `{${stringWithFunc}}`
  })
}

import {
  getFileLogger,
} from './FileUtils.mjs'
export const groupFileLineByFilePath = (fileLineList) => {

  const map = {}
  fileLineList.forEach((fileLine, index) => {
    let target = map[fileLine.filePath]
    if (!target) {
      target = map[fileLine.filePath] = []
    }
    target.push(fileLine)
  })

  const logger = getFileLogger('./Log/log-result.txt')
  logger(JSON.stringify(map, null, 2))
  return map
}

import {
  readFileLineByLine,
} from './FileUtils.mjs'
export const replaceFileContent = async (fileMap) => {
  const paths = Object.keys(fileMap)
  for (let path of paths) {
    const fileContents = await readFileLineByLine(path)

    const readyLines = fileMap[path]

    readyLines.forEach((lineInfo) => {
      const {
        lineNumber,
      } = lineInfo

      const targetLine = fileContents[lineNumber - 1]
      targetLine.value = targetLine.value.replace(lineInfo.matched, lineInfo.readyToReplace)
    })
    const logger = getFileLogger(path)
    const foldPath = Command.getCmdValue('--path')
    const basePath = `${foldPath.replace(/^.*src(\/)?/g, '@/')}`
    const localeDataFilePath = `${basePath}/i18n/localeData.ts`
    logger(`import AtomIntl from '@/utils/intl.tsx';\n`)
    logger(fileContents.map(i => i.value).join('\n'))
    logger('\n')
  }
}

function generateZhLocaleData(fileLineList) {
  const result = {}
  fileLineList.forEach((fileLine) => {
    const key = fileLine.key + '.' + fileLine.formatted
    let str = fileLine.formatted
    result[key] = str
  })
  return result
}

async function generateEnUSLocaleData(fileLineList) {
  const result = {}
  const translated = await batchGetTranslate(fileLineList)
  fileLineList.forEach((fileLine) => {
    const target = translated.find(i => i.src.trim() == fileLine.formatted.trim())
    const key = fileLine.key + '.' + fileLine.formatted
    result[key] = target ? target.dst : ''
  })
  return result
}


import {
  batchGetTranslate,
} from './Translate.mjs'
export const generateLocaleDataFile = async (fileLineList) => {
  const result = {}
  fileLineList.forEach((fileLine) => {
    result[fileLine.chineseKey] = fileLine.key + '.' + fileLine.formatted
  })
  const foldPath = Command.getCmdValue('--path')
  const localeDataFilePath = `${foldPath}/i18n/localeData.ts`

  const zhCNData = generateZhLocaleData(fileLineList)
  const zhCNDataFilePath = `${foldPath}/i18n/locales/zh-CN.ts`
  const zhCNLogger = getFileLogger(zhCNDataFilePath)
  zhCNLogger(`export default ${JSON.stringify(zhCNData, null, 2)}`)
  result['zh-CN'] = 'zhCN'


  const enUSData = await generateEnUSLocaleData(fileLineList)
  const enUSDataFilePath = `${foldPath}/i18n/locales/en-US.ts`
  const enUSLogger = getFileLogger(enUSDataFilePath)
  enUSLogger(`export default ${JSON.stringify(enUSData, null, 2)}`)
  result['en-US'] = 'enUS'


  const logger = getFileLogger(localeDataFilePath)
  logger(`import enUS from './locales/en-US'\nimport zhCN from './locales/zh-CN'\n`)
  logger(`export default ${JSON.stringify(result, null, 2).replace('"enUS"', 'enUS').replace('"zhCN"', 'zhCN')}`)

  const csvFilePath = `${foldPath}/i18n/localeData.csv`
  const csvLogger = getFileLogger(csvFilePath)
  csvLogger(`中文内容	英文翻译结果（校对时，只需要确认并修改该列）	在文件中调用的key	实际上获取结果的key\n`)
  csvLogger(`${fileLineList.map(fileLine => `${zhCNData[fileLine.key + '.' + fileLine.formatted]}	${enUSData[fileLine.key + '.' + fileLine.formatted]}	${fileLine.chineseKey}	${fileLine.key + '.' + fileLine.formatted}`).join('\n')}`)
}

export {
  colorize,
}