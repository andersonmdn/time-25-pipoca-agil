import { StyleSheet, Text, View } from 'react-native'

const UserDetails = () => {
  // Dados estáticos para exemplo
  const user = {
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 91234-5678',
    role: 'user',
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhes do Usuário</Text>
      <Text>Nome: {user.name}</Text>
      <Text>Email: {user.email}</Text>
      <Text>Telefone: {user.phone}</Text>
      <Text>Perfil: {user.role}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
})

export default UserDetails
