# NexusDash — QA Automation Dashboard (Frontend)

A polished, dark-neon **QA automation dashboard** built with **React + TypeScript + Vite**.
It manages test **projects, suites and cases**, launches and reviews **test runs**
(with per-scenario breakdown, tags and logs), and administers **devices** and
**users** — all behind a JWT login with a dark/light theme.

### 🔗 Live demo: **https://eminliaysun05.github.io/Automation_Dashboard_Frontend/**

> The live demo runs fully in the browser on an in-memory mock API (no backend
> needed). Sign in with **`admin@example.com` / `admin123`**.

Backend (companion repo): **https://github.com/EminliAysun05/Automation_Dashboard_Backend**

---

## ✨ Features

- **JWT auth** — login gate, token persistence, auto-logout on expiry.
- **Dashboard** — live metrics (devices, utilisation, runs).
- **Projects & Test Management** — browse projects → suites → sub-suites → test
  cases, with automation status and tag chips.
- **Run launcher & history** — start runs, then drill into each run's scenarios,
  statuses, tags and full log.
- **Devices** — inventory CRUD with online / busy / offline status.
- **Users** — user administration with roles and permissions.
- **Theming** — dark / light mode, smooth motion, responsive layout.

## 🧱 Tech stack

React 19 · TypeScript · Vite · Tailwind CSS · Motion · Recharts · lucide-react ·
Express (dev server / mock API).

## 🚀 Run locally

**Prerequisites:** Node.js 20+

```bash
npm install
npm run dev
```

Dev server: http://localhost:3000 · demo login `admin@example.com` / `admin123`.

### Modes

| Command | Behaviour |
|---------|-----------|
| `USE_MOCK=true npm run dev` | Standalone with the built-in mock API (no backend). |
| `USE_MOCK=false VITE_API_URL=http://localhost:5062 npm run dev` | Talk to the real [backend](https://github.com/EminliAysun05/Automation_Dashboard_Backend). |

Env vars: `VITE_API_URL`, `USE_MOCK`, `PORT` (see `.env.example`).

## 🏗️ Build & deploy

```bash
npm run build      # vite build + bundled express server
npm start          # serve the production build
```

The live demo is deployed to **GitHub Pages** by a GitHub Actions workflow
(`.github/workflows/deploy-pages.yml`) which builds a static, client-mocked
version (`VITE_STATIC_DEMO=true`). To enable it on a fork: repo **Settings →
Pages → Build and deployment → Source: GitHub Actions**.

## 📁 Structure

```
src/
├── App.tsx            # dashboard, projects, runs, devices, users
├── LoginGate.tsx      # auth gate + login form
├── lib/
│   ├── auth.ts        # token storage + fetch interceptor
│   ├── staticMock.ts  # in-browser mock API for the static demo
│   └── utils.ts
└── types.ts
server.ts              # dev server + proxy / mock API
```
