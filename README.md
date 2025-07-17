# Pokemon Card Marketplace

A modern web application for buying and selling Pokemon TCG cards, built with Vue 3 and Supabase following Domain-Driven Design principles.

## 🎯 **About The Project**

This is a full-featured marketplace where Pokemon card collectors can:
- **Buy & Sell Cards**: Trade Pokemon TCG cards with other users
- **Manage Collections**: Keep track of your personal card collection
- **Secure Trading**: Built-in wallet system and transaction history
- **Social Features**: User profiles and private messaging
- **Advanced Search**: Find cards by name, type, rarity, expansion, and price

## ✨ **Key Features**

### 🔐 **Authentication & Security**
- Secure user registration and login via **Supabase Auth**
- Email verification and password recovery
- Role-based access control (Buyers, Sellers, Admins)

### 🃏 **Card Management**
- Comprehensive card catalog with detailed information
- Advanced search and filtering capabilities
- Personal collection tracking with statistics
- Wishlist functionality

### 🛒 **E-commerce Features**
- Shopping cart with multiple sellers support
- Integrated wallet system for secure payments
- Transaction history and order tracking
- Seller dashboard with sales analytics

### 👥 **Social & Communication**
- User profiles with trading reputation
- Private messaging system
- Public user ratings and reviews
- Activity feeds and notifications

## 🏗️ **Architecture & Technologies**

### **Frontend Stack**
- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Pinia** for state management
- **Vue Router** for navigation
- **Vite** for fast development and building

### **Backend & Infrastructure**
- **Supabase** as Backend-as-a-Service
  - PostgreSQL database with Row Level Security
  - Authentication and user management
  - Real-time subscriptions
  - File storage for card images
  - Edge Functions for business logic

### **Architecture Pattern**
- **Hexagonal Architecture** (Ports & Adapters)
- **Domain-Driven Design** principles
- **Dependency Injection** for testability
- **Clean separation** between auth and business logic

### **Quality Assurance**
- **Vitest** for unit and integration testing
- **Playwright** for end-to-end testing
- **ESLint** for code linting
- **TypeScript** for compile-time checks

## 📁 **Project Structure**

```
project/
├── src/
│   ├── domain/           # Business entities and rules
│   │   ├── entities/     # Domain entities (User, Card, etc.)
│   │   ├── value-objects/ # Value objects (Money, Email, etc.)
│   │   └── ports/        # Interface definitions
│   ├── application/      # Use cases and application services
│   ├── infrastructure/   # External adapters (Supabase, APIs)
│   ├── presentation/     # Vue components and views
│   └── shared/          # Shared utilities and types
├── database/            # Database schema and migrations
├── docs/               # Project documentation
└── e2e/               # End-to-end tests
```

## 🔄 **Entity Architecture**

### **Authentication vs Business Data Separation**

We implement a clean separation between authentication (handled by Supabase) and business logic:

- **`User`**: Represents Supabase Auth data (read-only)
- **`UserProfile`**: Contains business logic and mutable user data
- **`CompleteUser`**: Domain aggregate combining both for unified access

```typescript
// Authentication layer (Supabase)
const authUser = new User(id, email, emailConfirmed, createdAt, updatedAt);

// Business layer (our domain)
const profile = new UserProfile(userId, firstName, lastName, balance, role);

// Unified interface
const completeUser = new CompleteUser(authUser, profile);
```

See [Domain Entities Guide](./docs/DOMAIN_ENTITIES.md) for detailed implementation.

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ and npm/yarn/bun
- Supabase account for backend services
- Git for version control

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pokemon-card-marketplace.git
   cd pokemon-card-marketplace/project
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or npm install / yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Set up database**
   ```bash
   # Run the database schema in your Supabase project
   # Files located in /database/ folder
   ```

5. **Start development server**
   ```bash
   bun run dev
   # or npm run dev / yarn dev
   ```

### **Environment Variables**
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🧪 **Testing**

### **Unit & Integration Tests**
```bash
bun run test           # Run all tests
bun run test:watch     # Run tests in watch mode
bun run test:coverage  # Run tests with coverage
```

### **End-to-End Tests**
```bash
bun run test:e2e       # Run E2E tests
bun run test:e2e:ui    # Run E2E tests with UI
```

## 📚 **Documentation**

- **[Project Plan](./docs/project_plan.md)** - Development phases and milestones
- **[Architecture Guide](./docs/architecture.md)** - Technical architecture details
- **[Domain Entities](./docs/DOMAIN_ENTITIES.md)** - Entity implementation guide
- **[API Documentation](./docs_server_site/)** - Auto-generated API docs
- **[Database Schema](./database/README.md)** - Database design and setup

## 🗃️ **Database Schema**

The application uses **PostgreSQL** with the following key tables:

- **`auth.users`** - Supabase Auth users (managed by Supabase)
- **`user_profiles`** - Business user data and preferences
- **`cards`** - Pokemon card catalog with detailed information
- **`collections`** - User card collections
- **`sales`** - Cards listed for sale
- **`purchases`** - Transaction records
- **`cart_items`** - Shopping cart contents
- **`messages`** - Private messaging system

See [Database README](./database/README.md) for complete schema and setup instructions.

## 🛣️ **Development Status**

### **Phase 1: Foundation** (In Progress)
- ✅ Project setup and configuration
- ✅ Hexagonal architecture implementation
- ✅ Supabase integration and authentication
- ✅ Database schema and RLS policies
- ✅ Domain entity refactoring
- 🔄 Application layer interfaces
- 🔄 Infrastructure layer implementations

### **Phase 2: Core Features** (Upcoming)
- User registration and authentication flows
- Card catalog and search functionality
- Shopping cart and purchase system
- User profiles and basic UI

### **Phase 3: Advanced Features** (Planned)
- Collection management
- Selling and marketplace features
- Private messaging system
- Advanced search and filters

## 🤝 **Contributing**

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Code Standards**
- Follow TypeScript best practices
- Write unit tests for business logic
- Use conventional commit messages
- Follow the established architecture patterns

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Pokemon Company for the amazing Pokemon TCG
- Supabase team for the excellent Backend-as-a-Service platform
- Vue.js community for the fantastic framework and ecosystem
- All contributors who help improve this project

---

**Happy Trading! 🃏✨**
