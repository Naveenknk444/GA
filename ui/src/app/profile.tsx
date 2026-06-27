import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DesertBackdrop } from '@/components/desert-backdrop';
import { AppColors } from '@/constants/appTheme';
import { useAuth } from '@/context/auth';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const { user, shortId, loading } = useAuth();

  // Member ID (custom handle the user can change)
  const [handle, setHandle] = useState('');
  const [savedHandle, setSavedHandle] = useState('');
  const [savingHandle, setSavingHandle] = useState(false);
  const [editingHandle, setEditingHandle] = useState(false);

  // Recovery phrase (treated as a password)
  const [phrase, setPhrase] = useState('');
  const [savedPhrase, setSavedPhrase] = useState<string | null>(null);
  const [savingPhrase, setSavingPhrase] = useState(false);
  const [showPhrase, setShowPhrase] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('handle, recovery_phrase')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        const h = data?.handle ?? ('Member ' + shortId);
        setHandle(h);
        setSavedHandle(h);
        if (data?.recovery_phrase) {
          setSavedPhrase(data.recovery_phrase);
          setPhrase(data.recovery_phrase);
        }
      });
  }, [user]);

  async function saveHandle() {
    if (!user || !handle.trim()) return;
    setSavingHandle(true);
    const { error } = await supabase
      .from('profiles')
      .update({ handle: handle.trim() })
      .eq('id', user.id);
    setSavingHandle(false);
    if (error) {
      Alert.alert('Error', 'Could not update Member ID.');
    } else {
      setSavedHandle(handle.trim());
      setEditingHandle(false);
    }
  }

  async function savePhrase() {
    if (!user || !phrase.trim() || !shortId) return;
    setSavingPhrase(true);

    // 1. Save the phrase to the profiles table.
    const { error: dbError } = await supabase
      .from('profiles')
      .update({ recovery_phrase: phrase.trim() })
      .eq('id', user.id);

    // 2. Link real credentials to this anonymous account so recovery works on new devices.
    //    We use shortId@recovery.ga as a pseudo-email — no real email is ever sent.
    const { error: authError } = await supabase.auth.updateUser({
      email: `${shortId}@recovery.ga`,
      password: phrase.trim(),
    });

    setSavingPhrase(false);
    if (dbError || authError) {
      Alert.alert('Error', authError?.message ?? 'Could not save recovery password.');
    } else {
      setSavedPhrase(phrase.trim());
    }
  }

  async function confirmSignOut() {
    const warning = savedPhrase
      ? 'You will be signed out. Use your Member ID and recovery password to sign back in.'
      : 'Warning: no recovery password set. You will not be able to get this account back.';

    if (Platform.OS === 'web') {
      const ok = window.confirm(`Sign Out?\n\n${warning}`);
      if (!ok) return;
      await supabase.auth.signOut();
    } else {
      Alert.alert('Sign Out', warning, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => supabase.auth.signOut() },
      ]);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={{ color: AppColors.textMuted }}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <DesertBackdrop variant="band" height={180} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Text style={styles.screenTitle}>Profile</Text>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Member ID card */}
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color={AppColors.accent} />
            </View>
            <Text style={styles.memberLabel}>Member ID</Text>

            {editingHandle ? (
              // Edit mode
              <View style={styles.editRow}>
                <TextInput
                  value={handle}
                  onChangeText={setHandle}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  style={styles.handleInput}
                  placeholderTextColor={AppColors.textMuted}
                />
                <Pressable
                  onPress={saveHandle}
                  disabled={savingHandle || !handle.trim() || handle.trim() === savedHandle}
                  style={[styles.smallBtn, { backgroundColor: AppColors.accent }]}>
                  <Text style={styles.smallBtnText}>{savingHandle ? '…' : 'Save'}</Text>
                </Pressable>
                <Pressable
                  onPress={() => { setHandle(savedHandle); setEditingHandle(false); }}
                  style={[styles.smallBtn, { backgroundColor: AppColors.tile }]}>
                  <Text style={[styles.smallBtnText, { color: AppColors.textMuted }]}>Cancel</Text>
                </Pressable>
              </View>
            ) : (
              // Display mode
              <Pressable onPress={() => setEditingHandle(true)} style={styles.handleRow}>
                <Text style={styles.handleText}>{savedHandle || ('Member ' + shortId)}</Text>
                <Ionicons name="pencil" size={16} color={AppColors.textMuted} />
              </Pressable>
            )}

            <Text style={styles.idHint}>Tap the pencil to change your Member ID.</Text>
          </View>

          {/* Recovery phrase — treated as a password */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Recovery Password</Text>
            <Text style={styles.sectionDesc}>
              Set a password only you know. Enter it here if you reinstall the app to recover your account.
            </Text>

            <View style={styles.passwordRow}>
              <TextInput
                value={phrase}
                onChangeText={setPhrase}
                placeholder="Set a recovery password"
                placeholderTextColor={AppColors.textMuted}
                style={[styles.input, { flex: 1 }]}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!showPhrase}
              />
              <Pressable onPress={() => setShowPhrase(v => !v)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPhrase ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={AppColors.textMuted}
                />
              </Pressable>
            </View>

            <Pressable
              onPress={savePhrase}
              disabled={savingPhrase || !phrase.trim() || phrase.trim() === savedPhrase}
              style={[styles.saveBtn, (savingPhrase || !phrase.trim() || phrase.trim() === savedPhrase) && styles.saveBtnDisabled]}>
              <Text style={styles.saveBtnText}>
                {savingPhrase ? 'Saving…' : savedPhrase ? 'Update Password' : 'Save Password'}
              </Text>
            </Pressable>

            {savedPhrase && (
              <View style={styles.savedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={AppColors.meetings} />
                <Text style={styles.savedText}>Recovery password saved</Text>
              </View>
            )}
          </View>

          {/* Sign out */}
          <Pressable onPress={confirmSignOut} style={styles.signOutBtn}>
            <Ionicons name="log-out-outline" size={18} color="#F2616B" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>

          {/* Anonymity note */}
          <View style={styles.note}>
            <Ionicons name="shield-checkmark" size={20} color={AppColors.talk} />
            <View style={{ flex: 1 }}>
              <Text style={styles.noteTitle}>You are anonymous.</Text>
              <Text style={styles.noteText}>
                No real name, email, or phone is ever collected.
              </Text>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.screen },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.screen },
  safe: { flex: 1, paddingHorizontal: 20 },
  screenTitle: { color: AppColors.text, fontSize: 24, fontWeight: '700', paddingTop: 12, marginBottom: 20 },
  scroll: { gap: 20, paddingBottom: 32 },

  card: {
    backgroundColor: AppColors.tile,
    borderWidth: 1, borderColor: AppColors.tileBorder,
    borderRadius: 18, padding: 18, gap: 10, alignItems: 'center',
  },
  avatar: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: AppColors.accent + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  memberLabel: { color: AppColors.textMuted, fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase' },

  handleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  handleText: { color: AppColors.text, fontSize: 22, fontWeight: '700' },

  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  handleInput: {
    flex: 1, height: 42,
    backgroundColor: AppColors.screen,
    borderWidth: 1, borderColor: AppColors.accent,
    borderRadius: 10, paddingHorizontal: 12,
    color: AppColors.text, fontSize: 15,
    outlineStyle: 'none' as any,
  },
  smallBtn: { height: 42, paddingHorizontal: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  smallBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  idHint: { color: AppColors.textMuted, fontSize: 12 },

  sectionTitle: { color: AppColors.text, fontSize: 16, fontWeight: '600', alignSelf: 'flex-start' },
  sectionDesc: { color: AppColors.textMuted, fontSize: 13, lineHeight: 19, alignSelf: 'flex-start' },

  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  input: {
    height: 48, backgroundColor: AppColors.screen,
    borderWidth: 1, borderColor: AppColors.hairline,
    borderRadius: 12, paddingHorizontal: 14,
    color: AppColors.text, fontSize: 15,
    outlineStyle: 'none' as any,
  },
  eyeBtn: { padding: 10 },

  saveBtn: {
    width: '100%', height: 46, backgroundColor: AppColors.accent,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  savedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  savedText: { color: AppColors.meetings, fontSize: 13 },

  note: {
    flexDirection: 'row', gap: 12,
    backgroundColor: AppColors.tile,
    borderWidth: 1, borderColor: AppColors.tileBorder,
    borderRadius: 14, padding: 14, alignItems: 'flex-start',
  },
  noteTitle: { color: AppColors.text, fontSize: 14, fontWeight: '600' },
  noteText: { color: AppColors.textMuted, fontSize: 13, marginTop: 2, lineHeight: 18 },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1, borderColor: '#F2616B44',
    borderRadius: 12, paddingVertical: 14,
  },
  signOutText: { color: '#F2616B', fontSize: 15, fontWeight: '600' },
});
