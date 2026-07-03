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

const MEMBER_ID_RE = /^[a-z0-9_]{4,20}$/;

function isValidDate(d: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const date = new Date(d);
  return !isNaN(date.getTime()) && date < new Date();
}

export function LoginScreen() {
  const { signIn, signInWithMemberId, checkMemberIdAvailable } = useAuth();
  const [mode, setMode] = useState<Mode>('new');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [memberId, setMemberId]   = useState('');
  const [cleanDate, setCleanDate] = useState('');

  // New member only
  const [checking,   setChecking]   = useState(false);
  const [available,  setAvailable]  = useState<boolean | null>(null);

  function handleMemberIdChange(v: string) {
    // auto-lowercase, strip invalid chars
    setMemberId(v.toLowerCase().replace(/[^a-z0-9_]/g, ''));
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
    const id   = memberId.trim();
    const date = cleanDate.trim();
    if (!MEMBER_ID_RE.test(id)) {
      setError('Invalid Member ID format.'); return;
    }
    if (available !== true) {
      setError('Check that your Member ID is available first.'); return;
    }
    if (!isValidDate(date)) {
      setError('Enter a valid past date in YYYY-MM-DD format.'); return;
    }
    setLoading(true);
    setError(null);
    try {
      await signIn(id, date);
    } catch (e: any) {
      const msg: string = e?.message ?? '';
      if (msg.includes('already registered') || msg.includes('unique')) {
        setError('That Member ID was just taken. Try a different one.');
      } else {
        setError('Account creation failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn() {
    const id   = memberId.trim();
    const date = cleanDate.trim();
    if (!id || !date) {
      setError('Enter your Member ID and recovery date.'); return;
    }
    if (!MEMBER_ID_RE.test(id)) {
      setError('Invalid Member ID format.'); return;
    }
    if (!isValidDate(date)) {
      setError('Enter a valid date in YYYY-MM-DD format.'); return;
    }
    setLoading(true);
    setError(null);
    try {
      await signInWithMemberId(id, date);
    } catch {
      setError('Member ID or recovery date is incorrect.');
    } finally {
      setLoading(false);
    }
  }

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
    setMemberId('');
    setCleanDate('');
    setAvailable(null);
  }

  const canCreate =
    MEMBER_ID_RE.test(memberId.trim()) &&
    available === true &&
    isValidDate(cleanDate.trim());

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
            <Pressable
              onPress={() => switchMode('new')}
              style={[s.tab, mode === 'new' && s.tabActive]}>
              <Text style={[s.tabText, mode === 'new' && s.tabTextActive]}>New Member</Text>
            </Pressable>
            <Pressable
              onPress={() => switchMode('returning')}
              style={[s.tab, mode === 'returning' && s.tabActive]}>
              <Text style={[s.tabText, mode === 'returning' && s.tabTextActive]}>Returning</Text>
            </Pressable>
          </View>

          <View style={s.body}>

            {mode === 'new' ? (
              <>
                {/* ── Member ID ── */}
                <Text style={s.fieldLabel}>CHOOSE A MEMBER ID</Text>
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
                    <Text style={s.availErr}>Already taken — try a different ID.</Text>
                  </View>
                )}

                {/* ── Recovery date ── */}
                <Text style={[s.fieldLabel, { marginTop: 6 }]}>RECOVERY DATE</Text>
                <Text style={s.fieldHint}>Your GA clean date — used to verify your identity later</Text>
                <TextInput
                  value={cleanDate}
                  onChangeText={setCleanDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={AppColors.textMuted}
                  keyboardType="numeric"
                  style={s.input}
                  autoCorrect={false}
                  maxLength={10}
                />
              </>
            ) : (
              <>
                {/* ── Returning ── */}
                <Text style={s.fieldLabel}>MEMBER ID</Text>
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

                <Text style={s.fieldLabel}>RECOVERY DATE</Text>
                <TextInput
                  value={cleanDate}
                  onChangeText={setCleanDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={AppColors.textMuted}
                  keyboardType="numeric"
                  style={s.input}
                  autoCorrect={false}
                  maxLength={10}
                />
                <Text style={s.returningHint}>
                  Use the same Member ID and recovery date you created your account with.
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

        {/* CTA button */}
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
