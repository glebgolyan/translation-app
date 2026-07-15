# TranslateOS — Document Translation Management Platform

A full-stack translation management system with role-based access control.

---

## 🏗 Architecture

```
translation-app/          ← Next.js 14 Frontend (App Router)
translation-backend/      ← NestJS Backend API
```

### Frontend — Feature-Sliced Design

```
app/                      ← Next.js App Router pages
  layout.tsx              ← Root layout (providers)
  page.tsx                ← Root redirect
  login/page.tsx          ← Login page
  register/page.tsx       ← Registration page
  dashboard/
    layout.tsx            ← Dashboard layout with sidebar
    page.tsx              ← Dashboard home
  orders/page.tsx         ← Manager/Admin orders table
  my-orders/page.tsx      ← Client order view
  assignments/page.tsx    ← Translator assignments
  admin/users/page.tsx    ← Admin user management

shared/
  api/client.ts           ← Axios instance + interceptors
  ui/StatusBadge.tsx      ← Reusable components
  providers/              ← Chakra + React Query providers

entities/
  user/model/types.ts     ← User & auth types
  order/model/types.ts    ← Order types, DTOs, filters

features/
  auth/
    api/authApi.ts        ← Auth API calls
    model/useAuth.ts      ← Auth hook
  orders/api/ordersApi.ts ← Orders API calls
  admin/api/usersApi.ts   ← Users API calls
  files/ui/FileUpload.tsx ← File upload component

widgets/
  sidebar/Sidebar.tsx     ← Navigation sidebar
  order-table/OrderTable.tsx ← Sortable, filterable table
  order-form/OrderForm.tsx   ← Create/edit order form
```

### Backend — NestJS

```
src/
  auth/
    auth.controller.ts    ← /api/auth/* endpoints
    auth.service.ts       ← Business logic
    strategies/jwt.ts     ← JWT Passport strategy
    guards/               ← JwtAuthGuard, RolesGuard
  orders/
    orders.controller.ts  ← /api/orders/* endpoints
    orders.service.ts     ← RBAC order logic
  users/
    users.controller.ts   ← /api/users/* endpoints
    users.service.ts      ← Admin user management
  files/s3.service.ts     ← AWS S3 file upload
  common/prisma.service.ts ← Database client
```

---

## 🚀 Setup

### Prerequisites

- Node.js 18+
- PostgreSQL
- AWS S3 bucket (for file storage)

### 1. Backend

```bash
cd translation-backend
cp .env.example .env       # Fill in your values
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run start:dev
```

### 2. Frontend

```bash
cd translation-app
cp .env.local.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗄 Database Schema

### Users

| Field     | Type     |
| --------- | -------- |
| id        | cuid     |
| email     | String   |
| password  | String   |
| name      | String   |
| phone     | String?  |
| role      | Enum     |
| createdAt | DateTime |

### Orders

| Field             | Type      |
| ----------------- | --------- |
| id                | cuid      |
| createdAt         | DateTime  |
| dueDate           | DateTime? |
| sourceLanguage    | String    |
| targetLanguage    | String    |
| clientName        | String    |
| phone             | String    |
| documentType      | String?   |
| documentCount     | Int       |
| notarizationCount | Int       |
| totalPrice        | Float     |
| deposit           | Float     |
| remainingAmount   | Float     |
| paymentType       | Enum      |
| cardAmount        | Float?    |
| status            | Enum      |
| originalFiles     | String[]  |
| translatedFiles   | String[]  |
| clientId          | FK User   |
| translatorId      | FK User?  |

---

## 📡 API Endpoints

### Auth

| Method | Path                      | Roles | Description     |
| ------ | ------------------------- | ----- | --------------- |
| POST   | /api/auth/register        | —     | Register client |
| POST   | /api/auth/login           | —     | Login           |
| GET    | /api/auth/me              | All   | Current user    |
| POST   | /api/auth/refresh         | —     | Refresh tokens  |
| POST   | /api/auth/impersonate/:id | ADMIN | Login as user   |

### Orders

| Method | Path                   | Roles               | Description       |
| ------ | ---------------------- | ------------------- | ----------------- |
| GET    | /api/orders            | All                 | List (RBAC)       |
| POST   | /api/orders            | All                 | Create order      |
| GET    | /api/orders/:id        | All                 | Get order         |
| PATCH  | /api/orders/:id        | MANAGER, ADMIN      | Update order      |
| DELETE | /api/orders/:id        | ADMIN               | Delete order      |
| PATCH  | /api/orders/:id/assign | MANAGER, ADMIN      | Assign translator |
| POST   | /api/orders/:id/files  | MANAGER, TRANSLATOR | Upload files      |

### Users

| Method | Path                | Roles | Description |
| ------ | ------------------- | ----- | ----------- |
| GET    | /api/users          | ADMIN | List users  |
| PATCH  | /api/users/:id/role | ADMIN | Change role |
| DELETE | /api/users/:id      | ADMIN | Delete user |

---

## 🔐 RBAC Summary

| Action                  | CLIENT | MANAGER | TRANSLATOR | ADMIN |
| ----------------------- | ------ | ------- | ---------- | ----- |
| Create order            | ✅     | ✅      | —          | ✅    |
| View own orders         | ✅     | ✅      | ✅         | ✅    |
| View all orders         | —      | ✅      | —          | ✅    |
| Edit order details      | —      | ✅      | —          | ✅    |
| Assign translator       | —      | ✅      | —          | ✅    |
| Upload original files   | ✅     | ✅      | —          | ✅    |
| Upload translated files | —      | ✅      | ✅         | ✅    |
| Manage users            | —      | —       | —          | ✅    |
| Impersonate user        | —      | —       | —          | ✅    |

---

## 🎨 UI Pages by Role

| Role       | Pages Available                                    |
| ---------- | -------------------------------------------------- |
| CLIENT     | Dashboard, My Orders (create + view)               |
| MANAGER    | Dashboard, Orders (full table + edit + assign)     |
| TRANSLATOR | Dashboard, Assignments (view + upload translation) |
| ADMIN      | Dashboard, Orders, Users (full control)            |
