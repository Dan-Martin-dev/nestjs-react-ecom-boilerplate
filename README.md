# 🛒 E-commerce Monorepo

Modern, full-stack e-commerce platform built with **NestJS**, **Next.js**, and **Prisma**.

## 🚀 Tech Stack

- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: Next.js 14 (App Router) - *Coming Soon*
- **Authentication**: NextAuth.js with social providers
- **Payments**: Stripe integration
- **Deployment**: Docker + Traefik (Self-hosted)

## 📊 Features

- ✅ **Comprehensive Database Schema** (13 tables)
- ✅ **Product Catalog** with variants and attributes
- ✅ **Shopping Cart** with guest support
- ✅ **Order Management** with tracking
- ✅ **SEO Optimized** with slugs and meta tags
- ✅ **Analytics Ready** with session tracking
- ⏳ **Payment Processing** (Stripe/PayPal)
- ⏳ **Admin Dashboard** 
- ⏳ **Mobile Responsive** frontend

## 🏃‍♂️ Quick Start

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/ecommerce-monorepo.git
cd ecommerce-monorepo

# Setup backend
cd backend
pnpm install
npx prisma migrate dev
npx prisma generate

# Start development server
pnpm run start:dev