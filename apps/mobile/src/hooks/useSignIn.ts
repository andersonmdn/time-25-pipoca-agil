import { useMemo, useState } from 'react'
// import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'

export function useSignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data?.error == 'Credenciais inválidas') {
          setError('Por favor, verifique seu e-mail e senha.')
        } else {
          setError(`Não foi possível entrar. Tente novamente. (${data?.error})`)
        }
        return
      }
      // await AsyncStorage.setItem('accessToken', data.accessToken)
      // router.push('/alguma-rota')
    } catch (e: any) {
      setError(`Não foi possível entrar. Tente novamente. (${e?.message})`)
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
