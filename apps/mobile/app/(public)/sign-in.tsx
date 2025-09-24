// app/(public)/sign-in.tsx
import { useRouter } from 'expo-router'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
// import { useAuth } from '@/hooks/useAuth';

export default function SignIn() {
  const router = useRouter()
  // const { signIn, loading } = useAuth();
  const loading = false

  const handleSignIn = async () => {
    try {
      // await signIn();
      router.replace('/home') // grupos não entram na URL
    } catch (e) {
      console.warn('Falha no login', e)
    }
  }

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 12 }}>Entrar</Text>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <TouchableOpacity
          onPress={handleSignIn}
          style={{
            paddingVertical: 12,
            borderRadius: 8,
            backgroundColor: '#111827',
          }}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Continuar</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
