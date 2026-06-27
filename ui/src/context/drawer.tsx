import { createContext, useContext, useRef, useState } from 'react';
import { Animated } from 'react-native';

export const DRAWER_WIDTH = 270;

type DrawerCtx = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  drawerAnim: Animated.Value;
  contentAnim: Animated.Value;
};

const DrawerContext = createContext<DrawerCtx>({} as DrawerCtx);

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const drawerAnim  = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  const SPRING = { useNativeDriver: true, friction: 9, tension: 80 } as const;

  function open() {
    setIsOpen(true);
    Animated.parallel([
      Animated.spring(drawerAnim,  { toValue: 0,             ...SPRING }),
      Animated.spring(contentAnim, { toValue: DRAWER_WIDTH,  ...SPRING }),
    ]).start();
  }

  function close() {
    Animated.parallel([
      Animated.spring(drawerAnim,  { toValue: -DRAWER_WIDTH, ...SPRING }),
      Animated.spring(contentAnim, { toValue: 0,             ...SPRING }),
    ]).start(() => setIsOpen(false));
  }

  function toggle() { isOpen ? close() : open(); }

  return (
    <DrawerContext.Provider value={{ isOpen, open, close, toggle, drawerAnim, contentAnim }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() { return useContext(DrawerContext); }
