Local development notes

Create a local `.env` file in `apps/web/` or set `VITE_API_URL` in your environment to point the frontend at your running API.

Example `.env` (do not commit):

VITE_API_URL=http://localhost:3001/api/v1

Vite will pick up `import.meta.env.VITE_API_URL` at build time.
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Modern React E-commerce Frontend

A modern, feature-based React application built with the latest 2025 best practices using TanStack Router, Zustand, TanStack Query, and Radix UI.

## 🚀 Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **TanStack Router** - Modern type-safe routing
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast development and building
- **pnpm** - Fast, efficient package manager

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   └── ui/              # Radix UI-based components
├── features/            # Feature-based modules
│   ├── auth/           # Authentication feature
│   │   ├── components/ # Auth-specific components
│   │   ├── pages/      # Auth pages
│   │   └── stores/     # Auth state management
│   ├── cart/           # Shopping cart feature
│   ├── products/       # Product catalog feature
│   ├── dashboard/      # User dashboard feature
│   └── layout/         # Layout components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
│   ├── api.ts         # API client
│   ├── types.ts       # TypeScript types
│   └── utils.ts       # Utility functions
├── router.tsx          # TanStack Router configuration
└── main.tsx           # App entry point
```

## 🎯 Features

### ✅ Implemented
- **Modern Architecture**: Feature-based folder structure
- **Type-Safe Routing**: TanStack Router with full TypeScript support
- **State Management**: Zustand for client state, TanStack Query for server state
- **UI Components**: Radix UI components with Tailwind CSS styling
- **Responsive Design**: Mobile-first responsive layout
- **Authentication**: Login/Register with JWT token management
- **Shopping Cart**: Add/remove items, quantity management
- **Product Catalog**: Product listing with filtering
- **User Dashboard**: Profile and order management

### 🎨 Design System
- **Design Tokens**: CSS custom properties for theming
- **Dark/Light Mode**: Built-in theme switching capability
- **Component Library**: Consistent Radix UI-based components
- **Responsive**: Mobile-first responsive design
- **Accessibility**: WCAG compliant components

## 🛠️ Development

### Prerequisites
- Node.js 18+
- pnpm 8+

### Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Start development server**:
   ```bash
   pnpm dev
   ```

3. **Build for production**:
   ```bash
   pnpm build
   ```

4. **Preview production build**:
   ```bash
   pnpm preview
   ```

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors
- `pnpm type-check` - Type check without emitting

## 🏗️ Architecture Decisions

### 1. Feature-Based Structure
Organized by features rather than file types for better scalability and maintainability.

### 2. TanStack Router
- Type-safe routing with automatic TypeScript inference
- Code splitting and lazy loading support
- Search params and route validation
- Better developer experience than React Router

### 3. State Management
- **Zustand**: Simple, lightweight client state (auth, cart)
- **TanStack Query**: Server state with caching, background updates
- **No Redux**: Reduced complexity and boilerplate

### 4. UI Components
- **Radix UI**: Unstyled, accessible components
- **Tailwind CSS**: Utility-first styling
- **CVA**: Class variance authority for component variants
- **Custom Design System**: Consistent theming and spacing

### 5. TypeScript
- Strict type checking
- Path mapping with `@/` alias
- Shared types across features
- API response typing

## 🔗 API Integration

The frontend integrates with a NestJS backend API:

- **Base URL**: `http://localhost:3001/api/v1`
- **Authentication**: JWT tokens
- **Error Handling**: Centralized error handling
- **Type Safety**: TypeScript interfaces for all API responses

## 🎯 Best Practices

### Code Organization
- Feature-based folder structure
- Barrel exports for clean imports
- Separation of concerns
- Single responsibility principle

### Performance
- Code splitting by routes
- Lazy loading of components
- Optimized bundle size
- Efficient re-renders with proper state management

### Developer Experience
- TypeScript for type safety
- ESLint for code quality
- Fast HMR with Vite
- DevTools for debugging (React Query, TanStack Router)

### Accessibility
- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Screen reader support

## 🚀 Deployment

The application is containerized and ready for deployment:

1. **Build the image**:
   ```bash
   docker build -t ecom-frontend .
   ```

2. **Run with Docker Compose**:
   ```bash
   docker-compose up -d web
   ```

## 🤝 Contributing

1. Follow the established folder structure
2. Use TypeScript for all new code
3. Write tests for new features
4. Follow the existing code style
5. Ensure accessibility compliance

## 📚 Learn More

- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
