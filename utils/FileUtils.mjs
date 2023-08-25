import path from 'path';
import fs from 'fs';
import { dirname } from 'path';

const fileSuffix = '.jsx|.js|.tsx|.ts'
const excludes = [
  'markdown-editor.js',
  'localeData.ts',
  'intl.ts',
  'intl.tsx',
]

function readFileSync(filePath) {
  return fs.readFileSync(filePath, { encoding: 'utf-8' })
}

export function readFileSyncAndSplitByLine(filePath) {
  const file = readFileSync(filePath)
  return file.split('\n').map((line, index) => ({
    value: line,
    filePath,
    lineNumber: index + 1,
  }))
}

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  // 防止每次读取的文件顺序不一致
  files.sort();

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (filePath.includes('i18n')) {
      return
    }
    
    if (stat.isDirectory()) {
      getFiles(filePath, fileList); // 如果是目录，再次递归
    } else {
      if (!excludes.includes(file)) {
        const ext = path.extname(file);
        if (ext && fileSuffix.includes(ext)) {
          fileList.push(filePath); // 如果是文件，加入到列表
        }
      }
    }
  });

  return fileList;
}
export function getAllFilePathOfDir(dirPath) {
  const filePaths = getFiles(dirPath);
  // 防止每次读取的文件顺序不一致
  filePaths.sort();
  return filePaths;
}

export function readFileListSync(filePaths) {
  let result = []
  for (const filePath of filePaths) {
    const temp =  readFileSyncAndSplitByLine(filePath);
    result.push(...temp)
  }
  return result
}


export const getFileWriter = (path, clearAll = true) => {
  const dir = dirname(path);
  fs.mkdirSync(dir, { recursive: true })
  if (clearAll) {
    fs.writeFileSync(path, '')
  }
  return (str = '') => {
    fs.appendFileSync(path, str)
  }
}


export const readJSONDataFromFile = (filePath) => {
  return JSON.parse(readFileSync(filePath))
}


export function readJSModule(filePath, flag) {
  const fileContents = fs.readFileSync(filePath, { encoding: 'utf-8'})
  let formatted = fileContents
    .replace(/import.*\n/g, '')
    .replace(/export\s+default\s+{/, '{')
    .replace(/,\s*}/g, '}')
  if (flag) {
    formatted = formatted.replace(/"[^"]+":[\sa-zA-Z]+,{0,1}\n/g, '')
  }
  return JSON.parse(formatted)
}





const lineHasChineseLogger = getFileWriter('./Log/log-1-all-lines-has-chinese.txt')
export function logLineOfLineHasChinese(str = '') {
  lineHasChineseLogger(str + '\n')
}

const debugInfoLogger = getFileWriter('./Log/log-2-all-debug-info.txt')
export function logLineDebugInfo(str = '') {
  debugInfoLogger(str + '\n')
}
const lineHasChineseAfterFilterLogger = getFileWriter('./Log/log-3-lines-has-chinese-after-filter.txt')
export function logLineOfLineHasChineseAfterFilter(str = '') {
  lineHasChineseAfterFilterLogger(str + '\n')
}
export function recordLineHasChineseAfterFilter(fileLineList) {
  fileLineList.forEach((fileLine) => {
    logLineOfLineHasChineseAfterFilter(`Line from file://${fileLine.fullPath}#${fileLine.lineNumber}`)
    logLineOfLineHasChineseAfterFilter(`Line need attention |${fileLine.value}|`)
    logLineOfLineHasChineseAfterFilter()
  })
}

import {
  containsChinese,
} from './RegExpUtils.mjs'
export function recordLineWithChineseIntoLogFile(fileLineList) {
  fileLineList.forEach((fileLine) => {
    if (containsChinese(fileLine.value)) {
      logLineOfLineHasChinese(`Line from file://${fileLine.fullPath}#${fileLine.lineNumber}`)
      logLineOfLineHasChinese(`Original |${fileLine.value}|`)
      logLineOfLineHasChinese()
    }
  })
}

export const recordLinesAfterFilterMultiLineComment = (fileLineList) => {
  logLineDebugInfo()
  logLineDebugInfo(`========== recordLinesAfterFilterMultiLineComment start ==========`)
  fileLineList.forEach((fileLine) => {
    logLineDebugInfo(`Line from file://${fileLine.fullPath}#${fileLine.lineNumber}`)
    logLineDebugInfo(`Original |${fileLine.value}|`)
    logLineDebugInfo()
  })
  logLineDebugInfo(`========== recordLinesAfterFilterMultiLineComment end ==========`)
  logLineDebugInfo()
}

const resultsLogger = getFileWriter('./Log/log-4-result.txt')
export function logLineOfResult(str = '') {
  resultsLogger(str + '\n')
}
export function recordResults(fileLineList) {
  fileLineList.forEach((fileLine) => {
    logLineOfResult(JSON.stringify(fileLine) + ', ')
  })
}