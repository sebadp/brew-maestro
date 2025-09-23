#!/bin/bash

echo "🔍 Diagnosing BrewMaestro App Issues"
echo "===================================="
echo ""

echo "📋 Checking project structure..."
echo "✅ App structure:"
ls -la app/
echo ""

echo "✅ Tab structure:"
ls -la app/\(tabs\)/
echo ""

echo "📦 Checking dependencies..."
echo "✅ Key packages installed:"
npm list --depth=0 | grep -E "(expo|react|@expo)"
echo ""

echo "🔧 Checking TypeScript compilation..."
npx tsc --noEmit && echo "✅ TypeScript: OK" || echo "❌ TypeScript: ERRORS"
echo ""

echo "📄 Checking package.json main entry..."
grep "main" package.json
echo ""

echo "📱 Checking app.json configuration..."
echo "✅ App name: $(grep '"name"' app.json)"
echo "✅ Expo version: $(grep '"expo"' package.json)"
echo ""

echo "🚀 Checking if Expo server is responsive..."
curl -s http://localhost:8081 > /dev/null && echo "✅ Expo server: Running" || echo "❌ Expo server: Not running"
echo ""

echo "🔍 Analysis complete!"
echo ""
echo "📋 Next steps for debugging:"
echo "1. Run: ./debug-with-web.sh (quick web debugging)"
echo "2. Or install Android Studio: ./install-android-studio.sh"
echo "3. Check browser console for JavaScript errors"