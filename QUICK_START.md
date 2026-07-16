# Quick Start

Get the app running in a few steps.

## 1. Install and configure

```bash
npm install
cp .env.example .env
```

Edit `.env`: set `DATABASE_URL`, `JWT_SECRET`, and `JWT_REFRESH_SECRET`.  
See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md#4-environment-variables) for the full list.

## 2. Database and admin user

```bash
npm run db:push
npm run create-admin
```

This creates an admin account: username `admin`, email `admin@keru.ai`, password `admin123`.

## 3. Run

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000).

---

**If classes or data don’t show:** clear site data and service workers once (e.g. DevTools → Application → Storage → Clear site data; Service Workers → Unregister). Details: [Development guide → Troubleshooting](docs/DEVELOPMENT.md#6-troubleshooting).

**Full setup and scripts:** [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
