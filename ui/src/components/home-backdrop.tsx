import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { AuroraBackdrop } from './aurora-backdrop';
import { OceanBackdrop }  from './ocean-backdrop';

// Even hours (0,2,4,6...) → Aurora
// Odd  hours (1,3,5,7...) → Ocean
function isOceanHour(h: number) { return h % 2 !== 0; }

export function HomeBackdrop() {
  const [hour, setHour] = useState(new Date().getHours());
  const fadeAnim = useRef(new Animated.Value(isOceanHour(new Date().getHours()) ? 1 : 0)).current;

  // Sync to the real clock — check every minute so we never miss an hour boundary
  useEffect(() => {
    function update() {
      setHour(new Date().getHours());
    }

    const now            = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000;

    const timeoutId = setTimeout(() => {
      update();
      const intervalId = setInterval(update, 60_000);
      return () => clearInterval(intervalId);
    }, msToNextMinute);

    return () => clearTimeout(timeoutId);
  }, []);

  // Crossfade whenever the hour crosses even ↔ odd
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue:        isOceanHour(hour) ? 1 : 0,
      duration:       1800,
      useNativeDriver: true,
    }).start();
  }, [hour]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Aurora — visible when fadeAnim → 0 */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>
        <AuroraBackdrop />
      </Animated.View>

      {/* Ocean — visible when fadeAnim → 1 */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
        <OceanBackdrop />
      </Animated.View>
    </View>
  );
}
