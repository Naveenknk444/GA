import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY_ENABLED  = 'ga_bio_enabled';
const KEY_USERNAME = 'ga_bio_username';
const KEY_PASSWORD = 'ga_bio_password';

// ── Device capability checks ───────────────────────────────────────────────────

export async function isBiometricSupported(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const [hasHardware, isEnrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);
  return hasHardware && isEnrolled;
}

// Returns 'Face ID', 'Touch ID', or 'Biometrics'
export async function getBiometricLabel(): Promise<string> {
  if (Platform.OS === 'web') return 'Biometrics';
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'Face ID';
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'Touch ID';
  return 'Biometrics';
}

// ── User preference ────────────────────────────────────────────────────────────

export async function isBiometricEnabled(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const val = await SecureStore.getItemAsync(KEY_ENABLED);
  return val === 'true';
}

export async function enableBiometric(): Promise<boolean> {
  const label = await getBiometricLabel();
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: `Confirm with ${label} to enable`,
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  });
  if (result.success) {
    await SecureStore.setItemAsync(KEY_ENABLED, 'true');
  }
  return result.success;
}

export async function disableBiometric(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEY_ENABLED),
    SecureStore.deleteItemAsync(KEY_USERNAME),
    SecureStore.deleteItemAsync(KEY_PASSWORD),
  ]);
}

// ── Credential store (called right after every successful password login) ──────

export async function saveCredentials(username: string, password: string): Promise<void> {
  if (Platform.OS === 'web') return;
  await Promise.all([
    SecureStore.setItemAsync(KEY_USERNAME, username),
    SecureStore.setItemAsync(KEY_PASSWORD, password),
  ]);
}

export async function getCredentials(): Promise<{ username: string; password: string } | null> {
  const [username, password] = await Promise.all([
    SecureStore.getItemAsync(KEY_USERNAME),
    SecureStore.getItemAsync(KEY_PASSWORD),
  ]);
  if (!username || !password) return null;
  return { username, password };
}

// ── Authenticate and return stored credentials ─────────────────────────────────

export async function authenticateAndGetCredentials(): Promise<{ username: string; password: string } | null> {
  const label = await getBiometricLabel();
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: `Sign in with ${label}`,
    cancelLabel: 'Use password instead',
    disableDeviceFallback: false,
  });
  if (!result.success) return null;
  return getCredentials();
}
