import { useSignUp } from '@/src/hooks/useSignUp'
import { Battery, UserPlus } from '@tamagui/lucide-icons'
import { ActivityIndicator, Image } from 'react-native'
import { Button, Card, H2, Input, Paragraph, Separator, XStack, YStack } from 'tamagui'

export default function SignUp() {
  const { email, setEmail, password, setPassword, name, setName, phone, setPhone, loading, error, signUp, router } = useSignUp()

  return (
    <YStack f={1} bg="$background">
      <YStack h={160} ai="center" jc="center" bg="$primary" px="$4">
        <H2 mt="$2" color="white" ff="$heading">
          <Battery size={24} /> Sign Up
        </H2>
      </YStack>

      <YStack f={1} px="$4" py="$5" gap="$4" maxWidth={600} w="100%" mx="auto">
        <Card bordered br="$6" p="$4" bg="$backgroundTransparent">
          <YStack gap="$3">
            <Paragraph size="$2" color="$color" mb={-8}>
              Nome
            </Paragraph>
            <Input size="$4" placeholder="Nome completo" value={name} onChangeText={setName} autoCapitalize="words" testID="input-name" />

            <Paragraph size="$2" color="$color" mb={-8}>
              E-mail
            </Paragraph>
            <Input
              size="$4"
              placeholder="E-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              testID="input-email"
            />

            <Paragraph size="$2" color="$color" mb={-8}>
              Telefone
            </Paragraph>
            <Input size="$4" placeholder="Telefone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} testID="input-phone" />

            <Paragraph size="$2" color="$color" mb={-8}>
              Senha
            </Paragraph>
            <Input size="$4" placeholder="Senha" secureTextEntry value={password} onChangeText={setPassword} testID="input-password" />

            {error ? (
              <Paragraph size="$2" color="red" mb={-8} testID="error-message">
                {error}
              </Paragraph>
            ) : null}

            <Button
              icon={UserPlus}
              size="$4"
              onPress={signUp}
              disabled={loading || !email || !password || !name}
              bg={loading || !email || !password || !name ? '$backgroundDisabled' : '$primary'}
              mt="$2"
              testID="button-sign-up"
            >
              {loading ? <ActivityIndicator color="#fff" /> : 'Criar conta'}
            </Button>

            <XStack ai="center" jc="center" gap="$2" mt="$2">
              <Paragraph size="$2" color="$color">
                Já tem conta?
              </Paragraph>
              <Button variant="outlined" size="$2" chromeless onPress={() => router.push('/sign-in')} color="$primary" px={0} testID="button-sign-in">
                Entrar
              </Button>
            </XStack>

            <Separator my="$3" />

            <Button
              size="$4"
              bg="$background"
              color="$primary"
              borderColor="$primary"
              borderWidth={1}
              disabled={loading}
              // onPress={handleGoogleSignUp} // Implemente se necessário
              testID="button-google-sign-up"
            >
              <Image source={require('../../../assets/google.png')} style={{ width: 20, height: 20, marginRight: 8 }} resizeMode="contain" />
              Cadastrar com Google
            </Button>
          </YStack>
        </Card>

        <Separator mt="auto" />
        <Paragraph ta="center" size="$1" opacity={0.6}>
          Recarga • MVP
        </Paragraph>
      </YStack>
    </YStack>
  )
}
