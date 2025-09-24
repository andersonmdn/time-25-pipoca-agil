// app/(app)/users/_layout.tsx
import { Stack } from 'expo-router'

export default function UsersLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitle: 'Usuários',
      }}
    />
  )
}
