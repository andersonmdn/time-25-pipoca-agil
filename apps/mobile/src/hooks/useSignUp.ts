import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { registerUser } from '../services/users.service'

export function useSignUp() {
  const [email, setEmail] = useState('Exemplo@gmail.com')
  const [password, setPassword] = useState('SenhaSegura123!')
  const [name, setName] = useState('Exemplo de Usuário')
  const [phone, setPhone] = useState('1234567890')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email])
  const passwordValid = useMemo(() => password.length >= 6, [password])
  const nameValid = useMemo(() => name.trim().length > 1, [name])

  const signUp = async () => {
    setError(null)
    if (!emailValid) {
      setError('Por favor, insira um e-mail válido.')
      return
    }
    if (!passwordValid) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (!nameValid) {
      setError('O nome é obrigatório. Deve ter pelo menos 2 caracteres.')
      return
    }
    try {
      setLoading(true)
      await registerUser({ email, password, name, phone, role: 'user' })

      router.replace('/sign-in')
    } catch (e: any) {
      setError(e.message || 'Erro ao registrar')
    } finally {
      setLoading(false)
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    phone,
    setPhone,
    loading,
    error,
    emailValid,
    passwordValid,
    nameValid,
    signUp,
    router,
  }
}
