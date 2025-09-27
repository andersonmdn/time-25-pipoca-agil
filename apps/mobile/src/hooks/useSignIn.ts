import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { login } from '../services/auth.service'

export function useSignIn() {
  const [email, setEmail] = useState('novo.usuario@example.com')
  const [password, setPassword] = useState('SenhaSegura123!')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email])

  const signIn = async () => {
    setError(null)
    if (!emailValid) {
      setError('Por favor, insira um e-mail válido.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    try {
      setLoading(true)
      await login(email, password)
      // router.push('/alguma-rota')
    } catch (e: any) {
      setError(e.message || 'Erro ao tentar fazer login.')
    } finally {
      setLoading(false)
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    error,
    emailValid,
    signIn,
    router,
    rememberMe,
    setRememberMe,
  }
}
