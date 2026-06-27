import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';

import { AuthProvider, useAuth } from '@/context/auth';
import { LoginScreen } from '@/components/login-screen';
import { AppColors } from '@/constants/appTheme';

const isWeb = Platform.OS === 'web';

export default function RootLayout() {
  return (
    <AuthProvider>
      <View style={styles.page}>
        <View style={styles.phone}>
          <AppGate />
        </View>
      </View>
    </AuthProvider>
  );
}

/**
 * Shows a spinner while auth loads, the login screen if no user,
 * or the full tab navigator once the user is signed in.
 */
function AppGate() {
  const { user, loading } = useAuth();

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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: AppColors.accent,
        tabBarInactiveTintColor: AppColors.textMuted,
        tabBarStyle: {
          backgroundColor: AppColors.tabBar,
          borderTopColor: AppColors.hairline,
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
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={size} color={color} />
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
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="compose" options={{ href: null }} />
      <Tabs.Screen name="meeting-detail" options={{ href: null }} />
      <Tabs.Screen name="post-detail" options={{ href: null }} />
    </Tabs>
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
});
