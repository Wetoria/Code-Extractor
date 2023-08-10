import colorize from './Colorize.mjs'
import * as Command from './Command.mjs'

export let start = () => {
  console.log(colorize.blue(`=== Code-Extractor is running... ===`));
  let foldPath = Command.getCmdValue('--path')

  if (!foldPath) {
    console.log(colorize.red(`You did not pass a directory path, \nYou should run Code-Extractor with a directory path like ${colorize.yellow(`node index.mjs --path='./src'`)}`))
    return
  }
  return foldPath
}


export let usageHint = () => {
  if (Command.isDebug && Command.isNotDebugingInVSCode) {
    console.log(colorize.yellow(`In order to get better debug experience, Please run script in VS Code\'s Terminal.`));
  } else if (Command.isDebug) {
    console.log()
    console.log(`${colorize.yellow(`Hint:`)} Use ${colorize.cyan(`opt + click`)} on file path, can jump to the specific line, to view code.`);
    console.log()
  }
}

export let endHint = () => {
  console.log(colorize.blue(`=== Code-Extractor is done ===`))
}


export {
  colorize,
}