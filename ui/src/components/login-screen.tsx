import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DesertBackdrop } from '@/components/desert-backdrop';
import { AppColors } from '@/constants/appTheme';
import { useAuth } from '@/context/auth';

type Mode = 'new' | 'returning';

const MEMBER_ID_RE = /^[a-zA-Z0-9_]{4,20}$/;


export function LoginScreen() {
  const { signIn, signInWithMemberId, checkMemberIdAvailable } = useAuth();
  const [mode, setMode] = useState<Mode>('new');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [memberId, setMemberId]   = useState('');
  const [password, setPassword]   = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showPw, setShowPw]         = useState(false);

  // New member only
  const [checking,  setChecking]  = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  function handleMemberIdChange(v: string) {
    setMemberId(v.replace(/[^a-zA-Z0-9_]/g, ''));
    setAvailable(null);
    setError(null);
  }

  async function handleCheck() {
    const id = memberId.trim();
    if (!MEMBER_ID_RE.test(id)) {
      setError('ID must be 4–20 characters: letters, numbers and underscore only.');
      return;
    }
    setError(null);
    setChecking(true);
    try {
      const ok = await checkMemberIdAvailable(id);
      setAvailable(ok);
    } catch {
      setError('Could not check availability. Try again.');
    } finally {
      setChecking(false);
    }
  }

  async function handleCreate() {
    const id = memberId.trim();
    const pw = password.trim();

    if (!MEMBER_ID_RE.test(id)) {
      setError('Invalid username format.'); return;
    }
    if (available !== true) {
      setError('Check that your username is available first.'); return;
    }
    if (pw.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    if (pw !== confirmPw.trim()) {
      setError('Passwords do not match.'); return;
    }

    setLoading(true);
    setError(null);
    try {
      await signIn(id, pw);
    } catch (e: any) {
      const msg: string = e?.message ?? '';
      if (msg.includes('already registered') || msg.includes('unique')) {
        setError('That username was just taken. Try a different one.');
      } else {
        setError('Account creation failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn() {
    const id = memberId.trim();
    const pw = password.trim();
    if (!id || !pw) {
      setError('Enter your username and password.'); return;
    }
    if (!MEMBER_ID_RE.test(id)) {
      setError('Invalid username format.'); return;
    }
    setLoading(true);
    setError(null);
    try {
      await signInWithMemberId(id, pw);
    } catch {
      setError('Username or password is incorrect.');
    } finally {
      setLoading(false);
    }
  }

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
    setMemberId('');
    setPassword('');
    setConfirmPw('');
    setAvailable(null);
  }

  const canCreate =
    MEMBER_ID_RE.test(memberId.trim()) &&
    available === true &&
    password.trim().length >= 6 &&
    password.trim() === confirmPw.trim();

  return (
    <View style={s.root}>
      <DesertBackdrop variant="full" />

      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

        {/* Logo */}
        <View style={s.logoBlock}>
          <View style={s.triangle}>
            <Ionicons name="triangle" size={38} color={AppColors.accent} />
          </View>
          <Text style={s.appName}>Recovery Community</Text>
          <Text style={s.tagline}>One day at a time.</Text>
        </View>

        {/* Anonymity pills */}
        <View style={s.pillsRow}>
          {['No email', 'No phone', 'No real name'].map(label => (
            <View key={label} style={s.pill}>
              <Ionicons name="checkmark" size={13} color={AppColors.meetings} />
              <Text style={s.pillText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Card */}
        <View style={s.card}>
          <View style={s.tabRow}>
            <Pressable onPress={() => switchMode('new')} style={[s.tab, mode === 'new' && s.tabActive]}>
              <Text style={[s.tabText, mode === 'new' && s.tabTextActive]}>New Member</Text>
            </Pressable>
            <Pressable onPress={() => switchMode('returning')} style={[s.tab, mode === 'returning' && s.tabActive]}>
              <Text style={[s.tabText, mode === 'returning' && s.tabTextActive]}>Sign In</Text>
            </Pressable>
          </View>

          <View style={s.body}>

            {mode === 'new' ? (
              <>
                {/* Username */}
                <Text style={s.fieldLabel}>USERNAME</Text>
                <Text style={s.fieldHint}>Letters, numbers, underscore · 4–20 characters</Text>
                <View style={s.idRow}>
                  <TextInput
                    value={memberId}
                    onChangeText={handleMemberIdChange}
                    placeholder="e.g. naveen_r"
                    placeholderTextColor={AppColors.textMuted}
                    style={[
                      s.input, s.idInput,
                      available === true  && s.inputOk,
                      available === false && s.inputErr,
                    ]}
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={20}
                  />
                  <Pressable
                    onPress={handleCheck}
                    disabled={checking || memberId.length < 4}
                    style={[s.checkBtn, (checking || memberId.length < 4) && { opacity: 0.4 }]}>
                    {checking
                      ? <ActivityIndicator size="small" color={AppColors.accent} />
                      : <Text style={s.checkBtnText}>Check</Text>}
                  </Pressable>
                </View>

                {available === true && (
                  <View style={s.availRow}>
                    <Ionicons name="checkmark-circle" size={14} color={AppColors.meetings} />
                    <Text style={s.availOk}>Available!</Text>
                  </View>
                )}
                {available === false && (
                  <View style={s.availRow}>
                    <Ionicons name="close-circle" size={14} color="#F2616B" />
                    <Text style={s.availErr}>Already taken — try a different username.</Text>
                  </View>
                )}

                {/* Password */}
                <Text style={[s.fieldLabel, { marginTop: 6 }]}>PASSWORD</Text>
                <View style={s.pwRow}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Min 6 characters"
                    placeholderTextColor={AppColors.textMuted}
                    secureTextEntry={!showPw}
                    style={[s.input, { flex: 1 }]}
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                  <Pressable onPress={() => setShowPw(p => !p)} style={s.eyeBtn}>
                    <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={AppColors.textMuted} />
                  </Pressable>
                </View>

                <Text style={[s.fieldLabel, { marginTop: 2 }]}>CONFIRM PASSWORD</Text>
                <TextInput
                  value={confirmPw}
                  onChangeText={setConfirmPw}
                  placeholder="Re-enter password"
                  placeholderTextColor={AppColors.textMuted}
                  secureTextEntry={!showPw}
                  style={s.input}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
              </>
            ) : (
              <>
                {/* Returning */}
                <Text style={s.fieldLabel}>USERNAME</Text>
                <TextInput
                  value={memberId}
                  onChangeText={handleMemberIdChange}
                  placeholder="e.g. naveen_r"
                  placeholderTextColor={AppColors.textMuted}
                  style={s.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                />

                <Text style={[s.fieldLabel, { marginTop: 6 }]}>PASSWORD</Text>
                <View style={s.pwRow}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Your password"
                    placeholderTextColor={AppColors.textMuted}
                    secureTextEntry={!showPw}
                    style={[s.input, { flex: 1 }]}
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                  <Pressable onPress={() => setShowPw(p => !p)} style={s.eyeBtn}>
                    <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={AppColors.textMuted} />
                  </Pressable>
                </View>
                <Text style={s.returningHint}>
                  If you signed up before passwords were added, use your recovery date (YYYY-MM-DD).
                </Text>
              </>
            )}

            {error && (
              <View style={s.errorBox}>
                <Ionicons name="alert-circle" size={15} color="#F2616B" />
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

          </View>
        </View>

        {/* CTA */}
        <View style={s.bottom}>
          <Pressable
            onPress={mode === 'new' ? handleCreate : handleSignIn}
            disabled={loading || (mode === 'new' && !canCreate)}
            style={[s.btn, (loading || (mode === 'new' && !canCreate)) && s.btnDisabled]}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>
                  {mode === 'new' ? 'Create Account' : 'Sign In'}
                </Text>}
          </Pressable>
        </View>

      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
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
    borderRadius: 18, overflow: 'hidden',
  },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: AppColors.tileBorder },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: AppColors.accent },
  tabText: { color: AppColors.textMuted, fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: AppColors.accent, fontWeight: '700' },

  body: { padding: 20, gap: 8 },

  fieldLabel: {
    color: AppColors.textMuted, fontSize: 11, fontWeight: '700',
    letterSpacing: 0.8, textTransform: 'uppercase',
  },
  fieldHint: { color: AppColors.textMuted, fontSize: 12, lineHeight: 17, marginTop: -4 },

  idRow: { flexDirection: 'row', gap: 10 },
  idInput: { flex: 1 },
  checkBtn: {
    backgroundColor: AppColors.accent + '22',
    borderWidth: 1, borderColor: AppColors.accent,
    borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center',
    minWidth: 64, alignItems: 'center',
  },
  checkBtnText: { color: AppColors.accent, fontSize: 13, fontWeight: '700' },

  availRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -2 },
  availOk:  { color: AppColors.meetings, fontSize: 12, fontWeight: '600' },
  availErr: { color: '#F2616B', fontSize: 12 },

  pwRow: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  eyeBtn: {
    position: 'absolute', right: 12,
    height: 46, justifyContent: 'center', zIndex: 1,
  },

  input: {
    height: 46, backgroundColor: AppColors.screen,
    borderWidth: 1, borderColor: AppColors.hairline,
    borderRadius: 10, paddingHorizontal: 14,
    color: AppColors.text, fontSize: 14,
    outlineStyle: 'none' as any,
  },
  inputOk:  { borderColor: AppColors.meetings },
  inputErr: { borderColor: '#F2616B' },

  returningHint: { color: AppColors.textMuted, fontSize: 12, lineHeight: 17 },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F2616B18', borderWidth: 1, borderColor: '#F2616B44',
    borderRadius: 8, padding: 10, marginTop: 4,
  },
  errorText: { color: '#F2616B', fontSize: 12, flex: 1 },

  bottom: { paddingBottom: 4 },
  btn: {
    height: 54, backgroundColor: AppColors.accent,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.45 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
