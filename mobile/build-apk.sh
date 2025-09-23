#!/bin/bash

echo "🍺 Building BrewMaestro APK with EAS Build"
echo "=========================================="
echo ""
echo "📋 Steps to build APK:"
echo "1. First, you need to login to Expo:"
echo "   eas login"
echo ""
echo "2. Then build the preview APK:"
echo "   eas build --platform android --profile preview"
echo ""
echo "3. The build will be uploaded to Expo's servers and you'll get a download link"
echo ""
echo "🔑 If you don't have an Expo account:"
echo "   - Go to https://expo.dev"
echo "   - Create a free account"
echo "   - Come back and run 'eas login'"
echo ""
echo "💡 The preview profile will create an APK that you can install directly"
echo "   without needing Google Play Store"
echo ""

read -p "Do you want to start the build process now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting EAS build..."
    eas build --platform android --profile preview
else
    echo "Build process cancelled. Run the commands above when ready."
fi