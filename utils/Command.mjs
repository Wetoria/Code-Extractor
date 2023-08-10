const args = process.argv.slice(2);

export const isDebug = args.includes('--debug');

export const isLog = args.includes('--log');

export const filterComment = args.includes('--filterComment');

export const isDebugingInVSCode = process.env.TERM_PROGRAM === 'vscode';
export const isNotDebugingInVSCode = !isDebugingInVSCode;

export const getCmd = (argName) => {
  const targetArgStr = args.find(i => i.startsWith(argName))
  if (targetArgStr) {
    const [key, value] = targetArgStr.split('=')
    return [key, value]
  }
  return []
}

export const getCmdValue = (argName) => {
  return getCmd(argName)[1]
}