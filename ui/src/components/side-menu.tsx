import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchProfile } from '@/api/profile';
import { AppColors } from '@/constants/appTheme';
import { useAuth } from '@/context/auth';
import { useDrawer } from '@/context/drawer';
import { supabase } from '@/lib/supabase';

const NAV_ITEMS = [
  { label: 'Home',     icon: 'home',       route: '/'         },
  { label: 'Talk',     icon: 'chatbubble', route: '/talk'     },
  { label: 'Meetings', icon: 'calendar',   route: '/meetings' },
  { label: 'Recovery', icon: 'leaf',       route: '/recovery' },
  { label: 'Profile',  icon: 'person',     route: '/profile'  },
] as const;

export function SideMenu() {
  const { close }        = useDrawer();
  const { user, shortId } = useAuth();
  const router           = useRouter();
  const pathname         = usePathname();

  const [handle, setHandle]     = useState('');
  const [cleanDays, setCleanDays] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id).then(p => {
      setHandle(p?.handle ?? 'Member ' + shortId);
      if (p?.clean_date) {
        const days = Math.floor((Date.now() - new Date(p.clean_date).getTime()) / 86400000);
        setCleanDays(Math.max(0, days));
      }
    });
  }, [user]);

  function navigate(route: string) {
    router.push(route as any);
    close();
  }

  async function signOut() {
    close();
    await supabase.auth.signOut();
  }

  function isActive(route: string) {
    return route === '/' ? pathname === '/' : pathname.startsWith(route);
  }

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

        {/* ── Profile block ── */}
        <View style={s.profileBlock}>
          <View style={s.avatar}>
            <Ionicons name="person" size={26} color={AppColors.accent} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={s.handle} numberOfLines={1}>{handle || '…'}</Text>
            {cleanDays !== null && (
              <View style={s.badgeRow}>
                <Ionicons name="leaf" size={11} color={AppColors.meetings} />
                <Text style={s.badgeText}>{cleanDays} days clean</Text>
              </View>
            )}
          </View>
        </View>

        <View style={s.divider} />

        {/* ── Navigation ── */}
        {NAV_ITEMS.map(item => {
          const active = isActive(item.route);
          return (
            <Pressable key={item.label} onPress={() => navigate(item.route)}
              style={({ pressed }) => [s.navItem, active && s.navItemActive, pressed && { opacity: 0.7 }]}>
              {active && <View style={s.activeBorder} />}
              <Ionicons
                name={(active ? item.icon : item.icon + '-outline') as any}
                size={20}
                color={active ? AppColors.accent : AppColors.text}
              />
              <Text style={[s.navLabel, active && s.navLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}

        <View style={s.divider} />

        {/* ── Tools ── */}
        <Text style={s.sectionLabel}>TOOLS</Text>
        <Pressable
          onPress={() => navigate('/checklist')}
          style={({ pressed }) => [
            s.navItem,
            isActive('/checklist') && s.navItemActive,
            pressed && { opacity: 0.7 },
          ]}>
          {isActive('/checklist') && <View style={s.activeBorder} />}
          <Ionicons
            name={isActive('/checklist') ? 'checkbox' : 'checkbox-outline'}
            size={20}
            color={isActive('/checklist') ? AppColors.accent : AppColors.text}
          />
          <Text style={[s.navLabel, isActive('/checklist') && { color: AppColors.accent, fontWeight: '700' }]}>
            Daily Checklist
          </Text>
        </Pressable>

        <View style={s.divider} />
        <Pressable
          onPress={() => navigate('/twelve-step')}
          style={({ pressed }) => [
            s.navItem,
            isActive('/twelve-step') && s.navItemActive,
            pressed && { opacity: 0.7 },
          ]}>
          {isActive('/twelve-step') && <View style={s.activeBorder} />}
          <Ionicons
            name={isActive('/twelve-step') ? 'book' : 'book-outline'}
            size={20}
            color={isActive('/twelve-step') ? AppColors.recovery : AppColors.text}
          />
          <Text style={[s.navLabel, isActive('/twelve-step') && { color: AppColors.recovery, fontWeight: '700' }]}>
            12 Step Program
          </Text>
        </Pressable>

        <View style={s.divider} />
        <Pressable
          onPress={() => navigate('/pressure-relief')}
          style={({ pressed }) => [
            s.navItem,
            isActive('/pressure-relief') && s.navItemActive,
            pressed && { opacity: 0.7 },
          ]}>
          {isActive('/pressure-relief') && <View style={s.activeBorder} />}
          <Ionicons
            name={isActive('/pressure-relief') ? 'wallet' : 'wallet-outline'}
            size={20}
            color={isActive('/pressure-relief') ? '#E0A53E' : AppColors.text}
          />
          <Text style={[s.navLabel, isActive('/pressure-relief') && { color: '#E0A53E', fontWeight: '700' }]}>
            Pressure Relief Group
          </Text>
        </Pressable>

        <View style={s.divider} />

        <Pressable
          onPress={() => navigate('/telephone-list')}
          style={({ pressed }) => [
            s.navItem,
            isActive('/telephone-list') && s.navItemActive,
            pressed && { opacity: 0.7 },
          ]}>
          {isActive('/telephone-list') && <View style={s.activeBorder} />}
          <Ionicons
            name={isActive('/telephone-list') ? 'call' : 'call-outline'}
            size={20}
            color={isActive('/telephone-list') ? AppColors.accent : AppColors.text}
          />
          <Text style={[s.navLabel, isActive('/telephone-list') && { color: AppColors.accent, fontWeight: '700' }]}>
            Telephone List
          </Text>
        </Pressable>

        <View style={s.divider} />

        <Pressable
          onPress={() => navigate('/schedule')}
          style={({ pressed }) => [
            s.navItem,
            isActive('/schedule') && s.navItemActive,
            pressed && { opacity: 0.7 },
          ]}>
          {isActive('/schedule') && <View style={s.activeBorder} />}
          <Ionicons
            name={isActive('/schedule') ? 'calendar-number' : 'calendar-number-outline'}
            size={20}
            color={isActive('/schedule') ? AppColors.accent : AppColors.text}
          />
          <Text style={[s.navLabel, isActive('/schedule') && { color: AppColors.accent, fontWeight: '700' }]}>
            Schedule
          </Text>
        </Pressable>

        <View style={s.divider} />

        <Pressable
          onPress={() => navigate('/daily-reading')}
          style={({ pressed }) => [
            s.navItem,
            isActive('/daily-reading') && s.navItemActive,
            pressed && { opacity: 0.7 },
          ]}>
          {isActive('/daily-reading') && <View style={s.activeBorder} />}
          <Ionicons
            name={isActive('/daily-reading') ? 'book' : 'book-outline'}
            size={20}
            color={isActive('/daily-reading') ? AppColors.accent : AppColors.text}
          />
          <Text style={[s.navLabel, isActive('/daily-reading') && { color: AppColors.accent, fontWeight: '700' }]}>
            Daily Reading
          </Text>
        </Pressable>

        <View style={s.divider} />

        {/* ── GA Hotline ── */}
        <Pressable onPress={() => Linking.openURL('tel:18005224700')}
          style={({ pressed }) => [s.navItem, pressed && { opacity: 0.7 }]}>
          <Ionicons name="call" size={20} color={AppColors.meetings} />
          <View style={{ flex: 1 }}>
            <Text style={[s.navLabel, { color: AppColors.meetings }]}>GA Helpline</Text>
            <Text style={s.navSub}>1-800-522-4700 · Free & 24/7</Text>
          </View>
        </Pressable>

        <View style={s.divider} />

        {/* ── About ── */}
        <Pressable onPress={() => WebBrowser.openBrowserAsync('https://www.gamblersanonymous.org')}
          style={({ pressed }) => [s.navItem, pressed && { opacity: 0.7 }]}>
          <Ionicons name="information-circle-outline" size={20} color={AppColors.textMuted} />
          <Text style={[s.navLabel, { color: AppColors.textMuted }]}>About GA</Text>
        </Pressable>
        <Text style={s.version}>Recovery Community v1.0.0</Text>

        <View style={{ flex: 1 }} />

        <View style={s.divider} />

        {/* ── Sign out ── */}
        <Pressable onPress={signOut}
          style={({ pressed }) => [s.navItem, pressed && { opacity: 0.7 }]}>
          <Ionicons name="log-out-outline" size={20} color="#F2616B" />
          <Text style={[s.navLabel, { color: '#F2616B' }]}>Sign Out</Text>
        </Pressable>

      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'rgba(1,5,15,0.94)' },
  safe: { flex: 1, paddingTop: 4 },

  profileBlock: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingVertical: 20,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: AppColors.accent + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  handle: { color: AppColors.text, fontSize: 16, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeText: { color: AppColors.meetings, fontSize: 12, fontWeight: '500' },

  divider: { height: 1, backgroundColor: AppColors.hairline, marginVertical: 6 },

  navItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingVertical: 14, position: 'relative',
  },
  navItemActive: { backgroundColor: AppColors.accent + '12' },
  activeBorder: {
    position: 'absolute', left: 0, top: 6, bottom: 6,
    width: 3, borderRadius: 2, backgroundColor: AppColors.accent,
  },
  navLabel: { color: AppColors.text, fontSize: 15, fontWeight: '500' },
  navLabelActive: { color: AppColors.accent, fontWeight: '700' },
  navSub: { color: AppColors.textMuted, fontSize: 11, marginTop: 1 },

  sectionLabel: {
    color: AppColors.textMuted, fontSize: 10, fontWeight: '700',
    letterSpacing: 0.8, textTransform: 'uppercase',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 2,
  },
  version: {
    color: AppColors.textMuted, fontSize: 11,
    paddingHorizontal: 20, paddingTop: 4, paddingBottom: 10,
  },
});
