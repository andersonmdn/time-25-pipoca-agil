// apps\mobile\app\(app)\(tabs)\_layout.tsx
import { Tabs } from 'expo-router'
import { Home, User } from 'lucide-react-native'
import { useTheme } from 'tamagui'

export default function TabsLayout() {
  const theme = useTheme()
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary?.val ?? theme.color?.val,
        tabBarInactiveTintColor: theme.color?.val,
        tabBarStyle: {
          backgroundColor: theme.background?.val,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  )
}
