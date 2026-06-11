import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const BACKEND_URL = process.env.VITE_API_URL || "http://localhost:5062";
const USE_MOCK = process.env.USE_MOCK !== "false";

// IMPORTANT: only parse JSON bodies in mock mode. When proxying to the
// real backend, express.json() would consume the request stream and the
// proxy would forward an empty body (Content-Length mismatch → backend
// hangs / 408). The proxy must see the raw, untouched stream.
if (USE_MOCK) {
  app.use(express.json());
}

// ───────────── MOCK DATA ─────────────
const mockProjects = [
  { code: "WEB", title: "Web App" },
  { code: "API", title: "API Service" },
  { code: "MOB", title: "Mobile App" },
];

const mockSuites: Record<string, any[]> = {
  WEB: [
    { id: 1, title: "Authentication", parent_id: null },
    { id: 2, title: "Login", parent_id: 1 },
    { id: 3, title: "Registration", parent_id: 1 },
    { id: 4, title: "User Profile", parent_id: null },
    { id: 5, title: "Settings", parent_id: 4 },
    { id: 6, title: "Checkout", parent_id: null },
  ],
  API: [
    { id: 11, title: "Auth Endpoints", parent_id: null },
    { id: 12, title: "Token Refresh", parent_id: 11 },
    { id: 13, title: "Resource Endpoints", parent_id: null },
  ],
  MOB: [
    { id: 21, title: "Onboarding", parent_id: null },
    { id: 22, title: "Home", parent_id: null },
  ],
};

const mockDevices = [
  { id: "d1", name: "Demo Android A", identity: "DEVICE-0001", platform: "Android", osVersion: "14", status: "online" },
  { id: "d2", name: "Demo iPhone", identity: "DEVICE-0002", platform: "iOS", osVersion: "17.4", status: "busy" },
  { id: "d3", name: "Demo Android B", identity: "DEVICE-0003", platform: "Android", osVersion: "13", status: "online" },
];

const mockUsers = [
  { id: "u1", username: "admin", role: "admin", permissions: ["execute", "read", "provision", "write"], emails: ["admin@example.com"], createdAt: "2025-09-01T10:00:00Z" },
  { id: "u2", username: "qa.tester", role: "user", permissions: ["execute", "read"], emails: ["qa@example.com"], createdAt: "2025-10-15T12:00:00Z" },
  { id: "u3", username: "dev.lead", role: "admin", permissions: ["execute", "read", "write"], emails: ["dev@example.com"], createdAt: "2026-01-08T09:00:00Z" },
];

const mockTestRuns = [
  { id: "r1", projectName: "Web App", projectCode: "WEB", suiteName: "Authentication", caseName: "Login with valid credentials", status: "passed", duration: "00:02:14", timestamp: "2026-05-23T18:30:00Z" },
  { id: "r2", projectName: "Web App", projectCode: "WEB", suiteName: "Authentication", caseName: "Login with invalid password", status: "failed", duration: "00:01:42", timestamp: "2026-05-23T19:15:00Z" },
  { id: "r3", projectName: "Web App", projectCode: "WEB", suiteName: "User Profile", caseName: "Update profile details", status: "passed", duration: "00:03:55", timestamp: "2026-05-24T08:10:00Z" },
  { id: "r4", projectName: "Web App", projectCode: "WEB", suiteName: "Checkout", caseName: "Complete checkout with card", status: "passed", duration: "00:00:48", timestamp: "2026-05-24T09:00:00Z" },
  { id: "r5", projectName: "API Service", projectCode: "API", suiteName: "Auth Endpoints", caseName: "Issue access token", status: "passed", duration: "00:01:30", timestamp: "2026-05-24T10:20:00Z" },
  { id: "r6", projectName: "API Service", projectCode: "API", suiteName: "Auth Endpoints", caseName: "Reject expired token", status: "failed", duration: "00:00:55", timestamp: "2026-05-24T10:35:00Z" },
];

const mockNotifications = [
  { id: "n1", recipientEmail: "qa@example.com", recipientUsername: "qa.tester", subject: "Suite failure: Authentication", body: "One test failed during the nightly run.\n\nSuite: Authentication\nCase: Login with invalid password\nDuration: 00:01:42\n\nSee execution logs for details.", timestamp: "2026-05-23T20:00:00Z" },
  { id: "n2", recipientEmail: "dev@example.com", recipientUsername: "dev.lead", subject: "Release candidate ready", body: "All smoke tests passed on the latest build.\n\n- 24 cases executed\n- 0 failed\n- avg duration 02:08\n\nProceed with deployment.", timestamp: "2026-05-24T07:00:00Z" },
  { id: "n3", recipientEmail: "admin@example.com", recipientUsername: "admin", subject: "Nightly Run Completed - WEB", body: "Project: Web App\nTotal: 12 cases\nPassed: 11\nFailed: 1\n\nFailed case: Login with invalid password (Timeout)\n\nReview attached logs.", timestamp: "2026-05-24T03:15:00Z" },
  { id: "n4", recipientEmail: "admin@example.com", recipientUsername: "admin", subject: "New Device Online: Demo iPhone", body: "Device d2 (Demo iPhone, iOS 17.4) is now online and available for runs.", timestamp: "2026-05-24T08:42:00Z" },
  { id: "n5", recipientEmail: "admin@example.com", recipientUsername: "admin", subject: "Checkout Suite - Manual Review", body: "The Checkout suite passed but flagged 2 warnings.\n\nWarning 1: payment confirmation delayed > 8s\nWarning 2: price check returned stale cache value.\n\nManual review recommended.", timestamp: "2026-05-24T09:50:00Z" },
];

