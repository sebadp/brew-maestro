#!/bin/bash

echo "🐛 Debugging BrewMaestro - Web Version for Testing"
echo "=================================================="
echo ""
echo "While we set up Android Studio, let's debug with the web version"
echo "to see what errors are occurring..."
echo ""

# Kill any existing processes
echo "🔄 Stopping existing processes..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "Metro" 2>/dev/null || true
sleep 2

echo "🚀 Starting Expo with web debugging..."
echo ""
echo "This will:"
echo "1. Start the development server"
echo "2. Automatically open in browser"
echo "3. Show console errors if any"
echo ""
echo "Press 'w' to open web version"
echo "Press 'j' to open debugger"
echo "Press Ctrl+C to stop"
echo ""

# Start expo with clear cache
npx expo start --clear --web