import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.summerproject.secureremit',
  appName: 'secureremit',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,      
      launchAutoHide: true,         
      androidShowIcon: false,       
      showSpinner: false            
    }
  }
};

export default config;