import {
  colorize,
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


function PassChainDataWrapper(fn) {
  let key = `${fn.name} with PassChainDataWrapper`
  const obj = {
    [key]: (fileLineList) => {
      fn(fileLineList)
      return fileLineList
    }
  }
  return obj[key]
}

function BreakOffChainWrapper(fn) {
  let key = `${fn.name} with BreakOffChainWrapper`
  const obj = {
    [key]: (fileLineList) => {
      fn(fileLineList)
      return false
    }
  }
  return obj[key]
}

Function.prototype.wrapperPassChainData = function() {
  return PassChainDataWrapper(this)
}

Function.prototype.wrapperBreakOffChain = function (arr) {
  return BreakOffChainWrapper(this)
}