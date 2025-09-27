// src/auth/tokenStorage.ts
import * as SecureStore from 'expo-secure-store'

const ACCESS_KEY = 'accessToken'
const REFRESH_KEY = 'refreshToken'

export type AuthTokens = { accessToken: string; refreshToken: string }

// Storage wrapper
const isWeb = typeof window !== 'undefined' && !!window.localStorage

const storage = {
  async setItem(key: string, value: string) {
    if (isWeb) {
      window.localStorage.setItem(key, value)
    } else {
      await SecureStore.setItemAsync(key, value)
    }
  },
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      return window.localStorage.getItem(key)
    } else {
      return await SecureStore.getItemAsync(key)
    }
  },
  async deleteItem(key: string) {
    if (isWeb) {
      window.localStorage.removeItem(key)
    } else {
      await SecureStore.deleteItemAsync(key)
    }
  },
}

export async function saveTokens(tokens: AuthTokens) {
  await storage.setItem(ACCESS_KEY, tokens.accessToken)
  await storage.setItem(REFRESH_KEY, tokens.refreshToken)
}

export async function getTokens(): Promise<AuthTokens | null> {
  const accessToken = await storage.getItem(ACCESS_KEY)
  const refreshToken = await storage.getItem(REFRESH_KEY)
  if (!accessToken || !refreshToken) return null
  return { accessToken, refreshToken }
}

export async function clearTokens() {
  await storage.deleteItem(ACCESS_KEY)
  await storage.deleteItem(REFRESH_KEY)
}
