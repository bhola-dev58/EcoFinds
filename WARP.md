# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

EcoFinds is a React Native mobile application serving as a second-hand marketplace platform. The app is built with Expo and uses TypeScript, focusing on sustainable consumption through buying and selling pre-owned goods.

## Development Commands

### Core Development
- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device  
- `npm run web` - Run in web browser

### Testing & Development
- Use Expo CLI for hot reloading and development
- Test on physical devices using Expo Go app
- Web testing available through browser

## Architecture Overview

### Project Structure
The codebase follows a modular architecture with clear separation of concerns:

```
src/
├── components/       # Reusable UI components (future expansion)
├── screens/         # Screen components (11 main screens)
├── navigation/      # React Navigation configuration with nested navigators
├── context/         # React Context API for global state management
├── services/        # Business logic and data access layer
├── types/          # TypeScript type definitions and interfaces
└── utils/          # Utility functions (future expansion)
```

### Key Architectural Patterns

1. **Context-Based State Management**: Uses React Context API through two main providers:
   - `AuthContext` - User authentication and profile management
   - `AppContext` - Product data, cart, and purchase management

2. **Service Layer Pattern**: Business logic abstracted into service classes:
   - `AuthService` - Handles user registration, login, profile updates
   - `ProductService` - Manages products, cart operations, purchase history

3. **Navigation Architecture**: Nested navigation structure:
   - Root Stack Navigator (Auth/Main switching)
   - Auth Stack (Login/Register)
   - Main Bottom Tabs (Home, Browse, Add Product, Cart, Profile)
   - Nested Stack Navigators for Browse and Profile sections

4. **Data Persistence**: AsyncStorage-based local data management with structured storage keys and error handling

### TypeScript Configuration
- Path aliases configured for clean imports (`@/`, `@/screens/*`, etc.)
- Strict TypeScript mode enabled
- Comprehensive type definitions for all data models and navigation

### State Management Flow
- Authentication state flows through AuthContext to control app navigation
- Product data managed centrally through AppContext with real-time updates
- Local data persistence ensures offline functionality and data integrity

### Data Models
- **User**: Authentication and profile management
- **Product**: Marketplace listings with categories and availability status
- **CartItem**: Shopping cart with quantity tracking
- **Purchase**: Transaction history with status tracking

## Development Guidelines

### Import Patterns
Use path aliases for clean imports:
```typescript
import { useAuth } from '@/context/AuthContext';
import { ProductService } from '@/services/productService';
import { User, Product } from '@/types';
```

### AsyncStorage Patterns
All data operations go through service layer methods that handle AsyncStorage operations with proper error handling and data validation.

### Navigation Patterns
- Use typed navigation props from defined param lists
- Screen components receive navigation and route props
- Nested navigators handle complex routing scenarios

### State Updates
- Context providers handle global state changes
- Service methods return success/failure objects with messages
- UI components react to context state changes automatically

## Key Dependencies

### Core Framework
- **React Native**: 0.79.6 with React 19.0.0
- **Expo**: ~53.0.22 for development and deployment
- **TypeScript**: ^5.9.2 for type safety

### Navigation & UI
- **React Navigation 7**: Stack and bottom tab navigators
- **React Native Safe Area Context**: Screen layout management
- **React Native Gesture Handler**: Touch interactions

### Data & Storage
- **AsyncStorage**: ^2.2.0 for local data persistence
- **React Context API**: Built-in state management

### Future Capabilities
- **Expo Camera**: ^16.1.11 (ready for image upload features)
- **Expo Image Picker**: ^16.1.4 (ready for product images)
- **React Native Vector Icons**: ^10.3.0 (for enhanced UI)

## Local Development Notes

### Data Storage
- All user data stored locally via AsyncStorage
- No backend integration currently - fully offline-capable
- Data keys prefixed with `ecofinds_` for namespace isolation

### Screen Flow
- Unauthenticated: Login ↔ Register screens
- Authenticated: Bottom tab navigation with nested stacks
- Product detail navigation through Browse stack
- Profile management through Profile stack

### Testing Approach
- Test on multiple platforms (iOS, Android, Web) using Expo
- Use Expo Go for quick physical device testing
- Web testing for rapid development and debugging

## Troubleshooting

### Common Issues and Solutions

**Network/Fetch Errors with Expo CLI**
```bash
# Clear all caches and fix dependencies
npm cache clean --force
npx expo install --fix
npx expo start -c
```

**Web Platform Support**
```bash
# Install web dependencies when needed
npx expo install react-dom react-native-web @expo/metro-runtime
```

**Bundle/Build Errors**
- Check for syntax errors in TypeScript files
- Ensure all imports use correct path aliases
- Verify React Navigation nested structure is properly closed
- Clear Metro bundler cache with `npx expo start -c`
