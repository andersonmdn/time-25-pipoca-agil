import { useColorScheme } from 'react-native'
import { Avatar, Card, H2, Paragraph, Separator, SizableText, Stack, XStack, YStack, useTheme } from 'tamagui'

export default function Profile() {
  const colorScheme = useColorScheme()
  const theme = useTheme() as unknown as CustomTheme
  // Dados estáticos de exemplo
  const user = {
    name: 'Juliana Pereira',
    email: 'juliana.pereira@email.com',
    phone: '(11) 91234-5678',
    role: 'user',
    avatar: 'https://i.pravatar.cc/150?img=5',
  }

  return (
    <YStack f={1} ai="center" jc="center" bg={theme.background.val} p="$4">
      <Card
        elevate
        size="$5"
        width={340}
        bg={theme.background.val}
        borderRadius="$8"
        shadowColor={theme.border.val}
        shadowOpacity={0.18}
        shadowRadius={12}
        shadowOffset={{ width: 0, height: 4 }}
        p="$5"
      >
        <YStack ai="center" gap="$3">
          <Avatar circular size="$10" bg={theme.primary.val}>
            <Avatar.Image src={user.avatar} />
            <Avatar.Fallback bc={theme.primary.val} />
          </Avatar>
          <H2 color={theme.color.val}>{user.name}</H2>
          <Separator />
          <Stack gap="$2" width="100%">
            <XStack jc="space-between" ai="center">
              <SizableText size="$4" color={theme.accent.val} fontWeight="600">
                Email:
              </SizableText>
              <Paragraph size="$4" color={theme.color.val}>
                {user.email}
              </Paragraph>
            </XStack>
            <XStack jc="space-between" ai="center">
              <SizableText size="$4" color={theme.accent.val} fontWeight="600">
                Telefone:
              </SizableText>
              <Paragraph size="$4" color={theme.color.val}>
                {user.phone}
              </Paragraph>
            </XStack>
            <XStack jc="space-between" ai="center">
              <SizableText size="$4" color={theme.accent.val} fontWeight="600">
                Função:
              </SizableText>
              <Paragraph size="$4" color={theme.color.val}>
                {user.role}
              </Paragraph>
            </XStack>
          </Stack>
        </YStack>
      </Card>
    </YStack>
  )
}
