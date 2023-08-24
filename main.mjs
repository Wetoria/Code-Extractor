import {
  filterMultiLineComment,
  collectLineHasChinese,
  filterBlankRow,
  filterSingleLineComment,
} from './utils/Filters.mjs'

import {
  promiseChainExcutor,
} from './utils/PromiseChain.mjs'

import {
  loadAllFileOfDir,
  readFileListSync,
  recordLineWithChineseIntoLogFile,
  recordLinesAfterFilterMultiLineComment,
  recordLineHasChineseAfterFilter,
  recordResults,
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
} from './utils/index.mjs'
import { getTranslate } from './utils/Translate.mjs'



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
    loadAllFileOfDir,
    // Read all file contents line by line
    readFileListSync,
    checkHasComplexSituation.wrapperPassChainData(),
    // Do not modify above ⬆️ function
    // You can add your custom function in array `executors`,
    // or just below.⬇️
    
    filterMultiLineComment, // 过滤多行注释，否则会开始和结束标记会被过滤掉
    filterBlankRow, // 过滤空行
    filterSingleLineComment,  // 过滤单行注释
    collectLineHasChinese, // 从过滤后的结果中，提取包括中文的行
    extractLines,
    logInTerminal.wrapperPassChainData(), // record
    format.wrapperPassChainData(),
    generateLocaleDataFile.wrapperPassChainData(),
    recordResults.wrapperPassChainData(),

    groupFileLineByFilePath,
    replaceFileContent.wrapperPassChainData(),
    
    // You can add your custom function above ⬆️,
    // or in array `executors`.
    usageHint.wrapperPassChainData(),
    endHint.wrapperPassChainData(),
  ])
}

extractChineseAndReplace()