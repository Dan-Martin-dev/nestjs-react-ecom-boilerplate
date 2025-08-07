# Web App Technical Documentation

## Overview

This folder contains the React 19 frontend for your e-commerce monorepo. It is built with Vite, TypeScript, TanStack Router, Zustand, TanStack Query, and Radix UI. The structure is feature-based for scalability and maintainability.

---

## Folder Structure

```
apps/web/
├── dist/                # Production build output
├── public/              # Static assets (e.g., vite.svg)
├── src/                 # Source code
│   ├── assets/          # Images and SVGs
│   ├── components/      # Reusable UI components
│   │   └── ui/          # Radix UI-based components
│   ├── features/        # Feature-based modules
│   │   ├── auth/        # Authentication (pages, components, stores)
│   │   ├── cart/        # Shopping cart (pages, components, stores)
│   │   ├── products/    # Product catalog (pages, components, stores)
│   │   ├── dashboard/   # User dashboard
│   │   └── layout/      # Layout components (Header, Footer, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and API client
│   ├── router.tsx       # TanStack Router configuration
│   ├── main.tsx         # App entry point
│   ├── App.tsx          # Root component
│   ├── App.css          # Global styles
│   ├── index.css        # Base styles
│   └── vite-env.d.ts    # Vite environment types
├── index.html           # HTML entry point
├── package.json         # App-specific dependencies and scripts
├── tsconfig.json        # TypeScript config
├── tsconfig.app.json    # App-specific TS config
├── tsconfig.node.json   # Node-specific TS config
├── vite.config.ts       # Vite configuration
└── README.md            # App documentation
```

---

## Main Files

- **main.tsx**:  
  Entry point. Renders `<App />` into `#root` in `index.html`.

- **App.tsx**:  
  Root React component. Sets up TanStack Router, global providers (Zustand, QueryClient), and layout.

- **router.tsx**:  
  Configures TanStack Router routes, layouts, and navigation.

- **vite.config.ts**:  
  Vite build and dev server configuration. Sets port, plugins, aliases, etc.

- **index.html**:  
  HTML template loaded by Vite. Mounts React app at `#root`.

---

## Routing

- Uses **TanStack Router** for type-safe, file-based routing.
- Routes are defined in `router.tsx` and/or a `/routes` folder.
- Supports nested layouts, code splitting, search params, and route validation.
- Example routes:
  - `/` → HomePage
  - `/products` → ProductsPage
  - `/cart` → CartPage
  - `/auth/login` → LoginPage
  - `/auth/register` → RegisterPage
  - `/dashboard` → DashboardPage

---

## State Management

- **Zustand**:  
  For global client state (auth, cart, UI state).  
  Example: `features/auth/stores/authStore.ts`, `features/cart/stores/cartStore.ts`
- **TanStack Query**:  
  For server state (API data, mutations, caching).  
  Example: `hooks/useProducts.ts`, `hooks/useCart.ts`, `hooks/useAuth.ts`
- **React Hook Form**:  
  For local form state and validation (e.g., registration, login).

---

## API Integration

- **API Client**:  
  Located in `lib/api.ts`.  
  Uses `fetch` or Axios to communicate with the NestJS backend (`http://localhost:3001/api/v1`).
- **Authentication**:  
  JWT tokens stored in Zustand store.  
  Login/register flows handled via TanStack Query mutations.
- **Error Handling**:  
  Centralized error handling in API client and query hooks.

---

## UI & Styling

- **Radix UI**:  
  Accessible, unstyled component primitives (e.g., Dialog, Dropdown).
- **Tailwind CSS**:  
  Utility-first styling for rapid UI development.
- **App.css & index.css**:  
  Global and base styles.

---

## Build & Development Workflow

- **Install dependencies**:
  ```bash
  pnpm install
  ```
- **Start dev server**:
  ```bash
  pnpm dev
  ```
  - Hot reloads on code changes.
  - Vite serves at `http://localhost:3000` (or configured port).
- **Build for production**:
  ```bash
  pnpm build
  ```
  - Outputs static files to `dist/`.
- **Preview production build**:
  ```bash
  pnpm preview
  ```
- **Lint & type-check**:
  ```bash
  pnpm lint
  pnpm type-check
  ```

---

## Docker & Deployment

- **Development**:  
  Use `docker-compose.dev.yml` for hot-reloading dev environment.
- **Production**:  
  Use `docker-compose.prod.yml` for optimized builds, Nginx static serving, SSL, monitoring.
- **CI/CD**:  
  Automated via GitHub Actions. Push to main triggers build and deployment.

---

## Best Practices

- Feature-based folder structure for scalability.
- Barrel exports for clean imports.
- Strict TypeScript for type safety.
- Centralized API error handling.
- Responsive, accessible UI.
- Automated tests and linting.

---

## References

- [TanStack Router Docs](https://tanstack.com/router)
- [TanStack Query Docs](https://tanstack.com/query)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [Radix UI Docs](https://www.radix-ui.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)

---

## For Contributors

- Follow feature-based structure.
- Use TypeScript for all code.
- Write tests for new features.
- Ensure accessibility compliance.
- Run lint and type-check before PRs.

---
