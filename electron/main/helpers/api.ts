import axios from 'axios'
import Setting from './setting'
import sleep from "./sleep";
import {writeLog} from "./log";

let axiosApiInstance: any
;(async () => {
  axiosApiInstance = axios.create({
    baseURL: 'https://4d996w6zk9.execute-api.ap-southeast-1.amazonaws.com/production/v1/', //Production
    // baseURL: 'https://0gs2mokc40.execute-api.ap-southeast-1.amazonaws.com/dev/v1/', //Dev
    timeout: 60000,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await Setting.get('ID_TOKEN'))
    }
  })

  axiosApiInstance.interceptors.response.use(
    (response: any) => {
      return response
    },
    async function (error: any) {
      const originalRequest = error.config
      if (error.response.status === 401 && !originalRequest._retry) {
        writeLog("token is expired")
        originalRequest._retry = true
        await refreshAccessToken()
        delete originalRequest.headers['Authorization']

        return axiosApiInstance(originalRequest)
      }
      return Promise.reject(error)
    }
  )
})()

const getInstance = async () => {
  while (axiosApiInstance === undefined) {
    await sleep(100)
  }
  return axiosApiInstance
}

const refreshAccessToken = async () => {
  writeLog("refreshAccessToken start", "api")
  const res = await apiPost('auth/refresh-token', {
    refreshToken: await Setting.get('REFRESH_TOKEN')
  })
  if (res.error) {
    writeLog("refreshAccessToken FAIL", "api")
    writeLog(JSON.stringify(res), "api")
    return;
  }
  writeLog("refreshAccessToken success", "api")
  await Setting.set({
    ACCESS_TOKEN: res.result.AuthenticationResult.AccessToken,
    ID_TOKEN: res.result.AuthenticationResult.IdToken
  })

  axiosApiInstance.interceptors.request.use(async (config: any) => {
    config.headers = {
      Authorization: `Bearer ${res.result.AuthenticationResult.IdToken}`,
      'Content-Type': 'application/json'
    }
    return config
  })
}

const apiGet = async (action: string, data: object = {}) => {
  try {
    writeLog("request " + action, 'GET')
    const instance = await getInstance()
    return (
      await instance.get(action, {
        params: data
      })
    ).data
  } catch (e: any) {
    writeLog(e, 'apiGet')
    return {
      ...e?.response?.data,
      ...(e?.response?.status === 401 ? { token: false } : undefined),
      error: true
    }
  }
}

const apiPost = async (action: string, data: object = {}) => {
  try {
    writeLog("request " + action, 'POST')
    const instance = await getInstance()
    return (
        await instance.post(action, data)).data
  } catch (e: any) {
    writeLog(e, 'apiPost')
    return {
      ...e?.response?.data,
      ...(e?.response?.status === 401 ? { token: false } : undefined),
      error: true
    }
  }
}

const apiPut = async (action: string, data: object = {}) => {
  try {
    writeLog("request " + action, 'PUT')
    const instance = await getInstance()
    return (
        await instance.put(action, data)).data
  } catch (e: any) {
    writeLog(e, 'apiPut')
    return {
      ...e?.response?.data,
      ...(e?.response?.status === 401 ? { token: false } : undefined),
      error: true
    }
  }
}

const apiPatch = async (action: string, data: object = {}) => {
  try {
    const instance = await getInstance()
    return (
        await instance.patch(action, data)).data
  } catch (e: any) {
    writeLog(e, 'apiPatch')
    return {
      ...e?.response?.data,
      ...(e?.response?.status === 401 ? { token: false } : undefined),
      error: true
    }
  }
}

const apiDel = async (action: string, data: object = {}) => {
  try {
    const instance = await getInstance()
    return (
        await instance.patch(action, data)).data
  } catch (e: any) {
    writeLog(e, 'apiDel')
    return {
      ...e?.response?.data,
      ...(e?.response?.status === 401 ? { token: false } : undefined),
      error: true
    }
  }
}

export { apiPost, apiGet, apiDel, apiPatch, apiPut }
