import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, StyleSheet, View } from 'react-native';

const W = Dimensions.get('window').width;

// One rotated aurora band — a wide gradient strip laid diagonally
function AuroraBand({
  top, height, rotate, colors, locations,
}: {
  top: number; height: number; rotate: string;
  colors: string[]; locations: number[];
}) {
  const bw = W * 1.7;
  return (
    <LinearGradient
      colors={colors as any}
      locations={locations}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{
        position: 'absolute',
        top,
        left: -(bw - W) / 2,
        width: bw,
        height,
        transform: [{ rotate }],
      }}
    />
  );
}

// Conifer tree as CSS border triangle (pointing up)
function Tree({ x, w, h }: { x: number; w: number; h: number }) {
  return (
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: x - w / 2,
      width: 0, height: 0,
      borderStyle: 'solid',
      borderLeftWidth: w / 2,
      borderRightWidth: w / 2,
      borderBottomWidth: h,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: '#010508',
    }} />
  );
}

const TREES = [
  { x: 8,   w: 22, h: 60 }, { x: 22,  w: 18, h: 48 }, { x: 35,  w: 26, h: 75 },
  { x: 52,  w: 20, h: 55 }, { x: 65,  w: 16, h: 42 }, { x: 76,  w: 24, h: 68 },
  { x: 92,  w: 18, h: 50 }, { x: 105, w: 22, h: 62 }, { x: 120, w: 16, h: 38 },
  { x: 130, w: 26, h: 72 }, { x: 148, w: 20, h: 55 }, { x: 162, w: 18, h: 45 },
  { x: 175, w: 14, h: 36 }, { x: 185, w: 22, h: 58 }, { x: 200, w: 18, h: 48 },
  { x: 215, w: 16, h: 40 }, { x: 228, w: 24, h: 66 }, { x: 244, w: 20, h: 52 },
  { x: 258, w: 18, h: 44 }, { x: 270, w: 26, h: 70 }, { x: 288, w: 20, h: 55 },
  { x: 302, w: 16, h: 40 }, { x: 314, w: 24, h: 64 }, { x: 330, w: 18, h: 48 },
  { x: 342, w: 22, h: 60 }, { x: 358, w: 16, h: 42 }, { x: 368, w: 24, h: 68 },
  { x: 382, w: 18, h: 50 },
];

export function AuroraBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Deep night sky */}
      <LinearGradient
        colors={['#010408', '#020912', '#041220', '#020a14', '#010408']}
        locations={[0, 0.3, 0.55, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Aurora bands — green, teal, purple */}
      <View style={s.auroraZone} pointerEvents="none">
        <AuroraBand
          top={20} height={220} rotate="-8deg"
          colors={['transparent','rgba(0,220,120,0.18)','rgba(0,255,140,0.24)','rgba(0,220,120,0.18)','transparent']}
          locations={[0, 0.25, 0.5, 0.75, 1]}
        />
        <AuroraBand
          top={80} height={180} rotate="-5deg"
          colors={['transparent','rgba(40,180,220,0.14)','rgba(0,200,255,0.20)','rgba(40,180,220,0.14)','transparent']}
          locations={[0, 0.25, 0.5, 0.75, 1]}
        />
        <AuroraBand
          top={10} height={160} rotate="-12deg"
          colors={['transparent','rgba(100,40,220,0.10)','rgba(140,0,255,0.14)','rgba(100,40,220,0.10)','transparent']}
          locations={[0, 0.25, 0.5, 0.75, 1]}
        />
        <AuroraBand
          top={50} height={140} rotate="4deg"
          colors={['transparent','rgba(0,255,160,0.08)','rgba(0,220,120,0.12)','rgba(0,255,160,0.08)','transparent']}
          locations={[0, 0.25, 0.5, 0.75, 1]}
        />
      </View>

      {/* Tree silhouettes */}
      <View style={s.treeRow} pointerEvents="none">
        {TREES.map((t, i) => <Tree key={i} {...t} />)}
      </View>

      {/* Fade to dark at the very bottom */}
      <LinearGradient
        colors={['transparent', 'rgba(1,4,8,0.8)', '#010408']}
        locations={[0, 0.5, 1]}
        style={s.ground}
        pointerEvents="none"
      />
    </View>
  );
}

const s = StyleSheet.create({
  auroraZone: { position: 'absolute', top: 0, left: 0, right: 0, height: '65%', overflow: 'hidden' },
  treeRow:    { position: 'absolute', bottom: 0, left: 0, right: 0, height: 85 },
  ground:     { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
});
