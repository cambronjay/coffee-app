import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "com.jaycambron.coffeeme",
  appName: "CoffeeMe",
  loggingBehavior: "production",
  webDir: "www",
  bundledWebRuntime: false,
  backgroundColor: "#000000",
  plugins: {
    SplashScreen: {
      backgroundColor: "#000000",
      launchAutoHide: false,
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};
export default config;