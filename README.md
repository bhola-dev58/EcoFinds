# EcoFinds - Second-Hand Marketplace Mobile App

**Empowering Sustainable Consumption through a Second-Hand Marketplace**

## 🌟 Overview

EcoFinds is a React Native mobile application that serves as a vibrant and trusted platform for buying and selling pre-owned goods. Our mission is to foster a culture of sustainability by extending the lifecycle of products, reducing waste, and providing an accessible alternative to purchasing new items.

## 🎯 Vision

To become the go-to destination for a conscious community seeking unique finds and responsible consumption, revolutionizing the way people buy and sell pre-owned goods.

## ✨ Features

### User Authentication & Profile Management
- ✅ User registration and login with email/password
- ✅ Profile creation with username setup
- ✅ Editable user dashboard
- ✅ Secure data storage using AsyncStorage

### Product Management (CRUD Operations)
- ✅ Create new product listings with title, description, category, price
- ✅ Edit and update existing product listings
- ✅ Delete product listings
- ✅ View all user's products with status tracking
- ✅ Image placeholder support (ready for future image upload feature)

### Product Discovery & Search
- ✅ Browse all available products
- ✅ Keyword search functionality in titles and descriptions
- ✅ Category filtering with predefined categories
- ✅ Product detail view with full information
- ✅ Real-time search and filter updates

### Shopping Cart & Purchase System
- ✅ Add products to shopping cart
- ✅ Manage cart quantities and remove items
- ✅ Individual product purchase functionality
- ✅ Clear entire cart option
- ✅ Cart persistence across app sessions

### Purchase History & Tracking
- ✅ Complete purchase history with order details
- ✅ Purchase status tracking (completed, pending, cancelled)
- ✅ Total spending calculations
- ✅ Order ID generation and tracking

### Additional Features
- ✅ Responsive design for both mobile and desktop interfaces
- ✅ Home screen with quick actions and recent listings
- ✅ Clean, modern UI with consistent design patterns
- ✅ Offline data storage and synchronization
- ✅ Error handling and user feedback

## 📱 Technology Stack

- **Frontend**: React Native with TypeScript
- **Navigation**: React Navigation 6 (Stack & Bottom Tabs)
- **State Management**: React Context API
- **Data Storage**: AsyncStorage for local persistence
- **UI Framework**: React Native built-in components
- **Development Platform**: Expo

## 🏗️ Architecture

The app follows a modular architecture with clear separation of concerns:

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
├── navigation/         # Navigation configuration
├── context/            # React Context providers
├── services/           # Business logic and data services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Emulator (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EcoFinds/EcoFindsApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your preferred platform**
   - For iOS: `npm run ios`
   - For Android: `npm run android`
   - For Web: `npm run web`

### Project Structure

```
EcoFindsApp/
├── App.js                 # Main application component
├── src/
│   ├── components/        # Reusable components
│   ├── screens/           # Application screens
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── BrowseScreen.tsx
│   │   ├── AddProductScreen.tsx
│   │   ├── CartScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── EditProfileScreen.tsx
│   │   ├── MyProductsScreen.tsx
│   │   ├── PurchaseHistoryScreen.tsx
│   │   └── ProductDetailScreen.tsx
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── AppContext.tsx
│   ├── services/
│   │   ├── authService.ts
│   │   └── productService.ts
│   └── types/
│       └── index.ts
├── package.json
└── tsconfig.json
```

## 📋 Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run in web browser
- `npm run eject` - Eject from Expo (not recommended unless necessary)

## 🎨 UI/UX Design

The app features a clean, modern design with:
- **Primary Color**: Green (#4CAF50) - representing sustainability
- **Typography**: System fonts with consistent sizing
- **Icons**: Emoji-based icons for universal understanding
- **Layout**: Card-based design with appropriate spacing
- **Feedback**: Toast messages and alerts for user actions

## 💾 Data Management

The app uses a sophisticated local data management system:

- **AsyncStorage**: For persistent local data storage
- **Context API**: For global state management
- **Service Layer**: Abstracted data operations
- **Type Safety**: Full TypeScript integration

### Data Models

- **User**: ID, email, username, creation/update timestamps
- **Product**: ID, title, description, category, price, seller info, availability status
- **CartItem**: Product reference with quantity and timestamps
- **Purchase**: Complete transaction record with product and user details

## 🔒 Security & Privacy

- Password storage (ready for encryption in production)
- User data isolation
- Input validation and sanitization
- Secure session management

## 🚧 Future Enhancements

- [ ] Image upload and storage
- [ ] Push notifications
- [ ] In-app messaging between buyers and sellers
- [ ] Payment gateway integration
- [ ] User ratings and reviews
- [ ] Advanced search filters
- [ ] Location-based search
- [ ] Dark mode support
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♀️ Support

For support, please create an issue in the repository or contact the development team.

## 🌱 Sustainable Impact

EcoFinds contributes to environmental sustainability by:
- Extending product lifecycles
- Reducing waste generation
- Promoting circular economy principles
- Encouraging conscious consumption
- Building community awareness about sustainability

---

**Made with 💚 for a more sustainable future**
