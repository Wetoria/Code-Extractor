import {
  filterMultiLineComment,
  getLineHasChinese,
} from './utils/Filters.mjs'

import {
  promiseChainExcutor,
} from './utils/PromiseChain.mjs'

import {
  loadAllFileOfDir,
  readFileListSync,
  recordLineWithChineseIntoLogFile,
} from './utils/FileUtils.mjs'

import {
  getCmdValue,
} from './utils/Command.mjs'

import {
  usageHint,
  startHint,
  endHint,
  colorize,
} from './utils/index.mjs'



// main start

let foldPath = getCmdValue('--path')

if (!foldPath) {
  foldPath = './src'
  console.log(colorize.yellow(`You did not pass a path, script will running at ${colorize.red('./src')}`))
}

// You can add your custom function in array `excutors`.
// All the function in excutors will be run in order.
const excutors = [
  recordLineWithChineseIntoLogFile, // 记录所有的中文行，用来校对
  filterMultiLineComment, // 过滤多行注释，否则会开始和结束标记会被过滤掉
  getLineHasChinese, // 过滤出需要的行，例如：包含中文的行
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
promiseChainExcutor([
  startHint,
  // Get file path list of the directory `foldPath`,
  // which you passed by --path
  loadAllFileOfDir,
  // Read all file contents line by line
  readFileListSync,
  // Do not modify above ⬆️ function
  // You can add your custom function in array `excutors`,
  // or just below.⬇️

  ...excutors,

  // You can add your custom function above ⬆️,
  // or in array `excutors`.
  usageHint,
  endHint,
], foldPath)