const buildRunDetails = (id: string) => {
  const run = mockTestRuns.find((r) => r.id === id);
  return {
    id,
    projectName: run?.projectName || "Web App",
    suiteName: run?.suiteName || "Authentication",
    timestamp: run?.timestamp || new Date().toISOString(),
    status: (run?.status as "passed" | "failed") || "passed",
    video: "",
    screenshots: [],
    logs: [
      "[INFO] Spinning up device...",
      "[INFO] Device ready: iPhone 14 Pro",
      "[INFO] Launching app",
      "[INFO] App launched in 1.2s",
      "[INFO] Tapping login button",
      run?.status === "failed" ? "[ERROR] Element not visible after 10s" : "[INFO] Login successful",
      "[INFO] Capturing artifacts",
    ],
    history: [
      { date: "2026-05-22", status: "passed" as const },
      { date: "2026-05-23", status: (run?.status as "passed" | "failed") || "passed" },
      { date: "2026-05-24", status: "passed" as const },
    ],
    error: run?.status === "failed" ? "Timeout: Element 'loginButton' not visible within 10000ms" : undefined,
    allure: {
      steps: [
        { name: "Open application", status: "passed" as const, duration: "1.2s" },
        { name: "Navigate to login", status: "passed" as const, duration: "0.4s" },
        { name: "Enter credentials", status: "passed" as const, duration: "0.9s" },
        { name: "Submit login", status: (run?.status as "passed" | "failed") || "passed", duration: "0.6s" },
      ],
      environment: { Platform: "iOS", "OS Version": "17.4", Device: "iPhone 14 Pro", AppVersion: "3.2.1" },
    },
  };
};

if (USE_MOCK) {
  app.get("/api/qase/projects", (_req, res) => res.json({ result: { entities: mockProjects } }));
  app.get("/api/qase/suites/:code", (req, res) => {
    const code = req.params.code.toUpperCase();
    res.json({ result: { entities: mockSuites[code] || [] } });
  });
  app.get("/api/qase/cases/:code", (_req, res) => res.json({ result: { entities: [] } }));
  app.get("/api/details/:id", (req, res) => res.json(buildRunDetails(req.params.id)));
  app.get("/api/devices", (_req, res) => res.json(mockDevices));
  app.post("/api/devices", (req, res) => res.json({ id: "d" + Date.now(), ...req.body }));
  app.put("/api/devices/:id", (req, res) => res.json({ id: req.params.id, ...req.body }));
  app.delete("/api/devices/:id", (_req, res) => res.json({ ok: true }));
  app.get("/api/users", (_req, res) => res.json(mockUsers));
  app.post("/api/users", (req, res) => res.json({ id: "u" + Date.now(), createdAt: new Date().toISOString(), ...req.body }));
  app.put("/api/users/:id", (req, res) => res.json({ id: req.params.id, ...req.body }));
  app.delete("/api/users/:id", (_req, res) => res.json({ ok: true }));
  app.get("/api/test-runs", (_req, res) => res.json(mockTestRuns));
  app.get("/api/notifications", (_req, res) => res.json(mockNotifications));
  app.post("/api/notifications", (req, res) => res.json({ id: "n" + Date.now(), timestamp: new Date().toISOString(), ...req.body }));
  app.post("/api/qase/projects", (req, res) => res.json({ ok: true, ...req.body }));
  app.post("/api/qase/suites/:code", (req, res) => res.json({ ok: true, ...req.body }));
  app.post("/api/qase/cases/:code", (req, res) => res.json({ ok: true, ...req.body }));
  // Catch-all for anything we forgot
  app.all("/api/*", (_req, res) => res.json({ ok: true }));
} else {
  app.use(
    createProxyMiddleware({
      pathFilter: "/api",
      target: BACKEND_URL,
      changeOrigin: true,
    })
  );
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Frontend running on http://localhost:${PORT}`);
    if (USE_MOCK) {
      console.log("API mock layer active (set USE_MOCK=false to proxy to real backend)");
    } else {
      console.log(`API proxied to ${BACKEND_URL}`);
    }
  });
}

startServer();
