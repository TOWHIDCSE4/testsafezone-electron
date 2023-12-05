import mockttp from 'mockttp'
import { activityWebBlock, isBlock } from '../helpers/web-filter'
import { writeLog } from '../helpers/log';
import { checkProxyEnable, proxyDisable, proxyEnable } from '../helpers/proxy';
import { TIME_CHECK_PROXY } from '../const/interval-const';

console.log('Init Proxy Server...')

let isPause = false
let isLockNavigation = false;
const pathCACert = process.argv[2]

process.on('message', function (message: any) {
  try {
    writeLog(`onMessage ${message}`, "proxy")
    switch (message) {
      case "pause":
        isPause = true
        proxyDisable()
        break
      case "resume":
        isPause = false
        proxyEnable()
        break
      case "proxy-lock-navigation":
        isLockNavigation = true
        break
      case "proxy-unlock-navigation":
        isLockNavigation = false
        break
      default:
        break;
    }
    writeLog(`isLockNavigation ${isLockNavigation}`, "proxy")

  } catch (e) {}
})

const pageBlockContent = `<html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <title>For your safety this page has been restricted</title> <style type="text/css"> html, body{margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden;}</style> </head> <body> <iframe id="iframeId" src="https://admin.safezone.com.vn/page_block?domain={block_domain}" width="100%" height="100%" frameborder="0" scrolling="auto" ></iframe> </body></html>`
const pageBlockNavigation = `<html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <title>For your safety this page has been restricted</title> <style type="text/css"> html, body{margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden;}</style> </head> <body> <iframe id="iframeId" src="https://admin.safezone.com.vn/limit_internet" width="100%" height="100%" frameborder="0" scrolling="auto" ></iframe> </body></html>`

;(async () => {
  const server = mockttp.getLocal({
    https: {
      keyPath: `${pathCACert}/ca/key.pem`,
      certPath: `${pathCACert}/ca/crt.pem`
    }
  })

  await server.forAnyWebSocket().thenPassThrough()
  await server.forAnyRequest().thenPassThrough({
    beforeRequest: async (req: any): Promise<any> => {
      try {

        if (
          !isPause &&
          req.method === 'GET' &&
          req.headers['sec-fetch-dest'] === 'document'
          
        ) {
          writeLog(`check request ${req.headers.host}, isLockNavigation: ${isLockNavigation}`, "proxy")
          if (isLockNavigation) {
            writeLog(`lock navigation ${req.headers.host}`, "proxy")
            return {
              response: {
                statusCode: 403,
                headers: {
                  'content-type': 'text/html'
                },
                body: pageBlockNavigation
              }
            } 
          }

          const isBlockDomain = await isBlock(req.headers.host)
          setTimeout(() => {
            try {
              activityWebBlock(req.headers.host, isBlockDomain)
            } catch (e) {}
          }, 1)

          if (isBlockDomain) {
            return {
              response: {
                statusCode: 403,
                headers: {
                  'content-type': 'text/html'
                },
                body: pageBlockContent.replace('{block_domain}', req.headers.host)
              }
            }
          }
        }
      } catch (e) {}
    }
  })
  await server.start()
  console.log(`Proxy Server running on port ${server.port}`)
})()


setInterval(() => {
  if (isPause) {
    return
  }
  const isEnabled = checkProxyEnable()
  if (!isEnabled) {
    writeLog("proxy need re enabled")
    proxyEnable()
  }
}, TIME_CHECK_PROXY)