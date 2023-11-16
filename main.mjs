import {
  filterMultiLineComment,
  collectLineHasChinese,
  filterBlankRow,
  filterSingleLineComment,
  i18nContentFilter,
  filterDisabledSingleLine,
} from './utils/Filters.mjs'

import {
  promiseChainExcutor,
} from './utils/PromiseChain.mjs'

import {
  getAllFilePathOfDir,
  readFileListSync,
  recordLineWithChineseIntoLogFile,
  recordLinesAfterFilterMultiLineComment,
  recordLineHasChineseAfterFilter,
  recordResults,
  readJSModule,
  logLineOfResult,
  readFileSyncAndSplitByLine,
  getFileWriter,
} from './utils/FileUtils.mjs'

import {
  usageHint,
  start,
  endHint,
  logInTerminal,
  onlyOneBackQuoteLine,
  checkHasTarget,
  extractLines,
  removeDuplicate,
  format,
  groupFileLineByFilePath,
  replaceFileContent,
  generateLocaleDataFile,
  colorize,
  getI18NLines,
  logInTerminalWithReg,
  extractWithReg,
  checkHasIncorrectKey,
  checkNotSaveInZhCN,
  getZhCNData,
  getEnUSData,
  checkNotTranslatedMessage,
} from './utils/index.mjs'
import { getTranslate } from './utils/Translate.mjs'
import { getCmd, getCmdValue } from './utils/Command.mjs'



// main start

const checkHasComplexSituation = (chainData) => {
  promiseChainExcutor([
    onlyOneBackQuoteLine.wrapperPassChainData(),
    checkHasTarget.wrapperPassChainData(),
  ], chainData)
}


// You can add your custom function in array `executors`.
// All the function in executors will be run in order.
const executors = [
  // recordLineWithChineseIntoLogFile.wrapperPassChainData(), // record - 记录所有的中文行，用来校对
  filterMultiLineComment, // 过滤多行注释，否则会开始和结束标记会被过滤掉
  filterBlankRow, // 过滤空行
  // recordLinesAfterFilterMultiLineComment.wrapperPassChainData(), // record
  filterSingleLineComment,  // 过滤单行注释
  collectLineHasChinese, // 从过滤后的结果中，提取包括中文的行
  // recordLineHasChineseAfterFilter.wrapperPassChainData(), // record
  extractLines,
  logInTerminal.wrapperPassChainData(), // record
  // removeDuplicate,
  // getTranslate.wrapperPassChainData(),
  format.wrapperPassChainData(),
  // recordResults.wrapperPassChainData(),
]

/**
  You will get data like:
  @param:
    foldPath: which directory you want to scan
  @return: [
    {
      filePath: string,
      fullPath: string,
      lineNumber: number,
      value: string,
    },
  ]
  except the data of func loadAllFileOfDir
*/
// const result = await promiseChainExcutor([
//   start,
//   // Get file path list of the directory `foldPath`,
//   // which you passed by --path
//   loadAllFileOfDir,
//   // Read all file contents line by line
//   readFileListSync,
//   checkHasComplexSituation.wrapperPassChainData(),
//   // Do not modify above ⬆️ function
//   // You can add your custom function in array `executors`,
//   // or just below.⬇️
//   ...executors,

//   // You can add your custom function above ⬆️,
//   // or in array `executors`.
//   usageHint.wrapperPassChainData(),
//   endHint.wrapperPassChainData(),
// ])

const extractChineseAndReplace = () => {
  promiseChainExcutor([
    start,
    // Get file path list of the directory `foldPath`,
    // which you passed by --path
    getAllFilePathOfDir,
    // Read all file contents line by line
    readFileListSync,
    checkHasComplexSituation.wrapperPassChainData(),
    // Do not modify above ⬆️ function
    // You can add your custom function in array `executors`,
    // or just below.⬇️
    
    filterMultiLineComment, // 过滤多行注释，否则会开始和结束标记会被过滤掉
    filterBlankRow, // 过滤空行
    filterDisabledSingleLine,
    filterSingleLineComment,  // 过滤单行注释

    i18nContentFilter,
    collectLineHasChinese, // 从过滤后的结果中，提取包括中文的行
    extractLines,
    logInTerminal.wrapperPassChainData(), // record
    format.wrapperPassChainData(),
    generateLocaleDataFile.wrapperPassChainData(),
    // recordResults.wrapperPassChainData(),

    groupFileLineByFilePath,
    replaceFileContent.wrapperPassChainData(),
    
    // You can add your custom function above ⬆️,
    // or in array `executors`.
    usageHint.wrapperPassChainData(),
    endHint.wrapperPassChainData(),
  ])
}

extractChineseAndReplace()

// logLineOfResult(JSON.stringify(readJSON(process.cwd() + '/../atomhub_page_fe/src/i18n/locales/zh-CN.ts'), null, 2))

import fs from 'fs'
import { getI18NReg } from './utils/RegExpUtils.mjs'

// const replaceKeys = () => {
//   promiseChainExcutor([
//     start,
//     loadAllFileOfDir,
//     readFileListSync,
  
//     (fileLineList) => {
//       return fileLineList.filter((fileLine) => {
//         return fileLine.value.includes('AtomIntl.localeData[')
//       })
//     },
//     (fileLineList) => {
//       fileLineList.forEach((fileLine) => {
//         const logLineString = fileLine.value
//           // 单引号字符串
//           .highLight(/AtomIntl.localeData\[.*?\]/g, colorize.colorMap.red)
    
