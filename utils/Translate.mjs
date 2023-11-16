import crypto from 'crypto'
import https from 'https'
import config from '../config.mjs'

let appid = config.baiduTranslate.appid
let key = config.baiduTranslate.key
let salt = '123456'

export function translateRequest(str, from = 'zh', to = 'en') {
  if (!str) return
  const hash = crypto.createHash('md5');
  let sign = hash.update(`${appid}${str}${salt}${key}`).digest('hex')

  return new Promise((res, rej) => {
    const url = `https://fanyi-api.baidu.com/api/trans/vip/translate?q=${encodeURIComponent(str)}&from=${from}&to=${to}&salt=${salt}&appid=${appid}&sign=${sign}`
    https.get(url, (response) => {
      let todo = '';

      response.on('data', (chunk) => {
        todo += chunk;
      });

      response.on('end', () => {
        const temp = JSON.parse(todo);
        const {
          trans_result,
        } = temp
        trans_result.forEach((item) => {
          item.from = temp.from
          item.to = temp.to
        })
        // console.log(temp)
        res(trans_result)
      });
    }).on("error", (error) => {
      console.log("Get Translate Error: " + error.message);
      rej("Get Translate Error: " + error.message)
    });
  })
}

export async function batchGetTranslate(readyList, from, to) {
  const params = []
  let oldStr = ''
  readyList.forEach((item) => {
    const newStr = oldStr + item.formatted + '\n'
    if (newStr.length > 2000) {
      params.push(oldStr.replace(/\n$/g, ''))
      oldStr = ''
    } else {
      oldStr = newStr
    }
  })
  params.push(oldStr.replace(/\n$/g, ''))
  const result = []
  for (let item of params) {
    const resp = await translateRequest(item, from, to)
    result.push(...resp)
  }
  return result
}

export async function getTranslate(readyList, from, to) {
  for (let item of readyList) {
    const resp = await translateRequest(item.formatted, from, to)
    const translated = resp[0]
    item[translated.from] = translated.dst
  }
}