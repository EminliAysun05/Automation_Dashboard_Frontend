/**
 * Client-side mock API for the static GitHub Pages demo.
 *
 * When the app is built with VITE_STATIC_DEMO=true there is no backend, so this
 * module patches window.fetch to answer every /api/* request with in-memory
 * demo data. It is imported FIRST in main.tsx so it wraps fetch before lib/auth
 * captures it.
 */

const ENABLED = (import.meta as any).env?.VITE_STATIC_DEMO === "true";

type Json = any;

const now = () => new Date().toISOString();

/* ── Demo data ──────────────────────────────────────────────────────── */

const projects = [
  { code: "WEB", title: "Web App" },
  { code: "API", title: "API Service" },
  { code: "MOB", title: "Mobile App" },
];

const suites = [
  { id: 1, title: "Authentication", parentId: null },
  { id: 2, title: "Login", parentId: 1 },
  { id: 3, title: "Registration", parentId: 1 },
  { id: 4, title: "User Profile", parentId: null },
  { id: 5, title: "Settings", parentId: 4 },
  { id: 6, title: "Checkout", parentId: null },
];

const cases = [
  { id: 101, title: "Login with valid credentials", suiteId: 2, automation: 2, tags: ["smoke", "regression"] },
  { id: 102, title: "Login with invalid password", suiteId: 2, automation: 2, tags: ["regression"] },
  { id: 103, title: "Reset password via email", suiteId: 2, automation: 0, tags: ["regression"] },
  { id: 104, title: "Register a new account", suiteId: 3, automation: 2, tags: ["smoke"] },
  { id: 105, title: "Register with an existing email", suiteId: 3, automation: 1, tags: [] },
  { id: 106, title: "Update profile details", suiteId: 5, automation: 0, tags: [] },
  { id: 107, title: "Change account password", suiteId: 5, automation: 2, tags: ["regression"] },
  { id: 108, title: "Complete checkout with card", suiteId: 6, automation: 2, tags: ["smoke", "payments"] },
  { id: 109, title: "Checkout with an expired card", suiteId: 6, automation: 0, tags: ["payments"] },
];

const devices = [
  { id: "d1", name: "Demo Android A", identity: "DEVICE-0001", platform: "Android", osVersion: "14", nodeAddress: null, status: "online", lastSeenAt: now() },
  { id: "d2", name: "Demo iPhone", identity: "DEVICE-0002", platform: "iOS", osVersion: "17.4", nodeAddress: null, status: "busy", lastSeenAt: now() },
  { id: "d3", name: "Demo Android B", identity: "DEVICE-0003", platform: "Android", osVersion: "13", nodeAddress: null, status: "online", lastSeenAt: now() },
];

const users = [
  { id: "u1", username: "admin", email: "admin@example.com", role: "Admin", permissions: ["read", "write", "execute", "provision"], createdAt: "2025-09-01T10:00:00Z" },
  { id: "u2", username: "qa.tester", email: "qa@example.com", role: "User", permissions: ["read", "execute"], createdAt: "2025-10-15T12:00:00Z" },
  { id: "u3", username: "dev.lead", email: "dev@example.com", role: "Admin", permissions: ["read", "write"], createdAt: "2026-01-08T09:00:00Z" },
];

const notifications = [
  { id: "n1", recipientEmail: "qa@example.com", recipientUsername: "qa.tester", subject: "Suite failure: Authentication", body: "One test failed during the nightly run.\n\nSuite: Authentication\nCase: Login with invalid password\nDuration: 00:01:42", timestamp: "2026-05-23T20:00:00Z" },
  { id: "n2", recipientEmail: "dev@example.com", recipientUsername: "dev.lead", subject: "Release candidate ready", body: "All smoke tests passed on the latest build.\n\n- 24 cases executed\n- 0 failed\n- avg duration 02:08", timestamp: "2026-05-24T07:00:00Z" },
  { id: "n3", recipientEmail: "admin@example.com", recipientUsername: "admin", subject: "Nightly Run Completed - WEB", body: "Project: Web App\nTotal: 12 cases\nPassed: 11\nFailed: 1", timestamp: "2026-05-24T03:15:00Z" },
];

const SCENARIOS: { name: string; tags: string[]; status: string }[] = [
  { name: "Login with valid credentials", tags: ["@smoke", "@regression"], status: "passed" },
  { name: "Login with invalid password", tags: ["@regression"], status: "passed" },
  { name: "Reset password via email", tags: ["@regression"], status: "passed" },
  { name: "Register a new account", tags: ["@smoke"], status: "passed" },
  { name: "Update profile details", tags: ["@regression"], status: "passed" },
  { name: "Change account password", tags: ["@regression"], status: "failed" },
  { name: "Complete checkout with card", tags: ["@smoke", "@payments"], status: "passed" },
];

const demoLog = () => {
  const lines = ["Demo run started — static demo, no real execution."];
  for (const s of SCENARIOS) {
    lines.push(`Before scenario: ${s.name}`);
    lines.push(s.tags.join(" "));
    lines.push(`Scenario: ${s.name}`);
    lines.push("  Given the application is open");
    lines.push("  When the user performs the action");
    lines.push("  Then the expected result is shown");
    lines.push(`After scenario: ${s.name} - status: ${s.status.toUpperCase()}`);
  }
  lines.push("Demo run finished.");
  return lines.join("\n");
};

const scenarioItems = () =>
  SCENARIOS.map((s, i) => ({ order: i + 1, tags: s.tags, name: s.name, featureFile: null, status: s.status, logLineFrom: 0 }));

