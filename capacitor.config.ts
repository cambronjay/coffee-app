import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "com.jaycambron.coffee",
  appName: "Coffee",
  loggingBehavior: "production",
  webDir: "www",
  bundledWebRuntime: false,
  backgroundColor: "#000000",
  plugins: {
    SplashScreen: {
      backgroundColor: "#000000",
      launchAutoHide: true,
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};
export default config;