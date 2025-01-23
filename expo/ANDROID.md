# Android Development Setup Guide for macOS

This guide provides detailed instructions for setting up your Android development environment on macOS, specifically for React Native/Expo projects.

## Prerequisites

### 1. Install Required Tools

First, install the necessary development tools using Homebrew:

```bash
# Install Homebrew if you haven't already
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Watchman (used by React Native for file watching)
brew install watchman

# Install OpenJDK 17 (Zulu distribution)
brew install --cask zulu@17
```

### 2. Configure Java Environment

Add the following to your `~/.zshrc` (or `~/.bash_profile` if using bash):

```bash
# Java Configuration
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
```

## Android Studio Installation

### 1. Install Android Studio

```bash
brew install --cask android-studio
```

### 2. Configure Android SDK

1. Open Android Studio
2. Go to `Settings/Preferences > Languages & Frameworks > Android SDK`
3. Install the following components:
   - Latest Android SDK platform
   - Android SDK Build-Tools
   - Android Emulator
   - Android SDK Platform-Tools

### 3. Configure Environment Variables

Add these to your `~/.zshrc` (or `~/.bash_profile`):

```bash
# Android SDK Configuration
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Apply the changes:
```bash
source ~/.zshrc  # or source ~/.bash_profile for bash
```

## Launching Android Studio

### Method 1: Direct Terminal Launch (Recommended)

Create this script in your project root:

```bash
#!/bin/bash
# launch-android-studio.sh

# Ensure environment is loaded
source ~/.zshrc  # or ~/.bash_profile for bash

# Launch Android Studio
open -a /Applications/Android\ Studio.app

# Optional: Open specific project
# open -a /Applications/Android\ Studio.app --args /path/to/your/project
```

Make it executable:
```bash
chmod +x launch-android-studio.sh
```

### Method 2: Add Alias to Shell Config

Add this to your `~/.zshrc`:

```bash
alias studio="open -a /Applications/Android\ Studio.app"
```

## Project Setup Scripts

Add these scripts to your package.json:

```json
{
  "scripts": {
    "android:studio": "./launch-android-studio.sh",
    "android:clean": "cd android && ./gradlew clean && cd ..",
    "android:build": "cd android && ./gradlew assembleDebug && cd ..",
    "android:bundle": "cd android && ./gradlew bundleRelease && cd .."
  }
}
```

## Troubleshooting

### 1. Node.js Not Found
If Android Studio can't find Node.js, ensure you're launching it from the terminal or add Node.js to your system PATH.

### 2. Multiple ADB Versions
If you encounter ADB version conflicts:

```bash
# Check ADB versions
adb version
cd ~/Library/Android/sdk/platform-tools && ./adb version

# Fix by copying SDK's ADB to system
sudo cp ~/Library/Android/sdk/platform-tools/adb /usr/local/bin/
```

### 3. Gradle Sync Issues
- Ensure JDK 17 is properly set in Android Studio
- Clear Gradle caches: `rm -rf ~/.gradle/caches/`
- Invalidate caches in Android Studio: `File > Invalidate Caches`

## Common Commands

```bash
# Check if ADB is working
adb devices

# Start emulator from command line
emulator -list-avds
emulator -avd <device_name>

# Gradle commands
./gradlew clean
./gradlew assembleDebug
./gradlew bundleRelease
```

## Additional Resources

- [Official Expo Android Studio Guide](https://docs.expo.dev/workflow/android-studio-emulator/)
- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
```

This README provides a comprehensive guide for setting up Android development on macOS, including environment configuration, Android Studio setup, and common troubleshooting steps. The launch script and aliases make it easier to ensure Android Studio starts with the correct environment variables.
