// app/(public)/sign-in.tsx
import { useSignIn } from '@/src/hooks/useSignIn'
import { Battery, Check, LogIn } from '@tamagui/lucide-icons'
import { ActivityIndicator, Image } from 'react-native'
import { Button, Card, Checkbox, H2, Input, Label, Paragraph, Separator, XStack, YStack } from 'tamagui'

export default function SignIn() {
  const { email, setEmail, password, setPassword, loading, error, emailValid, signIn, router, rememberMe, setRememberMe } = useSignIn()

  const handleSignIn = async () => {
    await signIn()
    // Navegação após login bem-sucedido
    // if (!error) {
    //   router.replace('/home')
    // }
  }

  const handleGoogleSignIn = async () => {
    // Implementar lógica de login com Google aqui
  }

  return (
    <YStack f={1} bg="$background">
      <YStack h={160} ai="center" jc="center" bg="$primary" px="$4">
        <H2 mt="$2" color="white" ff="$heading">
          <Battery size={24} /> Sign In
        </H2>
      </YStack>

      <YStack f={1} px="$4" py="$5" gap="$4" maxWidth={600} w="100%" mx="auto">
        <Card bordered br="$6" p="$4" bg="$backgroundTransparent">
          <YStack gap="$3">
            <Paragraph size="$2" color="$color" mb={-8}>
              E-mail
            </Paragraph>
            <Input
              flex={1}
              size="$4"
              placeholder="E-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              testID="input-email"
            />
            <Paragraph size="$2" color="$color" mb={-8}>
              Senha
            </Paragraph>
            <Input flex={1} size="$4" placeholder="Senha" secureTextEntry value={password} onChangeText={setPassword} testID="input-password" />

            {/* Exibe mensagem de erro, se houver */}
            {error ? (
              <Paragraph size="$2" color="red" mb={-8} testID="error-message">
                {error}
              </Paragraph>
            ) : null}

            {/* Lembrar de mim e Esqueceu senha */}
            <XStack ai="center" jc="space-between" mt="$2">
              <XStack ai="center" gap="$2">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  size="$2"
                  id="rememberMe"
                  testID="checkbox-remember-me"
                >
                  <Checkbox.Indicator>
                    <Check size={14} />
                  </Checkbox.Indicator>
                </Checkbox>
                <Label htmlFor="rememberMe" size="$2" color="$color">
                  Lembrar de mim
                </Label>
              </XStack>
              <Button
                variant="outlined"
                size="$2"
                chromeless
                onPress={() => router.push('/forgot-password')}
                color="$primary"
                px={0}
                testID="button-forgot-password"
              >
                Esqueceu sua senha?
              </Button>
            </XStack>

            <Button
              icon={LogIn}
              size="$4"
              onPress={handleSignIn}
              disabled={loading || !email || !password}
              bg={loading || !email || !password ? '$backgroundDisabled' : '$primary'}
              mt="$2"
              testID="button-sign-in"
            >
              {loading ? <ActivityIndicator color="#fff" /> : 'Entrar'}
            </Button>

            <XStack ai="center" jc="center" gap="$2" mt="$2">
              <Paragraph size="$2" color="$color">
                Não tem conta?
              </Paragraph>
              <Button variant="outlined" size="$2" chromeless onPress={() => router.push('/sign-up')} color="$primary" px={0} testID="button-sign-up">
                Criar conta
              </Button>
            </XStack>

            <Separator my="$3" />

            <Button
              size="$4"
              bg="$background"
              color="$primary"
              borderColor="$primary"
              borderWidth={1}
              onPress={handleGoogleSignIn}
              disabled={loading}
              testID="button-google-sign-in"
            >
              <Image source={require('../../../assets/google.png')} style={{ width: 20, height: 20, marginRight: 8 }} resizeMode="contain" />
              Entrar com Google
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
