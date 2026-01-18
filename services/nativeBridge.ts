// Utility to check if running in a Capacitor Native environment
export const isNative = (): boolean => {
  return typeof window !== 'undefined' && 
         !!(window as any).Capacitor && 
         (window as any).Capacitor.isNativePlatform();
};

export const getPlatform = (): string => {
  if (typeof window !== 'undefined' && (window as any).Capacitor) {
    return (window as any).Capacitor.getPlatform();
  }
  return 'web';
};