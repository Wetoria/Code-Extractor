import colorize from './Colorize.mjs'
import * as Command from './Command.mjs'

export function excutorWrapper(fn) {
  return (fileLineList) => {
    const result = fn(fileLineList)
    if (result) {
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

export const startHint = excutorWrapper(() => {
  console.log(colorize.blue(`=== Code-Extractor is running... ===`));
})

export const endHint = excutorWrapper(() => {
  console.log(colorize.blue(`=== Code-Extractor is done ===`))
})

export {
  colorize,
}