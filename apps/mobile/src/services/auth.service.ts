// src/api/auth.service.ts
import { LoginResponse, loginResponseSchema, LoginUser, loginUserSchema } from '@chargemap/validations'
import { http } from './http'
import { clearTokens, saveTokens } from './tokenStorage'

export async function login(email: string, password: string): Promise<LoginUser> {
  try {
    const res = await http.post<LoginResponse>('/login', { email, password })

    const parsed = loginResponseSchema.parse(res.data)

    await saveTokens({
      accessToken: res.data.accessToken,
      refreshToken: res.data.refreshToken,
    })

    const parsedUser = loginUserSchema.parse(parsed.user)

    return parsedUser
  } catch (error: any) {
    if (error?.response?.status === 401 && error?.response?.data?.error === 'Credenciais inválidas') {
      throw new Error('Por favor, verifique seu e-mail e senha.')
    }

    if (error?.response?.status === 400 && error.response.data.error.includes('expected string to have >=6 characters')) {
      throw new Error('A senha deve ter pelo menos 6 caracteres.')
    }

    if (error?.response?.status === 400 && error.response.data.error.includes('Invalid email address')) {
      throw new Error('Por favor, insira um e-mail válido.')
    }

    throw new Error(error?.message || 'Erro ao tentar fazer login')
  }
}

export async function logout() {
  try {
    await http.post('/logout')
  } finally {
    await clearTokens()
  }
}
