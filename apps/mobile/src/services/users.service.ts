import { UserCreate, userCreateSchema } from '@chargemap/validations'
import { http } from './http'

export async function registerUser(data: UserCreate) {
  userCreateSchema.parse(data)
  try {
    const res = await http.post('/register', data)
    return res.data
  } catch (error: any) {
    if (error?.response?.status === 409) {
      throw new Error('Email já registrado')
    }

    if (error?.response?.status === 400 || error.response.data.error.includes('expected string to have >=2 characters')) {
      throw new Error('O nome deve ter pelo menos 2 caracteres.')
    }

    if (error?.response?.status === 400 || error.response.data.error.includes('expected string, received undefined')) {
      if (error.response.data.error.includes('at name')) throw new Error('O nome é obrigatório.')
      if (error.response.data.error.includes('at email')) throw new Error('O e-mail é obrigatório.')
      if (error.response.data.error.includes('at password')) throw new Error('A senha é obrigatória.')
    }

    if (error?.response?.data?.error) {
      throw new Error(error.response.data.error)
    }
    throw new Error('Erro ao registrar usuário')
  }
}