const runs: Json[] = [
  {
    id: "run-0001", projectKey: "WEB", platform: "Android", status: "Success",
    deviceUdids: "DEVICE-0001", command: "demo run (no real execution)",
    startedAt: "2026-05-24T09:00:00Z", endedAt: "2026-05-24T09:00:42Z",
  },
];

const metrics = () => ({
  totalRuns: runs.length,
  uptimePercent: 100,
  avgRunTime: "00:42",
  resourceUsagePercent: Math.round((devices.filter(d => d.status === "busy").length / devices.length) * 100),
  totalDevices: devices.length,
  busyDevices: devices.filter(d => d.status === "busy").length,
  onlineDevices: devices.filter(d => d.status === "online").length,
});

/* ── Router ─────────────────────────────────────────────────────────── */

function json(data: Json, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}
function text(body: string): Response {
  return new Response(body, { status: 200, headers: { "Content-Type": "text/plain" } });
}

async function handle(method: string, path: string, body: Json): Promise<Response> {
  const m = (re: RegExp) => re.exec(path);

  if (method === "POST" && path === "/api/auth/login")
    return json({ token: "demo-token", user: users[0] });

  if (path === "/api/dashboard/metrics") return json(metrics());

  if (path === "/api/qase/projects" && method === "GET")
    return json({ status: true, result: { entities: projects, total: projects.length } });
  if (m(/^\/api\/qase\/suites\//) && method === "GET")
    return json({ status: true, result: { entities: suites, total: suites.length } });
  if (m(/^\/api\/qase\/cases\//) && method === "GET")
    return json({ status: true, result: { entities: cases, total: cases.length } });
  if (m(/^\/api\/qase\//) && method === "POST")
    return json({ status: true, result: { ...body, id: Math.floor(Math.random() * 9000) + 1000 } });

  if (path === "/api/devices" && method === "GET") return json(devices);
  if (path === "/api/devices" && method === "POST") return json({ id: "d" + Date.now(), status: "offline", lastSeenAt: null, ...body });
  if (m(/^\/api\/devices\/[^/]+\/status/)) return json({ success: true });
  if (m(/^\/api\/devices\/[^/]+$/) && method === "PUT") return json({ id: path.split("/").pop(), ...body });
  if (m(/^\/api\/devices\/[^/]+$/) && method === "DELETE") return json({ success: true });

  if (path === "/api/users" && method === "GET") return json(users);
  if (path === "/api/users" && method === "POST") return json({ id: "u" + Date.now(), createdAt: now(), ...body });
  if (m(/^\/api\/users\/[^/]+$/) && method === "PUT") return json({ id: path.split("/").pop(), ...body });
  if (m(/^\/api\/users\/[^/]+$/) && method === "DELETE") return json({ success: true });

  if (path === "/api/e2e/devices")
    return json({
      android: [
        { udid: "DEVICE-0001", model: "Demo Android A", androidVersion: "14", ready: true },
        { udid: "DEVICE-0003", model: "Demo Android B", androidVersion: "13", ready: true },
      ],
      ios: [{ udid: "DEVICE-0002", name: "Demo iPhone", osVersion: "17.4" }],
      iosPreflight: { tunnelUp: true, wdaReachable: true, wdaUrl: "http://127.0.0.1:8100", hint: null },
    });

  if (m(/^\/api\/e2e\/runs\/(android|ios)$/) && method === "POST") {
    const isIos = path.endsWith("/ios");
    const run = {
      id: "run-" + Date.now(), projectKey: body?.projectKey || "DEMO",
      platform: isIos ? "Ios" : "Android", status: "Success",
      deviceUdids: isIos ? (body?.deviceUdid || "DEVICE-0002") : (body?.deviceUdids || ["DEVICE-0001"]).join(","),
      command: "demo run (no real execution)", startedAt: now(), endedAt: now(),
    };
    runs.unshift(run);
    return json(run);
  }
  if (path === "/api/e2e/runs" && method === "GET") return json(runs);
  if (m(/^\/api\/e2e\/runs\/[^/]+\/scenarios/)) return json({ items: scenarioItems() });
  if (m(/^\/api\/e2e\/runs\/[^/]+\/log/)) return text(demoLog());
  if (m(/^\/api\/e2e\/runs\/[^/]+\/artifacts/)) return json({ items: [] });
  if (m(/^\/api\/e2e\/runs\/[^/]+\/stop/)) return json({ stopped: true });
  if (m(/^\/api\/e2e\/runs\/[^/]+$/)) {
    const id = path.split("/").pop();
    return json(runs.find(r => r.id === id) || runs[0]);
  }

  if (path === "/api/notifications" && method === "GET") return json(notifications);
  if (path === "/api/notifications" && method === "POST") return json({ id: "n" + Date.now(), timestamp: now(), ...body });
  if (path === "/api/test-runs") return json([]);

  // Unknown — succeed quietly so the UI never hard-errors in the demo.
  return json({ ok: true });
}

/* ── Install ────────────────────────────────────────────────────────── */

if (ENABLED) {
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : (input as Request).url;
    const path = url.replace(/^https?:\/\/[^/]+/, "").split("?")[0];
    if (path.startsWith("/api/")) {
      const method = (init.method || (typeof input !== "string" && !(input instanceof URL) ? (input as Request).method : "GET") || "GET").toUpperCase();
      let body: Json = undefined;
      try { body = init.body ? JSON.parse(init.body as string) : undefined; } catch { /* non-json */ }
      await new Promise(r => setTimeout(r, 120)); // tiny latency for realism
      return handle(method, path, body);
    }
    return realFetch(input as any, init);
  };
  // eslint-disable-next-line no-console
  console.log("%cNexusDash static demo — using in-memory mock API", "color:#E05370;font-weight:bold");
}
