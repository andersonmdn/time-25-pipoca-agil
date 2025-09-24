// apps\mobile\src\screens\Home\index.tsx
import { Battery, MapPin } from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Button, Card, H2, Input, Paragraph, Separator, Theme, XStack, YStack } from 'tamagui'

function Chip({ label, initial = false, onPress }: { label: string; initial?: boolean; onPress?: (active: boolean) => void }) {
  const [active, setActive] = useState(initial)
  return (
    <Button
      size="$2"
      chromeless
      bordered
      bw={1}
      br="$10"
      unstyled={false}
      px="$3"
      py="$1.5"
      ml="$2"
      mt="$2"
      theme={active ? 'active' : undefined}
      onPress={() => {
        const next = !active
        setActive(next)
        onPress?.(next)
      }}
    >
      {label}
    </Button>
  )
}

export default function HomeScreen() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  return (
    <YStack f={1} bg="$background">
      {/* Header com logo */}
      <YStack h={160} ai="center" jc="center" bg="$primary" px="$4">
        {/* <Image
          // tamagui Image aceita o mesmo "source" do RN
          source={imgReactLogo}
          width={192}
          height={96}
          opacity={0.8}
          resizeMode="contain"
        /> */}
        <H2 mt="$2" color="white" ff="$heading">
          <Battery size={24} /> Encontre carga para seu EV
        </H2>
      </YStack>

      {/* Conteúdo */}
      <YStack f={1} px="$4" py="$5" gap="$4">
        {/* Busca */}
        <Card bordered br="$6" p="$4" bg="$colorTransparent">
          <YStack gap="$2">
            <Paragraph size="$2" color="$color" opacity={0.7}>
              Onde você quer carregar?
            </Paragraph>
            <XStack gap="$3" ai="center">
              <Input flex={1} size="$4" placeholder="Ex.: Av. Paulista, 1000" value={query} onChangeText={setQuery} />
              <Button icon={MapPin} size="$4" aria-label="Usar localização atual">
                Perto
              </Button>
            </XStack>
          </YStack>
        </Card>

        {/* Filtros rápidos */}
        <XStack fw="wrap">
          {['CCS', 'Type 2', 'CHAdeMO', 'Rápido', '24h'].map((tag) => (
            <Chip key={tag} label={tag} />
          ))}
        </XStack>

        {/* Dica */}
        <Theme name="brandLight">
          <Card br="$6" p="$4" bg="$backgroundFocus">
            <Paragraph size="$3" fontWeight="700" mb="$1" color="$primary">
              Dica
            </Paragraph>
            <Paragraph size="$2" color="$color">
              Use os filtros para encontrar conectores compatíveis e ver disponibilidade em tempo real.
            </Paragraph>
          </Card>
        </Theme>

        <Separator mt="auto" />
        <Paragraph ta="center" size="$1" opacity={0.6}>
          Recarga • MVP
        </Paragraph>
      </YStack>
    </YStack>
  )
}
