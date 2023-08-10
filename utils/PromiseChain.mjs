export async function promiseChainExcutor(funcList, initialArgs) {
  let prevResults = initialArgs
  let func = funcList.shift()
  while(func) {
    console.log(`Excuting ${func.name || func.__getName()}`)
    prevResults = await func(prevResults)
    
    // You can break off the chain by retrun false
    if (!prevResults) return
    
    func = funcList.shift()
  }
  return prevResults
}