import {
  colorize,
  getNamedFunction,
} from './index.mjs'

export async function promiseChainExcutor(funcList, initialArgs) {
  let prevResults = initialArgs
  let func = funcList.shift()
  while(func) {
    console.log(`${colorize.blue('Excuting')} ${func.name} ...`)
    prevResults = await func(prevResults)
    
    // You can break off the chain by retrun false
    if (!prevResults) return
    
    func = funcList.shift()
  }
  return prevResults
}


Function.prototype.wrapperPassChainData = function() {
  return getNamedFunction(`${this.name} with PassChainDataWrapper`, (fileLineList) => {
    this(fileLineList)
    return fileLineList
  })
}

Function.prototype.wrapperBreakOffChain = function (arr) {
  return getNamedFunction(`${this.name} with BreakOffChainWrapper`, (fileLineList) => {
    this(fileLineList)
    return false
  })
}