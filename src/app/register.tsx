import { palette } from '@/components/store/StoreUI';
import { useAccounts } from '@/providers/StorefrontProvider';
import { isCustomErrorResponse } from '@/typeHandlers';
import { Link, Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, IconButton, Text, TextInput } from 'react-native-paper';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading } = useAccounts();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');

  async function submit() {
    setError('');
    const result = await register({ firstName, lastName, email: email.trim(), password, passwordConfirmation });
    if (isCustomErrorResponse(result)) setError(result.error || 'Unable to create your account.');
    else router.replace('/login');
  }

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  }

  return <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <Stack.Screen options={{
      headerLeft: () => <IconButton icon="arrow-left" accessibilityLabel="Go back" onPress={goBack} />,
    }} />
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.brandMark}><Text style={styles.markText}>B</Text></View>
      <Text style={styles.eyebrow}>JOIN BOOK STORE 2</Text>
      <Text style={styles.title}>Make room for stories.</Text>
      <Text style={styles.subtitle}>Create an account to keep your books and orders together.</Text>
      <View style={styles.form}>
        <View style={styles.nameRow}>
          <TextInput label="First name" value={firstName} onChangeText={setFirstName} mode="outlined" style={[styles.input, styles.nameInput]} />
          <TextInput label="Last name" value={lastName} onChangeText={setLastName} mode="outlined" style={[styles.input, styles.nameInput]} />
        </View>
        <TextInput label="Email address" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" mode="outlined" style={styles.input} />
        <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry mode="outlined" style={styles.input} />
        <TextInput label="Confirm password" value={passwordConfirmation} onChangeText={setPasswordConfirmation} secureTextEntry mode="outlined" style={styles.input} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button mode="contained" buttonColor={palette.ink} loading={loading} disabled={loading || !firstName || !lastName || !email || !password || password !== passwordConfirmation} contentStyle={styles.button} onPress={() => void submit()}>Create account</Button>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already a member?</Text>
        <Link href="/login" asChild><Button compact textColor={palette.orange}>Sign in</Button></Link>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: palette.paper },
  content: { flexGrow: 1, justifyContent: 'center', padding: 26 },
  brandMark: { width: 48, height: 48, borderRadius: 24, backgroundColor: palette.ink, alignItems: 'center', justifyContent: 'center', marginBottom: 23 },
  markText: { color: '#F5D6B7', fontFamily: 'serif', fontSize: 27, fontWeight: '700' },
  eyebrow: { color: palette.orange, fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  title: { color: palette.ink, fontFamily: 'serif', fontSize: 32, fontWeight: '700', marginTop: 5 },
  subtitle: { color: palette.muted, fontSize: 14, lineHeight: 21, marginTop: 7, marginBottom: 25 },
  form: { gap: 12 },
  nameRow: { flexDirection: 'row', gap: 10 },
  nameInput: { flex: 1, minWidth: 0 },
  input: { backgroundColor: palette.white },
  error: { color: '#B54835', lineHeight: 20 },
  button: { height: 49 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 21 },
  footerText: { color: palette.muted, fontSize: 13 },
});