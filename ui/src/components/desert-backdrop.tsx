import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppColors } from '@/constants/appTheme';

// Purely code-generated desert feel — warm amber/terracotta tones at ~10% opacity.
// No real photo: easy to read, light theme, works everywhere without an asset file.
export function DesertBackdrop({
  variant = 'band',
  height = 220,
}: {
  variant?: 'full' | 'band';
  height?: number;
}) {
  if (variant === 'full') {
    return (
      <View style={StyleSheet.absoluteFill}>
        {/* sky layer — subtle blue-amber at top */}
        <LinearGradient
          colors={['rgba(120,160,200,0.10)', 'rgba(196,140,80,0.08)', 'rgba(11,9,8,0.00)']}
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFill}
        />
        {/* horizon glow — terracotta at center */}
        <LinearGradient
          colors={['rgba(11,9,8,0.00)', 'rgba(180,90,40,0.08)', 'rgba(11,9,8,0.00)']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['rgba(196,140,80,0.10)', 'rgba(180,90,40,0.05)', 'rgba(11,9,8,0.00)']}
      locations={[0, 0.5, 1]}
      style={[styles.band, { height }]}
    />
  );
}

const styles = StyleSheet.create({
  band: { position: 'absolute', top: 0, left: 0, right: 0 },
});
