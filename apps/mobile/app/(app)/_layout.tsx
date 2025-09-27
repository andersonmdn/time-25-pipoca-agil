// app/(app)/_layout.tsx
import { Slot, useRouter } from 'expo-router'
import { useEffect } from 'react'
// import { useAuth } from '@/hooks/useAuth';

export default function AppLayout() {
  const router = useRouter()
  // const { user, loading } = useAuth();
  const loading = false
  const user = { id: 'demo' } // simulação

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/sign-in') // redireciona para área pública
    }
  }, [loading, user, router])

  if (loading) return null // ou uma Splash/Loader

  return <Slot /> // renderiza filhos (tabs, users, etc.)
}

// // apps/mobile/app/(tabs)/_layout.tsx
// import { House, User } from '@tamagui/lucide-icons'
// import { Tabs } from 'expo-router'
// import { useTheme } from 'tamagui'

// export default function TabsLayout() {
//   const theme = useTheme()
//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarActiveTintColor: theme.primary?.val,
//         tabBarInactiveTintColor: theme.color?.val,
//         tabBarShowLabel: true,
//         tabBarLabelStyle: {
//           fontSize: 12,
//           marginBottom: 6,
//         },
//         tabBarStyle: {
//           backgroundColor: theme.background?.val,
//           borderTopColor: theme.color?.val,
//           borderTopWidth: 1,
//           height: 100,
//         },
//         tabBarHideOnKeyboard: true,
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Início',
//           tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
//         }}
//       />
//       <Tabs.Screen
//         name="login"
//         options={{
//           title: 'Login',
//           tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
//         }}
//       />
//     </Tabs>
//   )
// }
