Current behavior: After logging in, the user is redirected to "/" (root). I want a modern, full-featured dashboard at route "/dashboard" and the header should redirect authenticated users to that route (unauthenticated users go to /auth/login).

Design & styling:
- Build UI in React + TypeScript using Tailwind CSS and shadcn-style components.
- Reuse existing font classes and weights from apps/web/src/features/auth/RegisterPage.tsx ("font-inco", "font-tico" where appropriate).
- Follow existing design language: clean interfaces, subtle transitions, accessible patterns.
- Match auth-fonts.css styles used in the RegisterPage for consistency.

Screens (minimal MVP):
- /dashboard (Overview): welcome message with user's name, account quick actions, order summary (last 5), account status card.
- /dashboard/orders: paginated list with OrderStatus filter and date range, order detail modal showing items, totals, and tracking information.
- /dashboard/account: editable user profile (name, email) -> PATCH /api/v1/users/:id (use req.user.sub from JWT).
- /dashboard/addresses: list/add/edit/delete via GET/POST/PATCH/DELETE /api/v1/addresses.

Optional features:
- Wishlist integration using the Wishlist model.
- Bestsellers recommendations from GET /api/v1/products/bestsellers.

Data & networking:
- Use TanStack Query (@tanstack/react-query) like existing code.
- Use import.meta.env.VITE_API_URL with fallback http://localhost:3001/api/v1.
- Add TypeScript interfaces matching your Prisma schema:
  - User { id: string; email: string; name?: string; picture?: string; role: Role }
  - Order { id: string; orderNumber: string; status: OrderStatus; totalAmount: number; orderDate: string; items: OrderItem[] }
  - Address { id: string; street: string; streetNumber?: string; city: string; province: string; zipCode: string; neighborhood?: string; floor?: string; apartment?: string; country: string; type: AddressType; isDefault: boolean }
  - Product { id: string; name: string; price: number; images: ProductImage[]; slug: string }

Auth & routing:
- Add routes in router.tsx for /dashboard and nested routes.
- Update the useLoginForm hook to redirect to /dashboard instead of / after login.
- Protect dashboard routes using the JwtAuthGuard pattern.
- Add header navigation for logged-in users.

Developer deliverables:
- Branch: fix/feature/dashboard-modern
- PR must include at least Overview, Orders list + detail, Account and Addresses screens.
- Uses react-query and imports types from @repo/db where available.
- Implement loading, error and empty states for each screen.
- Include unit tests for main components.
- Document any assumptions made or discrepancies encountered.

API endpoints to integrate:
- GET /api/v1/users/me -> current user profile
- PATCH /api/v1/users/:id -> update user profile
- GET /api/v1/orders?limit=10&page=1 -> paginated user orders 
- GET /api/v1/orders/:orderNumber -> order details including items
- GET/POST/PATCH/DELETE /api/v1/addresses -> user address management
- GET /api/v1/products/bestsellers -> for recommendations section

Implementation considerations:
1. Ensure JWT token is included in all API requests via Authorization header.
2. Handle expired tokens gracefully by redirecting to login.
3. Match the existing auth flow pattern (JwtAuthGuard) for protected routes.
4. Use the existing font styles (font-inco, font-tico) from RegisterPage.tsx.
5. Create a consistent layout for all dashboard pages, similar to existing layouts.