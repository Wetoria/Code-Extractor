import {
  promiseChainExcutor,
} from './utils/PromiseChain.mjs'

const testFunc1 = () => {
  return Promise.resolve(1)
}
const testFunc2 = () => {
  return Promise.resolve(3)
}

promiseChainExcutor([
  testFunc1,
  testFunc2,
])