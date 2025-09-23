# BrewMaestro Mobile MVP v0.1 - "Brew Day Companion"

## 🍺 Overview

BrewMaestro is a modern mobile app for homebrewing enthusiasts, built with Expo and React Native. This MVP focuses on the essential brewing workflow with a beautiful, intuitive interface following our brand guidelines.

## ✨ Features Implemented

### 📱 Core MVP Features
- **Recipe Management**: Create, view, and edit brewing recipes
- **Brew Session Tracker**: Step-by-step guided brewing sessions with timers
- **ABV Calculator**: Real-time alcohol content calculation
- **Brew History**: Track your brewing progress and statistics
- **Timer System**: Built-in brewing timers with notifications

### 🎨 Design & UX
- **Brand-Compliant Colors**: Maestro Gold (#F6C101), Hop Green (#81A742), Deep Brew (#1A1A1A)
- **Mobile-First Design**: Touch-friendly interfaces optimized for brew day
- **Intuitive Navigation**: Tab-based navigation with clear visual hierarchy
- **Empty States**: Encouraging first-time user experience

### 📊 State Management
- **Zustand Stores**: Recipe and brew session management
- **AsyncStorage**: Local data persistence
- **Real-time Calculations**: ABV, IBU, and efficiency calculations

## 🛠 Tech Stack

- **Framework**: Expo 52.x with React Native 0.76
- **React**: 18.3.1 (stable version)
- **Navigation**: Expo Router 4.x (file-based routing)
- **State**: Zustand for global state management
- **Storage**: AsyncStorage for local persistence
- **UI**: Custom components with brand styling
- **Icons**: Expo Vector Icons (Material Community Icons)

## 📁 Project Structure

```
mobile/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Recipes list
│   │   ├── brew.tsx       # Active brew session
│   │   ├── calculator.tsx # Brewing calculator
│   │   └── history.tsx    # Brew history
│   ├── recipe/            # Recipe management
│   │   ├── [id].tsx       # Recipe details
│   │   └── new.tsx        # Create new recipe
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── recipe/           # Recipe-specific components
│   ├── brew/             # Brew session components
│   └── shared/           # Shared components
├── store/                # Zustand stores
│   ├── recipeStore.ts    # Recipe management
│   └── brewSessionStore.ts # Brew session tracking
└── utils/                # Utility functions
    └── calculations.ts   # Brewing calculations
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

1. **Navigate to mobile directory**:
   ```bash
   cd mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run on device/simulator**:
   - **Web**: Press `w` in terminal
   - **iOS**: Press `i` or scan QR with Camera app
   - **Android**: Press `a` or scan QR with Expo Go app

## 📊 Core Calculations

The app includes accurate brewing calculations:

- **ABV**: Standard formula `(OG - FG) × 131.25`
- **IBU**: Tinseth and Rager methods for hop bitterness
- **SRM**: Morey equation for beer color
- **Efficiency**: Brewhouse efficiency calculations
- **Water Chemistry**: Residual alkalinity and mash pH

## 🎯 MVP User Flow

1. **First Launch**: Welcome screen encourages creating first recipe
2. **Recipe Creation**: Simple form with essential ingredients
3. **Recipe Library**: Beautiful cards showing key stats
4. **Brew Session**:
   - Select recipe → Start guided session
   - Step-by-step progress with timers
   - Input measurements (OG, FG, etc.)
   - Auto-calculate efficiency and ABV
5. **History Tracking**: View past brews with stats comparison

## 📱 Key Screens

### 🏠 Home/Recipes
- Grid of recipe cards with key stats
- FAB for quick recipe creation
- Empty state for first-time users

### 🔥 Brew Session
- Progress indicator
- Large, touch-friendly timers
- Step-by-step guidance
- Quick measurement input

### 🧮 Calculator
- ABV calculator with real-time results
- Quick reference tables
- Efficiency guidelines

### 📈 History
- Brew statistics overview
- Individual batch details
- Efficiency tracking

## 🎨 Design System

### Colors
```javascript
MAESTRO_GOLD = '#F6C101'    // Primary CTAs, highlights
HOP_GREEN = '#81A742'       // Success, progress, natural elements
DEEP_BREW = '#1A1A1A'       // Text, dark elements
YEAST_CREAM = '#FFF8E7'     // Background, cards
```

### Typography
- **Headers**: Inter Bold (28px, 24px, 20px)
- **Body**: Inter Regular/Medium (16px, 14px)
- **Mono**: JetBrains Mono (measurements, data)

## 🔮 Future Enhancements

### Phase 2 Features (Planned)
- SQLite database for better performance
- Cloud sync across devices
- Social features and recipe sharing
- Equipment integration (Tilt, iSpindel)
- Advanced water chemistry
- Recipe marketplace

### Technical Improvements
- Offline-first architecture
- Push notifications
- Haptic feedback
- Dark mode support
- Accessibility improvements

## 🧪 Testing

The app is designed for real brewing scenarios:

- **Touch-friendly**: Large buttons for brew day use
- **One-handed operation**: Key actions accessible with thumb
- **Moisture resistance**: Large tap targets for wet hands
- **Bright UI**: Readable in various lighting conditions

## 📝 License

This project is part of the BrewMaestro ecosystem. All rights reserved.

---

## 🍻 About BrewMaestro

**"Master Your Craft"** - BrewMaestro democratizes homebrewing through intelligent mobile tools, combining traditional brewing knowledge with modern technology.

Built with ❤️ for the homebrewing community.