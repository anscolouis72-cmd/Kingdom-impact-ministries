# Mobile App - Quick Reference

## Your web app is already mobile-ready! ✨

### One-Command Mobile Build

**iOS (Mac only):**
```bash
npm run mobile:ios
```

**Android:**
```bash
npm run mobile:android
```

### What happens:
1. Web app builds (`npm run build`)
2. Native projects sync (`npx cap sync`)
3. Xcode/Android Studio opens with your app ready to run

### Then in Xcode/Android Studio:
- Select simulator or device
- Click Play button
- App builds and runs

## File Updates (Minimal)

Only 3 files were touched:
- ✓ `index.html` - Added manifest link + service worker registration (2 lines)
- ✓ `package.json` - Added 3 mobile build commands
- ✓ `public/manifest.json` - New PWA config (doesn't affect web app)
- ✓ `public/service-worker.js` - New offline support (doesn't affect web app)

**Web app remains completely unchanged!**

## Build Commands

```bash
# Just build (web app works as before)
npm run dev
npm run build
npm run preview

# Mobile additions
npm run mobile:build      # Build web + sync to native
npm run mobile:ios        # Open iOS project
npm run mobile:android    # Open Android project
```

## After First Build

**iOS:**
1. Click Play in Xcode
2. App runs on simulator

**Android:**
1. Click Run in Android Studio
2. App runs on emulator/device

## After Web Changes

```bash
npm run build           # Rebuild web
npx cap sync            # Sync to native
# Then rebuild in Xcode/Android Studio
```

## Detailed Guide

See [MOBILE_APP_SETUP.md](MOBILE_APP_SETUP.md) for:
- Complete setup walkthrough
- Prerequisites for iOS/Android
- App Store submission steps
- Troubleshooting guide
- Capacitor commands reference

## Your Web App

Your web app works exactly as before:
- `npm run dev` - Dev server
- `npm run dev:frontend` - Frontend only
- `npm run dev:backend` - Backend only
- `npm run build` - Production build
- `npm run preview` - Preview build

Everything is backwards compatible!

---

**Status:** ✅ Ready to build for iOS and Android
