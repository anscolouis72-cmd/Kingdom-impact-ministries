# Mobile App Setup - Kingdom Impact Ministries

Your web app is now configured to build as native iOS and Android apps using Capacitor.

## What Was Added (Web App Unchanged)

✅ **public/manifest.json** - PWA app configuration  
✅ **public/service-worker.js** - Offline support  
✅ **index.html** - Added manifest link + service worker registration  
✅ **package.json** - Added mobile build commands  

## Quick Build Commands

### Generate native projects (if not existing)
```bash
npx cap add ios
npx cap add android
```

### Build web, then sync to native projects
```bash
npm run build
npx cap sync
```

### Open and edit iOS project
```bash
npm run mobile:ios
```

### Open and edit Android project
```bash
npm run mobile:android
```

## Full Build Workflow

### Step 1: Build Web App
```bash
npm run build
```

### Step 2: Generate iOS App (Mac only)
```bash
npx cap add ios
npm run mobile:ios
```

In Xcode:
- Select simulator or device
- Click Play button to build and run

### Step 3: Generate Android App
```bash
npx cap add android
npm run mobile:android
```

In Android Studio:
- Let Gradle sync
- Select emulator or device
- Click Run (green play icon)

## After Making Web Changes

1. Rebuild web app: `npm run build`
2. Sync to native: `npx cap sync`
3. Rebuild native app and re-run in Xcode/Android Studio

## App Store Submission

### iOS (App Store)
```bash
# In Xcode:
# - Select "Any iOS Device (arm64)" scheme
# - Product → Archive
# - Follow App Store Connect submission
```

### Android (Google Play)
```bash
# In Android Studio:
# - Build → Generate Signed APK/AAB
# - Follow Google Play Console submission
```

## Features Enabled

✅ **Offline Support** - Service worker caches pages  
✅ **PWA Ready** - Installable on Android home screen  
✅ **Capacitor** - Native iOS and Android apps  
✅ **Web Code Reuse** - One codebase for web + mobile  

## Useful Capacitor Commands

```bash
# Update Capacitor dependencies
npx cap update

# Sync web assets without reinstalling
npx cap sync

# Run on device/emulator
npx cap run ios
npx cap run android

# Open native projects
npx cap open ios
npx cap open android

# Build and copy assets
npx cap copy
```

## File Locations

- Web build output: `dist/` (used by Capacitor)
- iOS project: `ios/App/`
- Android project: `android/app/`
- App configuration: `capacitor.config.json`
- PWA config: `public/manifest.json`
- Offline support: `public/service-worker.js`

## Prerequisites

### iOS Development
- Mac computer
- Xcode (from App Store)
- Apple Developer Account ($99/year for App Store)

### Android Development
- Android Studio
- Java JDK 11+
- Google Play Developer Account ($25 one-time)

## Troubleshooting

### Capacitor not found
```bash
npm install
npx cap --version
```

### Native projects don't exist
```bash
npx cap add ios
npx cap add android
```

### Changes not showing on device
```bash
npm run build
npx cap sync
# Rebuild in Xcode/Android Studio
```

### Web files not updating
```bash
npm run build
npx cap copy
```

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS Build Guide](https://capacitorjs.com/docs/ios)
- [Android Build Guide](https://capacitorjs.com/docs/android)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Google Play Console](https://play.google.com/console/)

## Next: Add Icons and Splash Screens

To make your app look professional on app stores, you need proper icons and splash screens. This is done directly in:
- iOS: Xcode → Assets.xcassets
- Android: Android Studio → Image Asset Studio

Both will guide you through the setup process.

## Summary

Your app now has:
1. ✅ Web app running normally
2. ✅ Capacitor set up for native builds
3. ✅ Offline support via service worker
4. ✅ Easy build commands

**To build for iOS/Android:**
```bash
npm run mobile:ios      # or mobile:android
```

That's it! Your web app is now ready to deploy to app stores.
