// src/api/http.ts
import axios from 'axios'
import { getTokens } from './tokenStorage'

const BASE_URL = 'http://localhost:3000'

export const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
})

// Evita loop de refresh
let isRefreshing = false
let pendingQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: any) => void
}> = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  pendingQueue.push({
    resolve: (token?: unknown) => cb(token as string),
    reject: () => {},
  })
}

function onRefreshed(newAccess: string) {
  pendingQueue.forEach((p) => p.resolve(newAccess))
  pendingQueue = []
}

function flushQueueError(err: any) {
  pendingQueue.forEach((p) => p.reject(err))
  pendingQueue = []
}

// Anexa Authorization com accessToken
http.interceptors.request.use(async (config) => {
  const tokens = await getTokens()
  if (tokens?.accessToken) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${tokens.accessToken}`
  }
  return config
})

// // Intercepta 401 e tenta refresh
// http.interceptors.response.use(
//   (res) => res,
//   async (error: AxiosError) => {
//     const original = error.config as AxiosRequestConfig & { _retry?: boolean }
//     const status = error.response?.status

//     // Se não for 401, propaga erro
//     if (status !== 401 || original?._retry) {
//       return Promise.reject(formatError(error))
//     }

//     original._retry = true

//     // Refresh em progresso? Fila para repetir depois
//     if (isRefreshing) {
//       return new Promise((resolve, reject) => {
//         subscribeTokenRefresh((newAccess) => {
//           if (!original.headers) original.headers = {}
//           original.headers.Authorization = `Bearer ${newAccess}`
//           resolve(http(original))
//         })
//       })
//     }

//     // Inicia refresh
//     isRefreshing = true
//     try {
//       const tokens = await getTokens()
//       if (!tokens?.refreshToken) throw new Error('Sem refresh token')

//       // Use uma instância “crua” para não cair nos interceptors
//       const raw = axios.create({ baseURL: BASE_URL })
//       const { data } = await raw.post<{
//         accessToken: string
//         refreshToken?: string
//       }>('/refresh', { refreshToken: tokens.refreshToken })

//       const newAccess = data.accessToken
//       const newRefresh = data.refreshToken ?? tokens.refreshToken
//       await saveTokens({ accessToken: newAccess, refreshToken: newRefresh })

//       onRefreshed(newAccess)
//       // Refaz a request original com o novo token
//       if (!original.headers) original.headers = {}
//       original.headers.Authorization = `Bearer ${newAccess}`
//       return http(original)
//     } catch (e) {
//       flushQueueError(e)
//       await clearTokens() // forçar logout
//       return Promise.reject(formatError(e))
//     } finally {
//       isRefreshing = false
//     }
//   },
// )

// Normaliza mensagens de erro
function formatError(e: any) {
  if (axios.isAxiosError(e)) {
    const status = e.response?.status
    const message = (e.response?.data as any)?.message ?? e.message ?? 'Falha de comunicação. Tente novamente.'
    return { status, message }
  }
  return { status: undefined, message: String(e) }
}
