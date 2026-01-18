import { isNative } from './nativeBridge';

// Capacitor AdMob Plugin Wrapper
// Note: In a real environment, you'd use the typed @capacitor-community/admob package.
// We use the dynamic window access to remain compatible with the environment.

export const initAdMob = async () => {
  if (!isNative()) return;
  
  try {
    const { AdMob } = (window as any).Capacitor.Plugins;
    if (AdMob) {
      await AdMob.initialize();
    }
  } catch (e) {
    console.error('AdMob initialization failed', e);
  }
};

/**
 * Shows a banner ad and sets up listeners to notify the app if it succeeds or fails.
 */
export const showBannerAd = async (onVisibilityChange?: (visible: boolean) => void) => {
  if (!isNative()) return;

  try {
    const { AdMob } = (window as any).Capacitor.Plugins;
    if (AdMob) {
      const isIos = (window as any).Capacitor.getPlatform() === 'ios';
      
      // Remove existing listeners before adding new ones
      await AdMob.removeAllListeners();

      // Listen for successful load
      AdMob.addListener('bannerAdLoaded', () => {
        console.log('Banner Ad Loaded Successfully');
        if (onVisibilityChange) onVisibilityChange(true);
      });

      // Listen for failures
      AdMob.addListener('bannerAdFailedToLoad', (error: any) => {
        console.error('Banner Ad Failed to Load:', error);
        if (onVisibilityChange) onVisibilityChange(false);
      });

      await AdMob.showBanner({
        adId: isIos 
          ? 'ca-app-pub-3940256099942544/2934735716' // Test ID for iOS
          : 'ca-app-pub-9976310659494116/4237033913', // Production Android ID
        position: 'BOTTOM_CENTER',
        size: 'ADAPTIVE_BANNER',
        margin: 0,
        isTesting: isIos // Only testing on iOS
      });
    }
  } catch (e) {
    console.error('Failed to initiate banner ad request', e);
    if (onVisibilityChange) onVisibilityChange(false);
  }
};

/**
 * Prepares and shows an Interstitial Ad.
 */
export const showInterstitialAd = async () => {
  if (!isNative()) return;

  try {
    const { AdMob } = (window as any).Capacitor.Plugins;
    if (AdMob) {
      const isIos = (window as any).Capacitor.getPlatform() === 'ios';
      
      // 1. Prepare/Load
      await AdMob.prepareInterstitial({
        adId: isIos
          ? 'ca-app-pub-3940256099942544/4411468910' // Test ID for iOS
          : 'ca-app-pub-9976310659494116/8631558588', // Production Android ID
        isTesting: isIos
      });
      
      // 2. Show
      await AdMob.showInterstitial();
    }
  } catch (e) {
    console.warn('Interstitial ad not ready or failed to show', e);
  }
};

export const hideBannerAd = async () => {
  if (!isNative()) return;
  
  try {
    const { AdMob } = (window as any).Capacitor.Plugins;
    if (AdMob) {
      await AdMob.removeBanner();
    }
  } catch (e) {
    console.error('Failed to hide banner ad', e);
  }
};