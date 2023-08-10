import colorize from './Colorize.mjs'
import * as Command from './Command.mjs'

export function excutorWrapper(fn) {
  return (fileLineList) => {
    const breakOffFlag = fn(fileLineList)
    if (breakOffFlag) {
      return false
    }
    return fileLineList
  }
}

export function excutorWrapperWithBreakOff(fn) {
  return (fileLineList) => {
    fn(fileLineList)
    return false
  }
}

export const usageHint = excutorWrapper(() => {
  if (Command.isDebug && Command.isNotDebugingInVSCode) {
    console.log(colorize.yellow(`In order to get better debug experience, Please run script in VS Code\'s Terminal.`));
  } else if (Command.isDebug) {
    console.log(`${colorize.yellow(`Hint:`)} Use ${colorize.cyan(`opt + click`)} on file path, can jump to the specific line, to view code.`);
  }
})

export const start = () => {
    
  let foldPath = Command.getCmdValue('--path')

  if (!foldPath) {
    console.log(colorize.red(`You did not pass a directory path, \nYou should run Code-Extractor with a directory path like ${colorize.yellow(`node index.mjs --path='./src'`)}`))
    return
  }
  console.log(colorize.blue(`=== Code-Extractor is running... ===`));
  return foldPath
}

export const endHint = excutorWrapper(() => {
  console.log(colorize.blue(`=== Code-Extractor is done ===`))
})

export {
  colorize,
}