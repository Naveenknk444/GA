import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchProfile, updateCleanDate, updateHandle, updatePersonalInfo, updateRecoveryPhrase } from '@/api/profile';
import { useDrawer } from '@/context/drawer';
import { DatePickerInput } from '@/components/date-picker-input';
import { HomeBackdrop } from '@/components/home-backdrop';
import { AppColors } from '@/constants/appTheme';
import { useAuth } from '@/context/auth';
import { supabase } from '@/lib/supabase';
import {
  isBiometricSupported, isBiometricEnabled, getBiometricLabel,
  enableBiometric, disableBiometric,
} from '@/lib/biometrics';

function localDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function daysClean(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = Date.now() - localDate(dateStr).getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

function formatDateDisplay(dateStr: string | null): string {
  if (!dateStr) return '—';
  return localDate(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// ── row used inside cards ────────────────────────────────────────
function InfoRow({
  label, value, editing, placeholder, onChangeText, multiline,
}: {
  label: string; value: string; editing: boolean;
  placeholder: string; onChangeText: (v: string) => void; multiline?: boolean;
}) {
  return (
    <View style={row.wrap}>
      <Text style={row.label}>{label}</Text>
      {editing ? (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={AppColors.textMuted}
          style={[row.input, multiline && { minHeight: 80, textAlignVertical: 'top', paddingTop: 10 }]}
          autoCorrect={false}
          multiline={multiline}
        />
      ) : (
        <Text style={row.value}>{value || '—'}</Text>
      )}
    </View>
  );
}

const row = StyleSheet.create({
  wrap: { width: '100%', gap: 6 },
  label: { color: AppColors.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  value: { color: AppColors.text, fontSize: 15 },
  input: {
    width: '100%',
    backgroundColor: AppColors.screen,
    borderWidth: 1, borderColor: AppColors.hairline,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    color: AppColors.text, fontSize: 15,
    outlineStyle: 'none' as any,
  },
});

// ── main screen ──────────────────────────────────────────────────
export default function ProfileScreen() {
  const { user, shortId, loading } = useAuth();
  const { open } = useDrawer();

  // member handle
  const [handle, setHandle] = useState('');
  const [savedHandle, setSavedHandle] = useState('');
  const [savingHandle, setSavingHandle] = useState(false);
  const [editingHandle, setEditingHandle] = useState(false);

  // recovery date inline edit
  const [editingDate, setEditingDate] = useState(false);
  const [savingDate, setSavingDate] = useState(false);

  async function saveCleanDate() {
    if (!user) return;
    setSavingDate(true);
    try {
      await updateCleanDate(user.id, cleanDate);
      setSavedInfo(s => ({ ...s, cleanDate: cleanDate.trim() }));
      setEditingDate(false);
    } finally {
      setSavingDate(false);
    }
  }

  // recovery password
  const [editingPassword, setEditingPassword]       = useState(false);
  const [savingPassword, setSavingPassword]         = useState(false);
  const [newPhrase, setNewPhrase]                   = useState('');
  const [confirmPhrase, setConfirmPhrase]           = useState('');
  const [phraseError, setPhraseError]               = useState<string | null>(null);
  const [showPhrase, setShowPhrase]                 = useState(false);
  const [savedRecoveryPhrase, setSavedRecoveryPhrase] = useState<string | null>(null);

  // personal info
  const [editingInfo, setEditingInfo] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [cleanDate, setCleanDate] = useState('');   // YYYY-MM-DD
  // biometrics
  const [bioSupported, setBioSupported] = useState(false);
  const [bioEnabled,   setBioEnabled]   = useState(false);
  const [bioLabel,     setBioLabel]     = useState('Face ID');
  const [bioLoading,   setBioLoading]   = useState(false);

  const [savedInfo, setSavedInfo] = useState({
    firstName: '', lastName: '', city: '', bio: '', cleanDate: '',
  });

  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id).then((data) => {
      const h = data?.handle ?? ('Member ' + shortId);
      setHandle(h); setSavedHandle(h);
      const info = {
        firstName: data?.first_name ?? '',
        lastName:  data?.last_name  ?? '',
        city:      data?.city       ?? '',
        bio:       data?.bio        ?? '',
        cleanDate: data?.clean_date ?? '',
      };
      setFirstName(info.firstName); setLastName(info.lastName);
      setCity(info.city); setBio(info.bio); setCleanDate(info.cleanDate);
      setSavedInfo(info);
      setSavedRecoveryPhrase(data?.recovery_phrase ?? null);
    });

    // load biometric state
    Promise.all([isBiometricSupported(), isBiometricEnabled(), getBiometricLabel()])
      .then(([supported, enabled, label]) => {
        setBioSupported(supported);
        setBioEnabled(enabled);
        setBioLabel(label);
      });
  }, [user]);

  async function saveHandle() {
    if (!user || !handle.trim()) return;
    setSavingHandle(true);
    try {
      await updateHandle(user.id, handle.trim());
      setSavedHandle(handle.trim());
      setEditingHandle(false);
    } catch {
      Alert.alert('Error', 'Could not update Member ID.');
    } finally {
      setSavingHandle(false);
    }
  }

  async function saveInfo() {
    if (!user) return;
    setSavingInfo(true);
    try {
      await updatePersonalInfo(user.id, { firstName, lastName, city, bio });
      setSavedInfo(s => ({ ...s, firstName: firstName.trim(), lastName: lastName.trim(), city: city.trim(), bio: bio.trim() }));
      setEditingInfo(false);
    } finally {
      setSavingInfo(false);
    }
  }

  function cancelInfo() {
    setFirstName(savedInfo.firstName); setLastName(savedInfo.lastName);
    setCity(savedInfo.city); setBio(savedInfo.bio); setCleanDate(savedInfo.cleanDate);
    setEditingInfo(false);
  }

  async function savePassword() {
    if (newPhrase.trim().length < 6) {
      setPhraseError('Password must be at least 6 characters.');
      return;
    }
    if (newPhrase !== confirmPhrase) {
      setPhraseError('Passwords do not match.');
      return;
    }
    if (!user) return;
    setSavingPassword(true);
    setPhraseError(null);
    try {
      await updateRecoveryPhrase(user.id, newPhrase.trim());
      setSavedRecoveryPhrase(newPhrase.trim());
      setNewPhrase('');
      setConfirmPhrase('');
      setEditingPassword(false);
    } catch {
      setPhraseError('Could not save password. Try again.');
    } finally {
      setSavingPassword(false);
    }
  }

  function cancelPassword() {
    setNewPhrase('');
    setConfirmPhrase('');
    setPhraseError(null);
    setEditingPassword(false);
  }

  async function toggleBiometric() {
    setBioLoading(true);
    try {
      if (bioEnabled) {
        await disableBiometric();
        setBioEnabled(false);
      } else {
        const success = await enableBiometric();
        if (success) setBioEnabled(true);
      }
    } finally {
      setBioLoading(false);
    }
  }

  async function confirmSignOut() {
    const msg = 'You will be signed out of your account.';
    if (Platform.OS === 'web') {
      if (window.confirm(`Sign Out?\n\n${msg}`)) await supabase.auth.signOut();
    } else {
      Alert.alert('Sign Out', msg, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => supabase.auth.signOut() },
      ]);
    }
  }

  if (loading) {
    return <View style={styles.center}><Text style={{ color: AppColors.textMuted }}>Loading…</Text></View>;
  }

  const days = daysClean(savedInfo.cleanDate);

  return (
    <View style={styles.root}>
      <HomeBackdrop />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.headerRow}>
          <Pressable onPress={open} hitSlop={10}>
            <Ionicons name="menu" size={26} color={AppColors.text} />
          </Pressable>
          <Text style={styles.screenTitle}>Profile</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Member ID ── */}
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color={AppColors.accent} />
            </View>
            <Text style={styles.memberLabel}>Member ID</Text>

            {editingHandle ? (
              <View style={styles.editRow}>
                <TextInput
                  value={handle} onChangeText={setHandle}
                  autoCapitalize="none" autoCorrect={false} autoFocus
                  style={styles.handleInput} placeholderTextColor={AppColors.textMuted}
                />
                <Pressable onPress={saveHandle}
                  disabled={savingHandle || !handle.trim() || handle.trim() === savedHandle}
                  style={[styles.smallBtn, { backgroundColor: AppColors.accent }]}>
                  <Text style={styles.smallBtnText}>{savingHandle ? '…' : 'Save'}</Text>
                </Pressable>
                <Pressable onPress={() => { setHandle(savedHandle); setEditingHandle(false); }}
                  style={[styles.smallBtn, { backgroundColor: AppColors.screen, borderWidth: 1, borderColor: AppColors.hairline }]}>
                  <Text style={[styles.smallBtnText, { color: AppColors.textMuted }]}>Cancel</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => setEditingHandle(true)} style={styles.handleRow}>
                <Text style={styles.handleText}>{savedHandle || ('Member ' + shortId)}</Text>
                <Ionicons name="pencil" size={15} color={AppColors.textMuted} />
              </Pressable>
            )}
          </View>

          {/* ── Recovery Date ── */}
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, width: '100%' }}>
              <View style={[styles.iconBadge, { backgroundColor: AppColors.meetings + '22' }]}>
                <Ionicons name="calendar" size={24} color={AppColors.meetings} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.memberLabel}>Recovery Date</Text>
                {!editingDate && (
                  days !== null ? (
                    <>
                      <Text style={styles.daysText}>{days} days clean</Text>
                      <Text style={styles.dateSubtext}>Since {formatDateDisplay(savedInfo.cleanDate)}</Text>
                    </>
                  ) : (
                    <Text style={styles.dateSubtext}>Tap pencil to set your recovery date</Text>
                  )
                )}
              </View>
              {!editingDate && (
                <Pressable onPress={() => setEditingDate(true)} hitSlop={10}>
                  <Ionicons name="pencil" size={15} color={AppColors.textMuted} />
                </Pressable>
              )}
            </View>

            {editingDate && (
              <View style={{ width: '100%', gap: 10 }}>
                <Text style={styles.memberLabel}>Enter your recovery date</Text>
                <DatePickerInput value={cleanDate} onChange={setCleanDate} />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Pressable onPress={() => { setCleanDate(savedInfo.cleanDate); setEditingDate(false); }}
                    style={[styles.dateBtn, { backgroundColor: AppColors.screen, borderWidth: 1, borderColor: AppColors.hairline }]}>
                    <Text style={[styles.dateBtnText, { color: AppColors.textMuted }]}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={saveCleanDate} disabled={savingDate}
                    style={[styles.dateBtn, { flex: 1, backgroundColor: AppColors.accent }]}>
                    <Text style={styles.dateBtnText}>{savingDate ? 'Saving…' : 'Save Date'}</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          {/* ── Personal Info ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Personal Info</Text>
              {!editingInfo ? (
                <Pressable onPress={() => setEditingInfo(true)} style={styles.editBtn}>
                  <Ionicons name="pencil" size={13} color={AppColors.accent} />
                  <Text style={styles.editBtnText}>Edit</Text>
                </Pressable>
              ) : (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable onPress={cancelInfo} style={[styles.editBtn, { borderColor: AppColors.hairline }]}>
                    <Text style={[styles.editBtnText, { color: AppColors.textMuted }]}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={saveInfo} disabled={savingInfo}
                    style={[styles.editBtn, { backgroundColor: AppColors.accent, borderColor: AppColors.accent }]}>
                    <Text style={[styles.editBtnText, { color: '#fff' }]}>{savingInfo ? '…' : 'Save'}</Text>
                  </Pressable>
                </View>
              )}
            </View>

            <View style={styles.divider} />
            <InfoRow label="First Name" value={firstName} editing={editingInfo} placeholder="Enter first name"            onChangeText={setFirstName} />
            <View style={styles.divider} />
            <InfoRow label="Last Name"  value={lastName}  editing={editingInfo} placeholder="Enter last name"             onChangeText={setLastName} />
            <View style={styles.divider} />
            <InfoRow label="City"       value={city}      editing={editingInfo} placeholder="Enter your city"             onChangeText={setCity} />
            <View style={styles.divider} />
            <InfoRow label="About Me"   value={bio}       editing={editingInfo} placeholder="A few words about yourself…" onChangeText={setBio} multiline />
          </View>

          {/* ── Recovery Password ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.iconBadge, { backgroundColor: '#A78BFA22' }]}>
                  <Ionicons name="key" size={22} color="#A78BFA" />
                </View>
                <View style={{ gap: 2 }}>
                  <Text style={styles.sectionTitle}>Password</Text>
                  <Text style={{ color: AppColors.textMuted, fontSize: 11 }}>Your login password</Text>
                </View>
              </View>
              {!editingPassword && (
                <Pressable onPress={() => setEditingPassword(true)} style={styles.editBtn}>
                  <Ionicons name="pencil" size={13} color={AppColors.accent} />
                  <Text style={styles.editBtnText}>{savedRecoveryPhrase ? 'Change' : 'Set'}</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.divider} />

            {!editingPassword ? (
              <View style={row.wrap}>
                <Text style={row.label}>Password</Text>
                {savedRecoveryPhrase ? (
                  <Pressable onPress={() => setShowPhrase(p => !p)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={row.value}>
                      {showPhrase ? savedRecoveryPhrase : '••••••••'}
                    </Text>
                    <Ionicons name={showPhrase ? 'eye-off-outline' : 'eye-outline'} size={16} color={AppColors.textMuted} />
                  </Pressable>
                ) : (
                  <Text style={{ color: AppColors.textMuted, fontSize: 14 }}>
                    Not set — your recovery date is used
                  </Text>
                )}
              </View>
            ) : (
              <View style={{ width: '100%', gap: 10 }}>
                <TextInput
                  value={newPhrase}
                  onChangeText={setNewPhrase}
                  placeholder="New password (min 6 characters)"
                  placeholderTextColor={AppColors.textMuted}
                  secureTextEntry
                  style={row.input}
                  autoFocus
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                <TextInput
                  value={confirmPhrase}
                  onChangeText={setConfirmPhrase}
                  placeholder="Confirm new password"
                  placeholderTextColor={AppColors.textMuted}
                  secureTextEntry
                  style={row.input}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                {phraseError && (
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <Ionicons name="alert-circle" size={14} color="#F2616B" />
                    <Text style={{ color: '#F2616B', fontSize: 12, flex: 1 }}>{phraseError}</Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Pressable onPress={cancelPassword}
                    style={[styles.dateBtn, { backgroundColor: AppColors.screen, borderWidth: 1, borderColor: AppColors.hairline }]}>
                    <Text style={[styles.dateBtnText, { color: AppColors.textMuted }]}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={savePassword} disabled={savingPassword}
                    style={[styles.dateBtn, { flex: 1, backgroundColor: AppColors.accent }]}>
                    <Text style={styles.dateBtnText}>{savingPassword ? 'Saving…' : 'Save Password'}</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          {/* ── Security ── */}
          {bioSupported && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Security</Text>
              <View style={styles.bioRow}>
                <View style={styles.bioRowLeft}>
                  <Ionicons
                    name={bioEnabled ? 'scan' : 'scan-outline'}
                    size={22}
                    color={bioEnabled ? AppColors.meetings : AppColors.textMuted}
                  />
                  <View style={{ gap: 2 }}>
                    <Text style={styles.bioLabel}>{bioLabel} Login</Text>
                    <Text style={styles.bioHint}>
                      {bioEnabled ? 'Tap to disable' : 'Sign in faster with biometrics'}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={toggleBiometric}
                  disabled={bioLoading}
                  style={[styles.bioToggle, bioEnabled && styles.bioToggleOn]}
                >
                  {bioLoading
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.bioToggleText}>{bioEnabled ? 'On' : 'Off'}</Text>}
                </Pressable>
              </View>
            </View>
          )}

          {/* ── Sign out ── */}
          <Pressable onPress={confirmSignOut} style={styles.signOutBtn}>
            <Ionicons name="log-out-outline" size={18} color="#F2616B" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>

        </ScrollView>
      </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  safe: { flex: 1, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, marginBottom: 20 },
  screenTitle: { color: AppColors.text, fontSize: 24, fontWeight: '700' },
  scroll: { gap: 16, paddingBottom: 36 },

  card: {
    backgroundColor: AppColors.tile,
    borderWidth: 1, borderColor: AppColors.tileBorder,
    borderRadius: 18, padding: 18, gap: 12, alignItems: 'center',
  },
  avatar: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: AppColors.accent + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  iconBadge: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  memberLabel: { color: AppColors.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },

  handleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  handleText: { color: AppColors.text, fontSize: 22, fontWeight: '700' },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  handleInput: {
    flex: 1, height: 42, backgroundColor: AppColors.screen,
    borderWidth: 1, borderColor: AppColors.accent,
    borderRadius: 10, paddingHorizontal: 12,
    color: AppColors.text, fontSize: 15, outlineStyle: 'none' as any,
  },
  smallBtn: { height: 42, paddingHorizontal: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  smallBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  daysText: { color: AppColors.meetings, fontSize: 22, fontWeight: '700' },
  dateSubtext: { color: AppColors.textMuted, fontSize: 13 },
  dateInput: {
    width: '100%', backgroundColor: AppColors.screen,
    borderWidth: 1, borderColor: AppColors.accent,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    color: AppColors.text, fontSize: 16, letterSpacing: 1,
    outlineStyle: 'none' as any,
  },
  dateBtn: { paddingVertical: 11, paddingHorizontal: 18, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dateBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  sectionTitle: { color: AppColors.text, fontSize: 16, fontWeight: '600' },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: AppColors.accent,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  editBtnText: { color: AppColors.accent, fontSize: 13, fontWeight: '500' },

  divider: { height: 1, backgroundColor: AppColors.hairline, width: '100%' },

  section: {
    backgroundColor: AppColors.tile,
    borderWidth: 1, borderColor: AppColors.tileBorder,
    borderRadius: 16, padding: 16, gap: 12,
  },

  bioRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  bioRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  bioLabel:   { color: AppColors.text, fontSize: 15, fontWeight: '500' },
  bioHint:    { color: AppColors.textMuted, fontSize: 12 },
  bioToggle: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: AppColors.screen,
    borderWidth: 1, borderColor: AppColors.tileBorder,
    minWidth: 52, alignItems: 'center',
  },
  bioToggleOn: {
    backgroundColor: AppColors.meetings,
    borderColor: AppColors.meetings,
  },
  bioToggleText: { color: AppColors.text, fontSize: 13, fontWeight: '700' },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1, borderColor: '#F2616B44',
    borderRadius: 12, paddingVertical: 14,
  },
  signOutText: { color: '#F2616B', fontSize: 15, fontWeight: '600' },
});
