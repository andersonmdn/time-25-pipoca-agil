import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { TamaguiProvider, Theme } from 'tamagui'
import config from '../tamagui.config'

import PlusJakartaSans from '../assets/fonts/PlusJakartaSans-VariableFont_wght.ttf'

// Adicionar imports para área segura
import { View } from 'react-native' // Importar View
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export default function RootLayout() {
  const [loaded] = useFonts({
    PlusJakartaSans,
  })

  const theme = 'brandDark'

  if (!loaded) {
    // Async font loading only occurs in development.
    return null
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#282736' }}>
      {' '}
      {/* Background ao redor de todo o app */}
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#282736' }} edges={['top', 'bottom']}>
          <TamaguiProvider config={config}>
            <Theme name={theme}>
              <Stack screenOptions={{ headerShown: false }}></Stack>
              <StatusBar style="dark" />
            </Theme>
          </TamaguiProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </View>
  )
}
