import { StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/appTheme';

/** Simple themed placeholder used by tabs we haven't built yet. */
export function ComingSoon({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.screen,
    padding: 24,
    gap: 8,
  },
  title: { color: AppColors.text, fontSize: 24, fontWeight: '700' },
  subtitle: { color: AppColors.textMuted, fontSize: 15, textAlign: 'center' },
});
