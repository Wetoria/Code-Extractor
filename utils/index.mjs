import colorize from './Colorize.mjs'
import * as Command from './Command.mjs'

export let start = () => {
  console.log(colorize.green(`=== Code-Extractor is running... ===`));
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
      .highLight(/'([^']|(\\'))*[\u4e00-\u9fa5]+([^']|(\\'))*'/g, colorize.colorMap.purple)
      // 双引号字符串
      .highLight(/"([^"]|(\\"))*[\u4e00-\u9fa5]+([^"]|(\\"))*"/g, colorize.colorMap.purple)
      // 反引号单行字符串
      .highLight(/`([^`]|(\\`))*[\u4e00-\u9fa5]+([^`]|(\\`))*`/g, colorize.colorMap.purple)
      // 反引号多行开始行

      // 反引号多行结束行
      .highLight(/(?<=(\s*))([^`])*[\u4e00-\u9fa5]+([^`])*`/g, colorize.colorMap.purple)
      // 当行文字
      .highLight(/(?<=(\s*))([^><'"`])*[\u4e00-\u9fa5]+([^><'"`])*(?=(\s*(<|{|$)))/g, colorize.colorMap.purple);

    console.log(`Line from ${fileLine.filePath}:${fileLine.lineNumber}`)
    console.log(`Highlight    |${logLineString}|`)
  })

  return fileLineList
}

export {
  colorize,
}