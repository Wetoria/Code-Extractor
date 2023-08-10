import path from 'path';
import fs from 'fs';
import readline from 'readline';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
let __dirname = dirname(__filename);
__dirname = dirname(__dirname + '../')

const fileSuffix = '.jsx|.js|.tsx'
const excludes = [
  'markdown-editor.js'
]

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  // 防止每次读取的文件顺序不一致
  files.sort();

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

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
export function loadAllFileOfDir(dirPath) {
  const filePaths = getFiles(dirPath);
  // 防止每次读取的文件顺序不一致
  filePaths.sort();
  return filePaths;
}

export async function readFileListSync(filePaths) {
  let result = []
  for (const filePath of filePaths) {
    const temp =  await readFileLineByLine(filePath);
    result.push(...temp)
  }
  return result
}

async function readFileLineByLine(filePath) {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  // 注意：使用 crlfDelay 选项
  // 将 input.txt 中的所有 CR LF ('\r\n') 实例识别为单个换行符。
  const result = []
  let lineNumber = 0;
  for await (const line of rl) {
    lineNumber++;
    result.push({
      filePath,
      fullPath: `${__dirname}/${filePath}`,
      lineNumber,
      value: line
    })
  }
  return Promise.resolve(result)
}


const getFileLogger = (path) => {
  fs.writeFileSync(path, '')
  return (str = '') => {
    fs.appendFileSync(path, str)
  }
}


const lineHasChineseLogger = getFileLogger('./log-1-all-lines-has-chinese.txt')
export function logLineOfLineHasChinese(str = '') {
  lineHasChineseLogger(str + '\n')
}

const debugInfoLogger = getFileLogger('./log-2-all-debug-info.txt')
export function logLineDebugInfo(str = '') {
  debugInfoLogger(str + '\n')
}

import {
  containsChinese,
} from './Filters.mjs'
export function recordLineWithChineseIntoLogFile(fileLineList) {
  fileLineList.forEach((fileLine) => {
    if (containsChinese(fileLine.value)) {
      logLineOfLineHasChinese(`Line from file://${fileLine.fullPath}#${fileLine.lineNumber}`)
      logLineOfLineHasChinese(`Original |${fileLine.value}|`)
      logLineOfLineHasChinese()
    }
  })
  return fileLineList
}





