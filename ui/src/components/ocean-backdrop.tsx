import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, StyleSheet, View } from 'react-native';

const W = Dimensions.get('window').width;
const H = Dimensions.get('window').height;

// A single light shaft — tall skinny gradient, skewed
function LightShaft({ left, width, skewX, opacity }: {
  left: number; width: number; skewX: string; opacity: number;
}) {
  return (
    <LinearGradient
      colors={['rgba(0,160,255,0.18)', 'rgba(0,120,220,0.06)', 'transparent']}
      locations={[0, 0.55, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{
        position: 'absolute',
        top: 0,
        left,
        width,
        height: H * 0.55,
        opacity,
        transform: [{ skewX }],
      }}
    />
  );
}

// Simple coral / sea-floor piece
function CoralPiece({ x, w, h, type }: {
  x: number; w: number; h: number; type: 'spike' | 'fan' | 'dome';
}) {
  if (type === 'spike') {
    return (
      <View style={{
        position: 'absolute', bottom: 0, left: x - w / 2,
        width: 0, height: 0,
        borderStyle: 'solid',
        borderLeftWidth: w / 2, borderRightWidth: w / 2, borderBottomWidth: h,
        borderLeftColor: 'transparent', borderRightColor: 'transparent',
        borderBottomColor: '#000c1e',
      }} />
    );
  }
  if (type === 'fan') {
    return (
      <View style={{
        position: 'absolute', bottom: h * 0.4, left: x - w / 2,
        width: w, height: h * 0.7,
        backgroundColor: '#000c1e',
        borderRadius: w / 2,
      }} />
    );
  }
  // dome
  return (
    <View style={{
      position: 'absolute', bottom: 0, left: x - w / 2,
      width: w, height: h * 0.5,
      backgroundColor: '#000c1e',
      borderTopLeftRadius: w / 2,
      borderTopRightRadius: w / 2,
    }} />
  );
}

const CORAL: { x: number; w: number; h: number; type: 'spike' | 'fan' | 'dome' }[] = [
  { x: 12,  w: 10, h: 55, type: 'spike' }, { x: 20,  w: 14, h: 40, type: 'spike' },
  { x: 32,  w: 8,  h: 65, type: 'spike' }, { x: 40,  w: 30, h: 28, type: 'fan'   },
  { x: 58,  w: 12, h: 50, type: 'spike' }, { x: 68,  w: 8,  h: 38, type: 'spike' },
  { x: 80,  w: 36, h: 22, type: 'dome'  }, { x: 100, w: 10, h: 60, type: 'spike' },
  { x: 112, w: 28, h: 30, type: 'fan'   }, { x: 130, w: 8,  h: 44, type: 'spike' },
  { x: 140, w: 12, h: 55, type: 'spike' }, { x: 155, w: 40, h: 20, type: 'dome'  },
  { x: 175, w: 8,  h: 48, type: 'spike' }, { x: 185, w: 10, h: 62, type: 'spike' },
  { x: 200, w: 32, h: 24, type: 'fan'   }, { x: 220, w: 8,  h: 45, type: 'spike' },
  { x: 232, w: 12, h: 58, type: 'spike' }, { x: 248, w: 36, h: 26, type: 'dome'  },
  { x: 268, w: 10, h: 52, type: 'spike' }, { x: 280, w: 8,  h: 40, type: 'spike' },
  { x: 292, w: 28, h: 30, type: 'fan'   }, { x: 312, w: 12, h: 60, type: 'spike' },
  { x: 326, w: 8,  h: 46, type: 'spike' }, { x: 338, w: 38, h: 22, type: 'dome'  },
  { x: 358, w: 10, h: 54, type: 'spike' }, { x: 370, w: 8,  h: 38, type: 'spike' },
  { x: 382, w: 12, h: 62, type: 'spike' },
];

export function OceanBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Deep ocean gradient */}
      <LinearGradient
        colors={['#000a18', '#001428', '#002040', '#002850', '#001e3c', '#001028', '#000810']}
        locations={[0, 0.15, 0.3, 0.45, 0.6, 0.8, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Bioluminescent glow — soft teal radial at mid-depth */}
      <LinearGradient
        colors={['transparent', 'rgba(0,120,200,0.08)', 'transparent']}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFill, { opacity: 0.7 }]}
        pointerEvents="none"
      />

      {/* Light shafts from the surface */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LightShaft left={W * 0.35} width={70} skewX="-8deg" opacity={0.9} />
        <LightShaft left={W * 0.55} width={45} skewX="5deg"  opacity={0.7} />
        <LightShaft left={W * 0.14} width={55} skewX="12deg" opacity={0.6} />
        <LightShaft left={W * 0.72} width={35} skewX="-4deg" opacity={0.5} />
      </View>

      {/* Surface shimmer at very top */}
      <LinearGradient
        colors={['rgba(0,180,255,0.0)', 'rgba(100,220,255,0.40)', 'rgba(0,180,255,0.0)']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={s.surface}
        pointerEvents="none"
      />

      {/* Coral / seafloor silhouettes */}
      <View style={s.coralRow} pointerEvents="none">
        {CORAL.map((c, i) => <CoralPiece key={i} {...c} />)}
      </View>

      {/* Dark seafloor fade */}
      <LinearGradient
        colors={['transparent', 'rgba(0,8,20,0.85)', '#000508']}
        locations={[0, 0.45, 1]}
        style={s.floor}
        pointerEvents="none"
      />
    </View>
  );
}

const s = StyleSheet.create({
  surface:  { position: 'absolute', top: 0, left: 0, right: 0, height: 5 },
  coralRow: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
  floor:    { position: 'absolute', bottom: 0, left: 0, right: 0, height: 55 },
});
