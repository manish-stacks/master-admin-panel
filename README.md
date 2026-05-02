# NexusCMS — SEO-First Headless CMS

A powerful, SEO-first headless CMS built on **Next.js 14**, **MySQL**, and **Prisma ORM**. A complete WordPress alternative with a clean light-mode admin panel.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### 2. Clone & Install

```bash
git clone <repo-url>
cd nexuscms
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/nexuscms"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
```

### 4. Setup Database

```bash
# Create MySQL database
mysql -u root -p -e "CREATE DATABASE nexuscms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:push

# Seed with admin user and sample data
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit **http://localhost:3000** — you'll be redirected to the dashboard.

---

## 🔑 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@example.com | Admin@123 |
| Editor | editor@example.com | Editor@123 |
| SEO Manager | seo@example.com | Editor@123 |

---

## 📁 Project Structure

```
nexuscms/
├── prisma/
│   ├── schema.prisma          # Database schema (12 tables)
│   └── seed.ts                # Database seeder
├── src/
│   ├── app/
│   │   ├── auth/login/        # Login page
│   │   ├── dashboard/
│   │   │   ├── page.tsx       # Dashboard home
│   │   │   ├── pages/         # Page management
│   │   │   ├── blogs/         # Blog management
│   │   │   ├── media/         # Media library
│   │   │   ├── seo/           # SEO engine
│   │   │   ├── leads/         # Lead management
│   │   │   ├── redirects/     # Redirect manager
│   │   │   └── settings/      # Settings
│   │   └── api/
│   │       ├── auth/          # Auth endpoints
│   │       ├── pages/         # Pages CRUD
│   │       ├── blogs/         # Blogs CRUD
│   │       ├── leads/         # Leads + export
│   │       ├── media/         # Media
│   │       ├── seo/           # SEO settings
│   │       ├── redirects/     # Redirects
│   │       ├── upload/        # File upload (Cloudinary)
│   │       ├── sitemap/       # Auto sitemap.xml
│   │       ├── robots/        # robots.txt
│   │       └── contact/       # Public contact form
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Topbar.tsx
│   ├── lib/
│   │   ├── prisma.ts          # Prisma singleton
│   │   └── auth.ts            # JWT utilities
│   ├── middleware.ts           # Route protection
│   └── types/index.ts         # TypeScript types
├── .env.example
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 🗄️ Database Schema

| Table | Description |
|-------|-------------|
| users | Admin users with roles |
| refresh_tokens | JWT refresh token storage |
| pages | Dynamic pages with content |
| blogs | Blog posts with categories/tags |
| categories | Blog categories |
| tags | Blog tags |
| seo_meta | Per-page SEO metadata |
| leads | Contact form submissions |
| media | Uploaded files (Cloudinary) |
| settings | Key-value configuration store |
| redirects | 301/302 URL redirects |
| activity_logs | Audit trail |

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| SUPER_ADMIN | Full access to everything |
| ADMIN | All content, settings, leads |
| EDITOR | Pages and blogs only |
| SEO_MANAGER | SEO, meta tags, redirects |

---

## 🔌 API Endpoints

### Auth
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `POST /api/auth/refresh` — Refresh token

### Pages
- `GET /api/pages` — List pages
- `POST /api/pages` — Create page
- `GET /api/pages/[id]` — Get page
- `PUT /api/pages/[id]` — Update page
- `DELETE /api/pages/[id]` — Delete page

### Blogs
- `GET /api/blogs` — List blogs
- `POST /api/blogs` — Create blog
- `GET /api/blogs/[id]` — Get blog
- `PUT /api/blogs/[id]` — Update blog

### Leads
- `GET /api/leads` — List leads (auth required)
- `POST /api/leads` — Submit lead (auth required)
- `GET /api/leads/export` — Export CSV
- `POST /api/contact` — Public contact form

### SEO
- `GET /api/sitemap` — Dynamic sitemap.xml
- `GET /api/robots` — robots.txt
- `POST /api/seo/robots` — Update robots.txt

### Media
- `POST /api/upload` — Upload files (Cloudinary)

---

## ⚙️ Integrations

### Cloudinary (Media)
Add to `.env`:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### SMTP Email (Lead Notifications)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@yourdomain.com
```

---

## 🔐 Security Features

- ✅ JWT + Refresh Token Auth
- ✅ HTTP-only cookies
- ✅ bcrypt password hashing
- ✅ Zod input validation
- ✅ Prisma parameterized queries (SQL injection safe)
- ✅ Middleware route protection
- ✅ Rate limiting on contact form (3/hour per IP)
- ✅ Activity audit logs
- ✅ Role-based access control

---

## 🌐 Headless CMS Usage

Use the public API from your frontend Next.js site:

```javascript
// Fetch published pages
const res = await fetch('https://your-cms.com/api/pages?status=PUBLISHED')
const { data } = await res.json()

// Submit contact form
await fetch('https://your-cms.com/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, message })
})
```

---

## 📦 Build for Production

```bash
npm run build
npm start
```

---

## 🛠️ Tech Stack

- **Next.js 14** (App Router, Server Actions)
- **MySQL 8** + **Prisma ORM**
- **JWT** (jsonwebtoken) + **bcryptjs**
- **Tailwind CSS** (light mode, custom design)
- **Cloudinary** (media storage)
- **Nodemailer** (SMTP email)
- **Zod** (validation)
- **TipTap** (rich text editor)
