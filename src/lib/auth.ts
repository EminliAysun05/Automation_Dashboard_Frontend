const TOKEN_KEY = "nexusdash.jwt";
const USER_KEY = "nexusdash.user";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: "Admin" | "User";
  permissions: string[];
  createdAt: string;
}

export const auth = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  save(token: string, user: AuthUser) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// Global fetch interceptor: auto-attach Bearer token, redirect to login on 401
const originalFetch = window.fetch.bind(window);
window.fetch = async (input, init = {}) => {
  const url = typeof input === "string" ? input : (input as Request).url;
  const isApi = url.includes("/api/") || url.startsWith("/api");

  if (isApi) {
    const token = auth.getToken();
    if (token) {
      init.headers = {
        ...(init.headers || {}),
        Authorization: `Bearer ${token}`,
      };
    }
  }

  const response = await originalFetch(input, init);

  if (isApi && response.status === 401 && !url.endsWith("/api/auth/login")) {
    auth.clear();
    window.dispatchEvent(new Event("auth:expired"));
  }

  return response;
};

export async function login(username: string, password: string): Promise<AuthUser> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Login failed" }));
    throw new Error(err.error || "Invalid credentials");
  }
  const data = await res.json();
  auth.save(data.token, data.user);
  return data.user as AuthUser;
}

export function logout() {
  auth.clear();
  window.dispatchEvent(new Event("auth:expired"));
}
