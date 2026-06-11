export interface Build {
  id: string;
  project: string;
  status: "success" | "failed" | "running" | "queued";
  duration: string;
  timestamp: string;
  author: string;
  commit: string;
}

export interface Metric {
  label: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "neutral";
}

export interface QaseProject {
  code: string;
  title: string;
}

export interface QaseSuite {
  id: number;
  title: string;
  parent_id: number | null;
}

export interface RunResult {
  status: "passed" | "failed";
  video: string;
  screenshots: string[];
  allure: {
    steps: {
      name: string;
      status: "passed" | "failed";
      duration: string;
    }[];
    environment: Record<string, string>;
  };
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: "admin" | "user";
  permissions?: string[];
  email?: string;        // backend uses a single email
  emails?: string[];     // legacy/mock multi-email support
  createdAt: string;
}

export interface TestRun {
  id: string;
  projectName: string;
  projectCode: string;
  suiteName: string;
  caseName: string;
  status: "passed" | "failed";
  duration: string;
  timestamp: string;
}

export interface EmailNotification {
  id: string;
  recipientEmail: string;
  recipientUsername: string;
  subject: string;
  body: string;
  timestamp: string;
}

export interface Device {
  id: string;
  name: string;
  identity?: string;
  platform: "iOS" | "Android";
  osVersion: string;
  status: "online" | "offline" | "busy";
}

export interface RunDetails extends RunResult {
  id: string;
  projectName: string;
  suiteName: string;
  timestamp: string;
  logs: string[];
  history: { date: string; status: "passed" | "failed" }[];
  error?: string;
}
