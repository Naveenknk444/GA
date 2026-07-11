import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Animated, Platform, Pressable, StyleSheet, View } from 'react-native';

import { AuthProvider, useAuth } from '@/context/auth';
import { DrawerProvider, DRAWER_WIDTH, useDrawer } from '@/context/drawer';
import { LoginScreen } from '@/components/login-screen';
import { SideMenu } from '@/components/side-menu';
import { DailyReadingModal } from '@/components/daily-reading-modal';
import { AppColors } from '@/constants/appTheme';
import { HomeBackdrop } from '@/components/home-backdrop';

const isWeb = Platform.OS === 'web';

export default function RootLayout() {
  return (
    <AuthProvider>
      <View style={styles.page}>
        <View style={styles.phone}>
          <HomeBackdrop />
          <DrawerProvider>
            <DrawerLayout />
          </DrawerProvider>
        </View>
      </View>
    </AuthProvider>
  );
}

function DrawerLayout() {
  const { drawerAnim, contentAnim, isOpen, close } = useDrawer();

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
      {/* Drawer panel — slides in from the left */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]}>
        <SideMenu />
      </Animated.View>

      {/* Main content — pushed right when drawer opens */}
      <Animated.View style={{ flex: 1, transform: [{ translateX: contentAnim }] }}>
        <AppGate />
        {/* Invisible tap-to-close overlay when drawer is open */}
        {isOpen && <Pressable style={StyleSheet.absoluteFill} onPress={close} />}
      </Animated.View>
    </View>
  );
}

function AppGate() {
  const { user, loading } = useAuth();
  const [showDailyReading, setShowDailyReading] = useState(true);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={AppColors.accent} size="large" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const now = new Date();

  return (
    <>
      <Tabs
        screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: AppColors.accent,
        tabBarInactiveTintColor: AppColors.textMuted,
        tabBarStyle: {
          backgroundColor: 'rgba(1,5,15,0.90)',
          borderTopColor: 'rgba(255,255,255,0.08)',
          borderTopWidth: 1,
          height: 86,
          paddingTop: 10,
          paddingBottom: 24,
          position: 'relative',
        },
        tabBarLabelStyle: { fontSize: 11, marginTop: 2 },
        sceneStyle: { backgroundColor: AppColors.screen },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="talk"
        options={{
          title: 'Talk',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'chatbubble' : 'chatbubble-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="meetings"
        options={{
          title: 'Meetings',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recovery"
        options={{
          title: 'Recovery',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'leaf' : 'leaf-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="compose" options={{ href: null }} />
      <Tabs.Screen name="meeting-detail" options={{ href: null }} />
      <Tabs.Screen name="post-detail" options={{ href: null }} />
      <Tabs.Screen name="pressure-relief" options={{ href: null }} />
      <Tabs.Screen name="schedule" options={{ href: null }} />
      <Tabs.Screen name="daily-reading" options={{ href: null }} />
      <Tabs.Screen name="telephone-list" options={{ href: null }} />
      <Tabs.Screen name="checklist" options={{ href: null }} />
      <Tabs.Screen name="db-schema" options={{ href: null }} />
    </Tabs>

      {showDailyReading && (
        <DailyReadingModal
          year={now.getFullYear()}
          month={now.getMonth() + 1}
          day={now.getDate()}
          userId={user.id}
          onClose={() => setShowDailyReading(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: isWeb ? '#000000' : AppColors.screen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phone: isWeb
    ? {
        width: 390,
        maxWidth: '100%',
        height: '100%',
        maxHeight: 844,
        backgroundColor: AppColors.screen,
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#1c1c1f',
      }
    : { flex: 1, width: '100%' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.screen },
  drawer: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: DRAWER_WIDTH,
    zIndex: 100,
    borderRightWidth: 1,
    borderRightColor: AppColors.hairline,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 24,
  },
});
