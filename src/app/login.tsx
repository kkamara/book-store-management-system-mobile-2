import { palette } from '@/components/store/StoreUI';
import { useAccounts } from '@/providers/StorefrontProvider';
import { isCustomErrorResponse } from '@/typeHandlers';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading } = useAccounts();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit() {
    setError('');
    const result = await login({ email: email.trim(), password });
    if (isCustomErrorResponse(result)) setError(result.error || 'Unable to sign in.');
    else router.replace('/(tabs)');
  }

  return <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.brandMark}><Text style={styles.markText}>B</Text></View>
      <Text style={styles.eyebrow}>BOOK STORE 2</Text>
      <Text style={styles.title}>Welcome back.</Text>
      <Text style={styles.subtitle}>Your next favourite is only a few pages away.</Text>
      <View style={styles.form}>
        <TextInput label="Email address" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" mode="outlined" style={styles.input} />
        <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry mode="outlined" style={styles.input} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button mode="contained" buttonColor={palette.ink} loading={loading} disabled={loading || !email || !password} contentStyle={styles.button} onPress={() => void submit()}>Sign in</Button>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>New around here?</Text>
        <Link href="/register" asChild><Button compact textColor={palette.orange}>Create an account</Button></Link>
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
  title: { color: palette.ink, fontFamily: 'serif', fontSize: 35, fontWeight: '700', marginTop: 5 },
  subtitle: { color: palette.muted, fontSize: 14, lineHeight: 21, marginTop: 7, marginBottom: 28 },
  form: { gap: 13 },
  input: { backgroundColor: palette.white },
  error: { color: '#B54835', lineHeight: 20 },
  button: { height: 49 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  footerText: { color: palette.muted, fontSize: 13 },
});