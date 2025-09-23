#!/bin/bash

echo "🍺 Starting BrewMaestro Mobile App..."
echo "======================================"

# Navigate to mobile directory
cd mobile

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the Expo development server
echo "🚀 Starting Expo development server..."
echo ""
echo "Once the server starts, you can:"
echo "📱 Press 'w' to open in web browser"
echo "📱 Scan QR code with Expo Go app on your phone"
echo "📱 Press 'i' for iOS simulator (macOS only)"
echo "📱 Press 'a' for Android emulator"
echo ""

npm start