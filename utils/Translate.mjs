import crypto from 'crypto'
const hash = crypto.createHash('md5');
import https from 'https'

let appid = ''
let key = ''
let salt = '123456'

export function translateRequest(str, from = 'en', to = 'zh') {
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

export async function getTranslate(readyList, from, to) {
  const params = []
  let oldStr = ''
  readyList.forEach((item) => {
    const newStr = oldStr + item.value + '\n'
    if (newStr.length> 6000) {
      params.push(oldStr.replace(/\n$/g, ''))
      oldStr = ''
    }
    oldStr = newStr
  })
  params.push(oldStr.replace(/\n$/g, ''))
  const result = []
  for (let item of params) {
    const resp = await translateRequest(item, from, to)
    result.push(resp)
  }
  return result
}