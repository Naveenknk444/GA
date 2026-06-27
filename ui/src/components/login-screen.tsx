import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DesertBackdrop } from '@/components/desert-backdrop';
import { AppColors } from '@/constants/appTheme';
import { useAuth } from '@/context/auth';

type Mode = 'welcome' | 'returning';

export function LoginScreen() {
  const { signIn, signInWithMemberId } = useAuth();
  const [mode, setMode] = useState<Mode>('welcome');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Returning user fields
  const [memberId, setMemberId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleGetStarted() {
    setLoading(true);
    setError(null);
    try {
      await signIn();
    } catch (e: any) {
      setError(e?.message ?? 'Could not create account. Check Supabase anonymous auth is enabled.');
    } finally {
      setLoading(false);
    }
  }

  async function handleReturn() {
    if (!memberId.trim() || !password.trim()) {
      setError('Enter both your Member ID and recovery password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signInWithMemberId(memberId.trim(), password.trim());
    } catch (e: any) {
      setError('Member ID or password is incorrect.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <DesertBackdrop variant="full" />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

        {/* Logo */}
        <View style={styles.logoBlock}>
          <View style={styles.triangle}>
            <Ionicons name="triangle" size={38} color={AppColors.accent} />
          </View>
          <Text style={styles.appName}>Recovery Community</Text>
          <Text style={styles.tagline}>One day at a time.</Text>
        </View>

        {/* Anonymity pills */}
        <View style={styles.pillsRow}>
          {['No name', 'No email', 'No phone'].map((label) => (
            <View key={label} style={styles.pill}>
              <Ionicons name="checkmark" size={13} color={AppColors.meetings} />
              <Text style={styles.pillText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Main card — switches between welcome and returning */}
        <View style={styles.card}>
          {/* Tab switcher */}
          <View style={styles.tabRow}>
            <Pressable
              onPress={() => { setMode('welcome'); setError(null); }}
              style={[styles.tab, mode === 'welcome' && styles.tabActive]}>
              <Text style={[styles.tabText, mode === 'welcome' && styles.tabTextActive]}>
                New Member
              </Text>
            </Pressable>
            <Pressable
              onPress={() => { setMode('returning'); setError(null); }}
              style={[styles.tab, mode === 'returning' && styles.tabActive]}>
              <Text style={[styles.tabText, mode === 'returning' && styles.tabTextActive]}>
                Returning
              </Text>
            </Pressable>
          </View>

          {mode === 'welcome' ? (
            <View style={styles.modeContent}>
              <Ionicons name="shield-checkmark" size={28} color={AppColors.accent} />
              <Text style={styles.cardTitle}>Join anonymously</Text>
              <Text style={styles.cardDesc}>
                Your account is created instantly with no personal information.
                Only you know who you are.
              </Text>
            </View>
          ) : (
            <View style={styles.modeContent}>
              <Text style={styles.cardTitle}>Welcome back</Text>
              <Text style={styles.cardDesc}>
                Enter the Member ID and recovery password from your Profile.
              </Text>

              <TextInput
                value={memberId}
                onChangeText={setMemberId}
                placeholder="Member ID  (e.g. a3f8c2d1)"
                placeholderTextColor={AppColors.textMuted}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.passwordRow}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Recovery password"
                  placeholderTextColor={AppColors.textMuted}
                  style={[styles.input, { flex: 1 }]}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={AppColors.textMuted}
                  />
                </Pressable>
              </View>
            </View>
          )}

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={15} color="#F2616B" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        {/* CTA button */}
        <View style={styles.bottom}>
          <Pressable
            onPress={mode === 'welcome' ? handleGetStarted : handleReturn}
            disabled={loading}
            style={[styles.btn, loading && styles.btnDisabled]}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>
                  {mode === 'welcome' ? 'Get Started' : 'Sign In'}
                </Text>
            }
          </Pressable>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.screen },
  safe: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between', paddingVertical: 20 },

  logoBlock: { alignItems: 'center', gap: 10, marginTop: 30 },
  triangle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: AppColors.accent + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  appName: { color: AppColors.text, fontSize: 26, fontWeight: '700' },
  tagline: { color: AppColors.textMuted, fontSize: 15, fontStyle: 'italic' },

  pillsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: AppColors.tile, borderWidth: 1, borderColor: AppColors.tileBorder,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  pillText: { color: AppColors.text, fontSize: 12 },

  card: {
    backgroundColor: AppColors.tile, borderWidth: 1, borderColor: AppColors.tileBorder,
    borderRadius: 18, overflow: 'hidden', gap: 0,
  },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: AppColors.tileBorder },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: AppColors.accent },
  tabText: { color: AppColors.textMuted, fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: AppColors.accent, fontWeight: '700' },

  modeContent: { padding: 20, alignItems: 'center', gap: 12 },
  cardTitle: { color: AppColors.text, fontSize: 18, fontWeight: '700' },
  cardDesc: { color: AppColors.textMuted, fontSize: 13, lineHeight: 20, textAlign: 'center' },

  input: {
    width: '100%', height: 46, backgroundColor: AppColors.screen,
    borderWidth: 1, borderColor: AppColors.hairline,
    borderRadius: 10, paddingHorizontal: 14,
    color: AppColors.text, fontSize: 14,
    outlineStyle: 'none' as any,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '100%' },
  eyeBtn: { padding: 10 },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8, margin: 12, marginTop: 0,
    backgroundColor: '#F2616B18', borderWidth: 1, borderColor: '#F2616B44',
    borderRadius: 8, padding: 10,
  },
  errorText: { color: '#F2616B', fontSize: 12, flex: 1 },

  bottom: { paddingBottom: 4 },
  btn: {
    height: 54, backgroundColor: AppColors.accent,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