//         console.log(`|${logLineString}| ${colorize.blue(`Line from ${fileLine.filePath}:${fileLine.lineNumber}:${fileLine.colNumber}`)}`)
//         // console.log(`Highlight    |${logLineString}|`)
//       })
    
//       return fileLineList
//     },

//     (fileLineList) => {

//       const reg = /AtomIntl.localeData\[.*?\]/g
//       const results = []
//       fileLineList.forEach((fileLine) => {
//         const matched = fileLine.value.match(reg)
//         if (matched) {
//           matched.forEach((match) => {
//             const colNumber = fileLine.value.indexOf(match.trim())
//             const reg = /\[.*?\]/g
//             results.push({
//               ...fileLine,
//               matched: match.trim(),
//               colNumber: colNumber + 1,
//             })
//           })
//         }
//         return matched
//       })
//       return results;
//     },

//     (fileLineList) => {

//       const foldPath = getCmdValue('--path')

//       const localeDataFilePath = `${foldPath}/i18n/localeData.ts`
//       const localeData = readJSON(localeDataFilePath, true)

//       const zhCNDataFilePath = `${foldPath}/i18n/locales/zh-CN.json`
//       const zhCNData = JSON.parse(fs.readFileSync(zhCNDataFilePath, { encoding: 'utf-8'}))

//       fileLineList.forEach((fileLine) => {
//         console.log('')
//         console.log('')
//         console.log(`${colorize.blue(`Line from ${fileLine.filePath}:${fileLine.lineNumber}:${fileLine.colNumber}`)}`)
//         const reg = /(?<=\[).*(?=\])/g
//         const matched = fileLine.matched.match(reg)
//         const f = matched[0].replaceAll("'", '');
//         console.log(f)
//         const key = localeData[f]
//         console.log(key)
//         const filePathKey = fileLine.filePath.replace(/(?<!(\.|^))\.{1}.*$/g, '').replaceAll(/^.*src(\/)?/g, '').replaceAll('/', '_').replace(/(^\.)|(\.$)/g, '') + '_'
//         console.log(filePathKey);
//         const value = key.replace(filePathKey, '');

//         const newKey = filePathKey + value
//         console.log('newKey is ', newKey)
//         fileLine.readyToReplace = `'${newKey}'`
//       })
//       return fileLineList
//     },
//     recordResults.wrapperPassChainData(),

//     groupFileLineByFilePath,
//     async (fileMap) => {
//       const paths = Object.keys(fileMap)
//       for (let path of paths) {
//         const fileContents = await readFileSyncAndSplitByLine(path)
    
//         const readyLines = fileMap[path]
    
//         readyLines.forEach((lineInfo) => {
//           const {
//             lineNumber,
//           } = lineInfo
    
//           const targetLine = fileContents[lineNumber - 1]
//           targetLine.value = targetLine.value.replace(lineInfo.matched, lineInfo.readyToReplace)
//         })
//         const logger = getFileLogger(path)
//         logger(fileContents.map(i => i.value).join('\n'))
//         logger('\n')
//       }
//     }
//   ])
// }
const replaceKeys = () => {
  promiseChainExcutor([
    start,
    getAllFilePathOfDir,
    readFileListSync,
  
    (fileLineList) => {
      return fileLineList.filter((fileLine) => {
        return fileLine.value.includes('AtomIntl.get(')
      })
    },
    (fileLineList) => {
      fileLineList.forEach((fileLine) => {
        const logLineString = fileLine.value
          // 单引号字符串
          .highLight(/AtomIntl.get\(.*?(('\))|(}\))|(]\)))/g, colorize.colorMap.red)
    
        console.log(`|${logLineString}| ${colorize.blue(`Line from ${fileLine.filePath}:${fileLine.lineNumber}:${fileLine.colNumber}`)}`)
        // console.log(`Highlight    |${logLineString}|`)
      })
    
      return fileLineList
    },

    (fileLineList) => {

      const reg = /AtomIntl.get\(.*?(('\))|(}\))|(]\)))/g
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
      })
      return results;
    },
    recordResults.wrapperPassChainData(),

    (fileLineList) => {

      const foldPath = getCmdValue('--path')


      const zhCNDataFilePath = `${foldPath}/i18n/locales/zh-CN.json`
      const zhCNData = JSON.parse(fs.readFileSync(zhCNDataFilePath, { encoding: 'utf-8'}))

      fileLineList.forEach((fileLine) => {
        const reg = /'.*?'/g
        const matched = fileLine.matched.match(reg)
        const f = matched[0].replaceAll("'", '');
        
        if (!zhCNData[f]) {
          console.log('')
          console.log(`${colorize.blue(`Line from ${fileLine.filePath}:${fileLine.lineNumber}:${fileLine.colNumber}`)}`)
          console.log(f);
          console.log('')
        }
      })
      return fileLineList
    },
  ])
}

// replaceKeys()

// promiseChainExcutor([
//   getI18NLines,
//   extractWithReg(getI18NReg()),
//   // checkHasIncorrectKey,
//   checkNotSaveInZhCN,
//   // logInTerminalWithReg(getI18NReg()),
// ])

// checkNotTranslatedMessage()

