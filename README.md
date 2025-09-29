# BrewMaestro

Complete brewing ecosystem featuring a **React Native mobile MVP** and **Next.js landing page** for the ultimate homebrewing experience.

## 🏗️ Project Structure

```
brew-maestro/
├── mobile/                   # React Native/Expo Mobile App
│   ├── app/                  # Expo Router screens
│   ├── components/           # Shared UI components
│   ├── store/                # Zustand state management
│   ├── utils/                # Brewing calculations & utilities
│   └── BREWMAESTRO_MOBILE_DOCUMENTATION.md
├── web/                      # Next.js Landing Page
│   ├── app/                  # App Router pages
│   ├── components/           # Landing page components
│   └── lib/                  # SEO & utilities
├── BRANDING.md               # Brand guidelines & design tokens
├── BREW_MAESTRO_PLAN.md      # Project roadmap & features
└── start-mobile.sh           # Quick mobile development script
```

## 📱 Mobile App (MVP)

**React Native brewing companion** with recipe management, brew session tracking, and brewing calculations.

### Features
- **Recipe Management**: Create, edit, delete brewing recipes
- **Brew Sessions**: Guided step-by-step brewing process
- **Calculations**: ABV, IBU, water management (mash/sparge)
- **History**: Track completed brews and performance
- **Cross-Platform**: iOS, Android, and web support

### Tech Stack
- React Native with Expo SDK 52
- Expo Router (file-based navigation)
- Zustand for state management
- AsyncStorage for local persistence
- TypeScript + brand-compliant styling

### Quick Start
```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start development server
npm start
# or use the convenience script
./start-mobile.sh

# For web debugging
npm run web

# Build APK (requires EAS account)
eas build --platform android --profile preview --local
```

### Mobile Project Structure
- `app/(tabs)/` – Main navigation (Recipes, Brew, Calculator, History)
- `app/recipe/` – Recipe management screens
- `store/` – Zustand stores (recipes, brew sessions)
- `utils/` – Brewing formulas and calculations
- `components/shared/` – Reusable UI components

## 🌐 Web Landing Page

**Production-ready marketing site** built with Next.js 14, featuring BrewMaestro branding and responsive design.

### Features
- Next.js 14 with App Router
- TypeScript + Tailwind CSS
- Light/Dark theme support
- SEO optimized with metadata
- Accessibility compliant
- Testing with Jest + Testing Library

### Quick Start
```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build && npm start

# Run tests
npm test
```

## 🎨 Design System

**BrewMaestro Brand Colors:**
- **Maestro Gold** (`#F6C101`) - Primary accent
- **Hop Green** (`#81A742`) - Secondary accent
- **Deep Brew** (`#1A1A1A`) - Primary text
- **Yeast Cream** (`#FFF8E7`) - Light background
- **Fermentation Orange** (`#FF6B35`) - Status indicators

### Theming (Web)
- Light theme base: Yeast Cream
- Dark theme base: Deep Brew
- User toggle with localStorage persistence
- Respects `prefers-color-scheme`

## 🧮 Brewing Calculations

The mobile app includes professional brewing formulas:

### ABV Calculation
- Supports multiple input formats (1.032 or 1032)
- Converts specific gravity to gravity points
- Formula: `(OG points - FG points) × 0.131`

### IBU Calculation
- **Tinseth Formula** for hop bitterness
- Accounts for boil time, hop alpha acids, batch size
- Gravity adjustment for utilization

### Water Management
- **Mash Water**: 3L per kg grain (default ratio)
- **Sparge Water**: Calculated for final batch size
- **Grain Absorption**: 1.04L per kg grain
- **Boil-off**: 15% assumption

## 📚 Documentation

### Key Documents
- **[BRANDING.md](BRANDING.md)** - Complete brand guidelines, colors, typography
- **[BREW_MAESTRO_PLAN.md](BREW_MAESTRO_PLAN.md)** - Project roadmap and feature specifications
- **[Mobile Documentation](mobile/BREWMAESTRO_MOBILE_DOCUMENTATION.md)** - Technical architecture and implementation details

### Development Notes
- **Mobile**: Expo SDK 52 + React 18.3.1 for stability
- **Web**: Next.js 14 with App Router and TypeScript
- **State**: Zustand for mobile, built-in React state for web
- **Testing**: Jest + React Testing Library
- **Build**: EAS Build for mobile APK generation

## 🚀 Quick Development

### Start Both Apps
```bash
# Terminal 1 - Mobile App
cd mobile && npm start

# Terminal 2 - Web Landing
cd web && npm run dev
```

### URLs
- **Mobile**: Expo DevTools + QR Code
- **Mobile Web**: http://localhost:8081
- **Landing Page**: http://localhost:3000

## 🔧 Production Deployment

### Mobile
```bash
cd mobile
eas build --platform android --profile preview
eas submit --platform android
```

### Web
```bash
cd web
npm run build
npm start
# Deploy to Vercel, Netlify, etc.
```

---

**Built with ❤️ for homebrewers everywhere**
