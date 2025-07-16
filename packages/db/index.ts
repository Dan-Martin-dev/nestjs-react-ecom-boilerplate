import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

// Export all Prisma types and enums
export * from '@prisma/client';

// Export specific types that are commonly used
export type User = Prisma.UserGetPayload<{}>;
export type Address = Prisma.AddressGetPayload<{}>;
export type Category = Prisma.CategoryGetPayload<{}>;
export type Product = Prisma.ProductGetPayload<{}>;
export type Order = Prisma.OrderGetPayload<{}>;
export type OrderItem = Prisma.OrderItemGetPayload<{}>;
export type Cart = Prisma.CartGetPayload<{}>;
export type CartItem = Prisma.CartItemGetPayload<{}>;
export type Review = Prisma.ReviewGetPayload<{}>;
export type Discount = Prisma.DiscountGetPayload<{}>;

// Export the Prisma namespace for advanced types
export { Prisma };
