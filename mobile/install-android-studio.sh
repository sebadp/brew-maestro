#!/bin/bash

echo "🤖 Installing Android Studio and Setting up Android Emulator"
echo "============================================================"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
sudo apt update
sudo apt install -y wget unzip openjdk-17-jdk

# Download Android Studio
echo "⬇️  Downloading Android Studio..."
cd ~/Downloads
wget -O android-studio.tar.gz "https://redirector.gvt1.com/edgedl/android/studio/ide-zips/2023.3.1.19/android-studio-2023.3.1.19-linux.tar.gz"

# Extract Android Studio
echo "📂 Extracting Android Studio..."
sudo tar -xzf android-studio.tar.gz -C /opt/

# Create symlink
echo "🔗 Creating Android Studio launcher..."
sudo ln -sf /opt/android-studio/bin/studio.sh /usr/local/bin/android-studio

# Set environment variables
echo "🔧 Setting up environment variables..."
echo "" >> ~/.bashrc
echo "# Android Studio and SDK" >> ~/.bashrc
echo "export ANDROID_HOME=\$HOME/Android/Sdk" >> ~/.bashrc
echo "export ANDROID_SDK_ROOT=\$HOME/Android/Sdk" >> ~/.bashrc
echo "export PATH=\$PATH:\$ANDROID_HOME/emulator" >> ~/.bashrc
echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> ~/.bashrc

# Source the bashrc
source ~/.bashrc

echo ""
echo "✅ Android Studio installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Run: android-studio"
echo "2. Follow the setup wizard"
echo "3. Install Android SDK and create an AVD (Virtual Device)"
echo "4. Once done, you can run: eas build --platform android --profile preview --local"
echo ""
echo "🚀 To start Android Studio now, run:"
echo "android-studio &"