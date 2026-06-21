# Building Lumina for your phone (EAS)

This produces a **standalone app** you install without running a dev server —
Android as an installable `.apk`, iOS via **TestFlight**.

**Prerequisites**
- A free **Expo account** → https://expo.dev
- (iOS only) your **Apple Developer** account — EAS handles signing for you.

All commands run from `apps/mobile/`.

## 1. Install the CLI + log in
```
npm install -g eas-cli
cd apps/mobile
eas login
eas init          # links the project, writes a projectId into app.json — accept defaults
```

## 2. Give the build your Supabase keys
The app reads `EXPO_PUBLIC_SUPABASE_URL` / `_ANON_KEY` at build time. Set them as
**EAS environment variables** (kept out of the repo) for the Preview + Production
environments. Easiest via the dashboard:

> expo.dev → your project → **Environment variables** → **New variable**
> - `EXPO_PUBLIC_SUPABASE_URL` = your Project URL — environments: **Preview, Production**, visibility: **Plain text**
> - `EXPO_PUBLIC_SUPABASE_ANON_KEY` = your anon key — same

Or via CLI:
```
eas env:create --environment preview    --name EXPO_PUBLIC_SUPABASE_URL --value "https://YOUR.supabase.co" --visibility plaintext
eas env:create --environment preview    --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJ..." --visibility plaintext
eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value "https://YOUR.supabase.co" --visibility plaintext
eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJ..." --visibility plaintext
```
(Without these the build still runs — just in local-only mode, no accounts.)

## 3. Build

**Android — installable APK (fastest):**
```
eas build -p android --profile preview
```
Open the build link → download the `.apk` → install on your phone (allow "install from unknown sources").

**iOS — TestFlight:**
```
eas build -p ios --profile production
# it will prompt to log in to your Apple account and auto-create signing creds
eas submit -p ios --latest
```
Then accept the TestFlight invite on your iPhone and install.

## 4. Iterating
- Code change → rebuild (`eas build …`), **or** set up **EAS Update** later for instant
  over-the-air JS updates without a full rebuild.

> The bundle id / package is `com.abramceeeek.lumina` (app.json). Change it before a real
> App Store / Play Store release if you want your own.
