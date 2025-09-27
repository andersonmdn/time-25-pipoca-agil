// apps/mobile/tamagui.config.ts
import { config as defaultConfig } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'

const appConfig = createTamagui({
  ...defaultConfig,
  themes: {
    ...defaultConfig.themes,
    brandDark: {
      ...defaultConfig.themes.dark,
      color: '#f8f8f2', // Dracula foreground
      background: '#282a36', // Dracula background
      primary: '#bd93f9', // Dracula purple
      accent: '#ff79c6', // Dracula pink
      success: '#50fa7b', // Dracula green
      warning: '#ffb86c', // Dracula orange
      info: '#8be9fd', // Dracula cyan
      danger: '#ff5555', // Dracula red
      border: '#44475a', // Dracula selection
      backgroundTransparent: 'rgba(40, 42, 54, 0.7)', // Transparente para card

      // Botão
      buttonPrimaryBackground: '#bd93f9',
      buttonPrimaryColor: '#282a36',
      buttonSecondaryBackground: '#44475a',
      buttonSecondaryColor: '#f8f8f2',
      buttonDangerBackground: '#ff5555',
      buttonDangerColor: '#f8f8f2',
      buttonSuccessBackground: '#50fa7b',
      buttonSuccessColor: '#282a36',
      buttonBorderRadius: 8,
    },
    brandLight: {
      ...defaultConfig.themes.light,
      color: '#282a36', // Inverte para texto escuro
      background: '#f8f8f2', // Dracula foreground como fundo claro
      primary: '#bd93f9',
      accent: '#ff79c6',
      success: '#50fa7b',
      warning: '#ffb86c',
      info: '#8be9fd',
      danger: '#ff5555',
      border: '#6272a4', // Dracula comment
      backgroundTransparent: 'rgba(248, 248, 242, 0.7)', // Transparente para card

      // Cores para Card
      cardBackground: '#fff', // cor de fundo do card
      cardBorder: '#e2e2e2', // cor da borda do card

      // Botão
      buttonPrimaryBackground: '#bd93f9',
      buttonPrimaryColor: '#f8f8f2',
      buttonSecondaryBackground: '#e2e2e2',
      buttonSecondaryColor: '#282a36',
      buttonDangerBackground: '#ff5555',
      buttonDangerColor: '#f8f8f2',
      buttonSuccessBackground: '#50fa7b',
      buttonSuccessColor: '#282a36',
      buttonBorderRadius: 8,
    },
  },
})

export type AppConfig = typeof appConfig
declare module 'tamagui' {
  // Extend this interface to customize Tamagui config types
  interface TamaguiCustomConfig extends AppConfig {
    _customConfigBrand?: string
    theme?: CustomTheme
  }
}

export default appConfig
