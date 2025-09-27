// app/+not-found.tsx
import { Link } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'

export default function NotFound() {
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Página não encontrada</Text>
      <Text style={{ color: '#6b7280' }}>Verifique a URL ou volte para a Home.</Text>

      <Link href="/home" asChild>
        <TouchableOpacity
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: '#111827',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Ir para Home</Text>
        </TouchableOpacity>
      </Link>
    </View>
  )
}
