import React, { useState, useEffect, useMemo } from "react";
import { 
  Activity, 
  Box, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  FileText, 
  Github, 
  LayoutDashboard, 
  Play, 
  RefreshCw, 
  Search, 
  Settings, 
  Terminal, 
  XCircle,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Zap,
  Plus,
  MoreVertical,
  PlayCircle,
  Video,
  Image as ImageIcon,
  Layers,
  Monitor,
  Cpu,
  Info,
  Users,
  Smartphone,
  Trash2,
  Edit2,
  ShieldCheck,
  Lock,
  ChevronLeft,
  Mail,
  Send,
  Inbox,
  Radio,
  CheckSquare,
  Sun,
  Moon,
  Bell
} from "lucide-react";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";
import { auth } from "./lib/auth";
import { Build, Metric, QaseProject, QaseSuite, RunResult, RunDetails, User, Device } from "./types";

// --- Components ---

const StatusBadge = ({ status }: { status: "passed" | "failed" | "success" | "running" | "queued" | "online" | "offline" | "busy" | "stopped" | "pending" | "skipped" }) => {
  const styles = {
    success: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
    passed: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
    failed: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20",
    running: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 animate-pulse",
    queued: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
    online: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
    offline: "bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-500/20",
    busy: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
    stopped: "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20",
    pending: "bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20",
    skipped: "bg-zinc-100 dark:bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-500/20",
  };

  const Icons = {
    success: CheckCircle2,
    passed: CheckCircle2,
    failed: XCircle,
    running: RefreshCw,
    queued: Clock,
    online: CheckCircle2,
    offline: XCircle,
    busy: Clock,
    stopped: XCircle,
    pending: Clock,
    skipped: Clock,
  };

  // @ts-ignore
  const Icon = Icons[status] || Info;

  return (
    <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest", 
      // @ts-ignore
      styles[status])}>
      <Icon className="w-3 h-3" />
      {status}
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1C1C1C]/40 dark:bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 12 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[85vh] max-h-[640px] bg-white dark:bg-[#141418] rounded-2xl z-[51] overflow-hidden flex flex-col border border-black/[0.06] dark:border-white/10 shadow-[0_16px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.3)] transition-all duration-300"
          >
            <div className="flex items-center justify-between p-5 border-b border-black/[0.04] dark:border-white/[0.06] shrink-0 bg-black/[0.01] dark:bg-white/[0.01]">
              <h3 className="text-sm md:text-base font-extrabold text-[#1C1C1C] dark:text-white tracking-tight uppercase">{title}</h3>
              <button onClick={onClose} className="p-1.5 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] rounded-lg transition-all text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white dark:bg-[#141418] text-[#1C1C1C] dark:text-white/90">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [projects, setProjects] = useState<QaseProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<QaseProject | null>(null);
  const [suites, setSuites] = useState<QaseSuite[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "projects" | "suites" | "details" | "devices" | "users" | "statuses" | "inbox" | "broadcast" | "qase_integration" | "system_config">("dashboard");
  const [detailsSource, setDetailsSource] = useState<string>("dashboard");
  const [runDetails, setRunDetails] = useState<RunDetails | null>(null);
  const [runConfigModal, setRunConfigModal] = useState<{ isOpen: boolean; title: string; targetId: string } | null>(null);
  const [e2eLaunchModal, setE2eLaunchModal] = useState<{ isOpen: boolean; projectTitle: string; projectCode: string; prodFeaturePath?: string } | null>(null);
  /**
   * App-level active E2E run — persists across modal close/reopen so logs
   * keep streaming in the background and the panel always reattaches to
   * the same run when the user reopens Launch.
   */
  const [activeE2ERun, setActiveE2ERun] = useState<{ runId: string; projectCode: string; platform: "Android" | "iOS" } | null>(null);
  const [projectRunsModal, setProjectRunsModal] = useState<{ projectKey: string; projectTitle: string } | null>(null);
  /** Per-scenario detail page navigation (replaces "modal" detail). */
  const [scenarioDetail, setScenarioDetail] = useState<{ runId: string; tag: string; name: string } | null>(null);
  const [selectedDetailsId, setSelectedDetailsId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchSuites(selectedProject.code);
    }
  }, [selectedProject]);

  /* Auto-clear the floating "active run" chip when the run finishes —
     polls /api/e2e/runs/{id} every 3 seconds while activeE2ERun is set. */
  useEffect(() => {
    if (!activeE2ERun) return;
    const t = setInterval(async () => {
      try {
        const r = await fetch(`/api/e2e/runs/${activeE2ERun.runId}`).then(x => x.ok ? x.json() : null);
        // status 1 = Running; everything else is terminal.
        const stillRunning = r && (r.status === 1 || r.status === "Running");
        if (!stillRunning) setActiveE2ERun(null);
      } catch { /* keep polling */ }
    }, 3000);
    return () => clearInterval(t);
  }, [activeE2ERun?.runId]);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/qase/projects");
      const data = await res.json();
      setProjects(data.result.entities || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSuites = async (code: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/qase/suites/${code}`);
      const data = await res.json();
      // Backend camelCase `parentId` qaytarır, QaseSuite tipi `parent_id`
      // gözləyir — iyerarxiyanın düzgün qurulması üçün normallaşdırırıq.
      setSuites((data.result?.entities || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        parent_id: s.parent_id ?? s.parentId ?? null,
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openDetails = async (id: string, source: string = "dashboard") => {
    setActiveTab("details");
    setDetailsSource(source);
    setSelectedDetailsId(id);
    setRunDetails(null);
    try {
      const res = await fetch(`/api/details/${id}`);
      const data = await res.json();
      setRunDetails(data);
    } catch (err) {
      console.error(err);
    }
  };

  const suiteTree = useMemo(() => {
    const map = new Map<number, QaseSuite[]>();
    suites.forEach(suite => {
      const parentId = suite.parent_id ?? 0;
      if (!map.has(parentId)) map.set(parentId, []);
      map.get(parentId)!.push(suite);
    });
    return map;
  }, [suites]);

  return (
    <div className={cn(
      "flex h-screen font-sans overflow-hidden transition-colors duration-300",
      theme === "dark" 
        ? "bg-[#101014] text-white/90 dark" 
        : "bg-[#F7F9FB] text-[#1C1C1C] light"
    )}>
      {/* Sidebar */}
      <aside className={cn(
        "w-72 border-r flex flex-col p-6 gap-8 shrink-0 transition-colors duration-300",
        theme === "dark" 
          ? "bg-[#141418] border-white/10 text-white" 
          : "bg-white border-black/[0.06] text-[#1C1C1C] shadow-[sm]"
      )}>
        <div className="flex items-center gap-4 px-2">
          <div className="w-10 h-10 bg-pink-soft rounded-xl flex items-center justify-center border border-pink-light">
            <Zap className="w-5 h-5 text-pink-deep fill-current animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className={cn("font-extrabold tracking-tight text-xl leading-none flex items-center gap-1.5", theme === "dark" ? "text-white" : "text-[#1C1C1C]")}>
              Nexus <span className="text-[9px] bg-pink-soft text-pink-deep border border-pink-light/50 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">Soft</span>
            </span>
            <span className={cn("text-[9px] font-black uppercase tracking-[0.25em] mt-0.5", theme === "dark" ? "text-white/40" : "text-black/40")}>Automation</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-1 overflow-y-auto custom-scrollbar max-h-[50vh]">
          <NavItem theme={theme} icon={LayoutDashboard} label="Pulse Dashboard" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
          <NavItem theme={theme} icon={Layers} label="Test Projects" active={activeTab === "projects"} onClick={() => setActiveTab("projects")} />
          <NavItem theme={theme} icon={CheckCircle2} label="Test Statuses" active={activeTab === "statuses"} onClick={() => setActiveTab("statuses")} />
          <NavItem theme={theme} icon={ExternalLink} label="Qase.io Workspace" active={activeTab === "qase_integration"} onClick={() => setActiveTab("qase_integration")} />
          
          <div className="mt-6 mb-2 px-3 flex items-center justify-between">
            <span className={cn("text-[10px] font-bold uppercase tracking-[0.2em]", theme === "dark" ? "text-white/30" : "text-black/40")}>Infrastructure</span>
            <div className={cn("w-1.5 h-1.5 rounded-full", theme === "dark" ? "bg-white/10" : "bg-black/15")} />
          </div>
          
          <NavItem theme={theme} icon={Smartphone} label="Device Cluster" active={activeTab === "devices"} onClick={() => setActiveTab("devices")} />
          <NavItem theme={theme} icon={Users} label="User Roles" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
          <NavItem theme={theme} icon={Bell} label="Notifications" active={activeTab === "broadcast"} onClick={() => setActiveTab("broadcast")} />
          <NavItem theme={theme} icon={Inbox} label="My Inbox" active={activeTab === "inbox"} onClick={() => setActiveTab("inbox")} />
        </nav>

        <div className="mt-auto px-1">
          <button 
            type="button"
            onClick={() => setActiveTab("system_config")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer group text-left",
              theme === "dark"
                ? "hover:bg-white/[0.02]"
                : "hover:bg-black/[0.02]",
              activeTab === "system_config" 
                ? (theme === "dark" ? "text-[#E05370]" : "text-pink-deep") 
                : (theme === "dark" ? "text-white/60" : "text-black/75")
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
              activeTab === "system_config" 
                ? (theme === "dark" ? "bg-[#E05370]/20 text-[#E05370]" : "bg-pink-soft text-pink-deep") 
                : (theme === "dark" ? "bg-white/5 text-white/50" : "bg-black/[0.03] text-black/45")
            )}>
              <Settings className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest leading-none">System Config</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {activeTab === "dashboard" && <DashboardOverview fetchProjects={fetchProjects} />}
            {activeTab === "projects" && <ProjectsPage
              projects={projects}
              onProjectClick={(p) => { setSelectedProject(p); setActiveTab("suites"); }}
              onRun={(p) => setE2eLaunchModal({ isOpen: true, projectTitle: p.title, projectCode: p.code })}
              onMenu={(p) => setProjectRunsModal({ projectKey: p.code, projectTitle: p.title })}
              onBack={() => setActiveTab("dashboard")}
            />}
            {activeTab === "suites" && (
              <ProjectView
                project={selectedProject!}
                loading={loading}
                suiteTree={suiteTree}
                openDetails={(id) => openDetails(id, "suites")}
                onRunSuite={(s) => setRunConfigModal({ isOpen: true, title: s.title, targetId: s.id.toString() })}
                onBack={() => { setSelectedProject(null); setActiveTab("projects"); }}
                onScenarioOpen={(runId, tag, name) => {
                  setScenarioDetail({ runId, tag, name });
                  setActiveTab("scenarioDetail" as any);
                }}
                onLaunchE2E={(featurePath) => setE2eLaunchModal({
                  isOpen: true,
                  projectTitle: selectedProject!.title,
                  projectCode: selectedProject!.code,
                  prodFeaturePath: featurePath,
                })}
              />
            )}
            {activeTab === ("scenarioDetail" as any) && scenarioDetail && (
              <ScenarioDetailPage
                runId={scenarioDetail.runId}
                tag={scenarioDetail.tag}
                name={scenarioDetail.name}
                onBack={() => { setScenarioDetail(null); setActiveTab("suites"); }}
              />
            )}
            {activeTab === "details" && <DetailsPage 
              run={runDetails} 
              onBack={() => setActiveTab(detailsSource || "dashboard")} 
            />}
            {activeTab === "devices" && <DevicesPage onBack={() => setActiveTab("dashboard")} />}
            {activeTab === "users" && <UsersPage onBack={() => setActiveTab("dashboard")} />}
            {activeTab === "statuses" && <TestStatusesPage openDetails={(id) => openDetails(id, "statuses")} onBack={() => setActiveTab("dashboard")} />}
            {activeTab === "inbox" && <NotificationsPage defaultView="inbox" onBack={() => setActiveTab("dashboard")} theme={theme} />}
            {activeTab === "broadcast" && <NotificationsPage defaultView="broadcast" onBack={() => setActiveTab("dashboard")} theme={theme} />}
            {activeTab === "qase_integration" && <QaseIntegrationPage onBack={() => setActiveTab("dashboard")} />}
            {activeTab === "system_config" && <SystemConfigPage theme={theme} setTheme={setTheme} onBack={() => setActiveTab("dashboard")} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Run Config Modal (legacy — Suites səhifəsindən "Launch") */}
      <RunConfigModal
        isOpen={!!runConfigModal}
        title={runConfigModal?.title || ""}
        onClose={() => setRunConfigModal(null)}
        onStart={(config) => {
          console.log("Starting run with config:", config);
          setRunConfigModal(null);
        }}
      />

      {/* E2E Launch Modal — Telegram bot pattern (multi-device Android + iOS) */}
      {e2eLaunchModal?.isOpen && (
        <E2ELaunchModal
          projectTitle={e2eLaunchModal.projectTitle}
          projectCode={e2eLaunchModal.projectCode}
          prodFeaturePath={e2eLaunchModal.prodFeaturePath}
          onClose={() => setE2eLaunchModal(null)}
          activeRun={activeE2ERun?.projectCode === e2eLaunchModal.projectCode ? activeE2ERun : null}
          setActiveRun={setActiveE2ERun}
        />
      )}

      {/* Floating "active run" chip — appears bottom-right when a run is
          in progress AND the launch modal is closed, lets user re-open. */}
      {activeE2ERun && !e2eLaunchModal && (
        <button
          onClick={() => setE2eLaunchModal({ isOpen: true, projectTitle: projects.find(p => p.code === activeE2ERun.projectCode)?.title || activeE2ERun.projectCode, projectCode: activeE2ERun.projectCode })}
          className="fixed bottom-6 right-6 z-50 bg-pink-deep text-white shadow-2xl rounded-full px-5 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#D04260] transition-all flex items-center gap-2 animate-pulse"
        >
          <span className="w-2 h-2 bg-white rounded-full" />
          🔴 Run davam edir — {activeE2ERun.platform}
        </button>
      )}

      {/* Project-card 3-dot menu — recent E2E runs for that project */}
      {projectRunsModal && (
        <ProjectRunsModal
          projectKey={projectRunsModal.projectKey}
          projectTitle={projectRunsModal.projectTitle}
          onClose={() => setProjectRunsModal(null)}
        />
      )}
    </div>
  );
}

function NavItem({ icon: Icon, label, active = false, onClick, theme }: { icon: any, label: string, active?: boolean; onClick?: () => void, theme: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 group relative overflow-hidden cursor-pointer",
        active 
          ? (theme === "dark" ? "text-pink-light font-extrabold" : "text-pink-deep font-extrabold")
          : (theme === "dark" 
              ? "text-white/70 hover:text-pink-[#E05370]/80 hover:bg-white/[0.03]" 
              : "text-[#1C1C1C] hover:text-pink-deep hover:bg-pink-soft/80")
      )}
    >
      {active && (
        <motion.div 
          layoutId="sidebar-active"
          className={cn(
            "absolute inset-0",
            theme === "dark" ? "bg-white/[0.04] border-r border-[#E05370]" : "bg-pink-soft/80 border-r border-pink-light/30"
          )}
        />
      )}
      <div className="relative z-10 flex items-center gap-3">
        <Icon className={cn(
          "w-4.5 h-4.5 transition-all duration-300", 
          active 
            ? (theme === "dark" ? "text-[#E05370]" : "text-pink-deep") 
            : (theme === "dark" 
                ? "text-white/50 group-hover:text-pink-light group-hover:scale-105" 
                : "text-[#1C1C1C]/60 group-hover:text-pink-deep group-hover:scale-105")
        )} />
        {label}
      </div>
      {active && (
        <motion.div 
          layoutId="active-indicator"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute right-4 w-1 h-3 bg-pink-accent rounded-full z-10" 
        />
      )}
    </button>
  );
}

interface ProjectNavItemProps {
  key?: any;
  name: string;
  active?: boolean;
  onClick: () => void;
  onRun: () => void;
  onMenu: () => void;
}

function ProjectNavItem({ name, active, onClick, onRun, onMenu }: ProjectNavItemProps) {
  return (
    <div className={cn(
      "group relative flex items-center w-full px-3 py-2.5 rounded-xl text-sm transition-all",
      active ? "bg-brand-50 text-brand-600 font-bold border border-brand-100" : "text-slate-500 hover:bg-brand-50"
    )}>
      <button onClick={onClick} className="flex-1 flex items-center gap-3 overflow-hidden">
        <div className={cn("w-1.5 h-6 rounded-full shrink-0", active ? "bg-brand-500" : "bg-transparent")} />
        <span className="truncate">{name}</span>
      </button>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onRun} className="p-1.5 hover:bg-brand-100 rounded-lg text-brand-500 transition-colors">
          <PlayCircle className="w-4 h-4" />
        </button>
        <button onClick={onMenu} className="p-1.5 hover:bg-brand-100 rounded-lg text-slate-400 transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function DashboardOverview({ fetchProjects }: { fetchProjects: () => void }) {
  const cardStyles = [
    { bg: "bg-[#E5ECF6] border-black/[0.01]", iconColor: "text-black/60", badgeBg: "bg-white/50 text-black/70 border-black/[0.04]" },
    { bg: "bg-[#E3F5FF] border-black/[0.01]", iconColor: "text-black/60", badgeBg: "bg-white/50 text-black/70 border-black/[0.04]" },
    { bg: "bg-[#F1F3F5] border-black/[0.01]", iconColor: "text-black/60", badgeBg: "bg-white/50 text-black/70 border-black/[0.04]" },
    { bg: "bg-[#E3F5FF] border-black/[0.01]", iconColor: "text-black/60", badgeBg: "bg-white/50 text-black/70 border-black/[0.04]" },
  ];

  return (
    <div className="p-6 md:p-10 flex flex-col gap-6 md:gap-8 overflow-y-auto custom-scrollbar bg-[#F7F9FB]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-extrabold text-[#1C1C1C] tracking-tight uppercase">System Pulse</h2>
          <p className="text-black/40 font-bold uppercase tracking-wider text-[9px]">Real-time pipeline monitoring across main clusters.</p>
        </div>
        <button 
          onClick={fetchProjects}
          className="p-2.5 bg-white border border-black/[0.06] text-black/60 rounded-xl hover:bg-black/[0.02] hover:text-black transition-all active:scale-95 shadow-sm w-fit flex items-center justify-center cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {[
          { label: "Total Runs", value: "150", change: "+12%", trend: "up", icon: Activity, desc: "Total test executions to date" },
          { label: "Uptime", value: "97%", change: "0%", trend: "neutral", icon: CheckCircle2, desc: "Share of healthy system checks" },
          { label: "Avg Run Time", value: "50:00", change: "-10s", trend: "up", icon: Clock, desc: "Average duration per run (mm:ss)" },
          { label: "Resources", value: "50%", change: "+2%", trend: "neutral", icon: Cpu, desc: "Devices currently busy running tests" },
        ].map((m, i) => {
          const style = cardStyles[i] || cardStyles[0];
          return (
            <motion.div 
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn("p-6 rounded-2xl border relative group overflow-hidden flex flex-col justify-between h-36 shadow-[0_2px_12px_rgba(0,0,0,0.01)]", style.bg)}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider">{m.label}</span>
                <m.icon className={cn("w-4.5 h-4.5 transition-colors", style.iconColor)} />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[#1C1C1C] tracking-tight">{m.value}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="glass-card p-6 md:p-8 relative overflow-hidden bg-white border border-black/[0.04] shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
          <div className="space-y-1">
            <h3 className="text-base md:text-lg font-extrabold text-[#1C1C1C] tracking-tight uppercase">Pipeline Throughput</h3>
            <p className="text-[9px] font-bold text-black/30 uppercase tracking-[0.15em]">Temporal execution distribution</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#FF758F] rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-[#E05370] uppercase tracking-widest">Active Runs (Main Cluster)</span>
            </div>
          </div>
        </div>
        <div className="h-44 md:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { t: "8 AM", v: 40 }, { t: "10 AM", v: 80 }, { t: "12 PM", v: 65 }, { t: "2 PM", v: 120 }, { t: "4 PM", v: 90 }, { t: "6 PM", v: 110 }
            ]}>
              <defs>
                <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF758F" stopOpacity={0.16}/>
                  <stop offset="95%" stopColor="#FF758F" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="t" axisLine={false} tickLine={false} fontSize={9} tick={{ fill: '#E05370', fontWeight: 600 }} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '12px', 
                  border: '1px solid #FFE2E6', 
                  padding: '10px 14px',
                  boxShadow: '0 4px 16px rgba(255,117,143,0.06)'
                }}
                itemStyle={{ color: '#E05370', fontWeight: 700, fontSize: '11px' }}
                labelStyle={{ color: '#8A94A6', fontWeight: 500, fontSize: '9px', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="v" 
                stroke="#FF758F" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorV)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6 md:p-8 bg-white border border-black/[0.04] shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <h3 className="text-base md:text-lg font-extrabold text-[#1C1C1C] tracking-tight uppercase mb-1">Metrics Explained</h3>
        <p className="text-[9px] font-bold text-black/30 uppercase tracking-[0.15em] mb-5">What each number means</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
          <li className="text-[12px] text-black/50 leading-snug"><span className="font-bold text-[#1C1C1C]">Total Runs</span> — Total number of test executions recorded to date.</li>
          <li className="text-[12px] text-black/50 leading-snug"><span className="font-bold text-[#1C1C1C]">Uptime</span> — Percentage of system health checks that passed (healthy heartbeats).</li>
          <li className="text-[12px] text-black/50 leading-snug"><span className="font-bold text-[#1C1C1C]">Avg Run Time</span> — Average duration of a single run, shown as mm:ss.</li>
          <li className="text-[12px] text-black/50 leading-snug"><span className="font-bold text-[#1C1C1C]">Resources</span> — Percentage of devices currently busy running tests.</li>
        </ul>
      </div>
    </div>
  );
}

function ProjectsPage({ projects, onProjectClick, onRun, onMenu, onBack }: { 
  projects: QaseProject[], 
  onProjectClick: (p: QaseProject) => void, 
  onRun: (p: QaseProject) => void, 
  onMenu: (p: QaseProject) => void,
  onBack?: () => void
}) {
  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 md:gap-8 overflow-y-auto custom-scrollbar bg-[#F7F9FB]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2.5 bg-white border border-black/[0.06] hover:bg-black/[0.02] text-[#E05370] rounded-xl transition-all cursor-pointer shadow-sm hover:border-pink-light"
              title="Geri qayıt"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-extrabold text-[#1C1C1C] tracking-tight uppercase">Active Projects</h2>
            <p className="text-black/40 font-bold uppercase tracking-wider text-[9px]">Managed Automation Repositories</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-pink-deep hover:bg-[#D04260] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-[0_4px_14px_rgba(224,83,112,0.25)] cursor-pointer w-fit">
          <Plus className="w-4 h-4" />
          Initialize Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p, i) => (
          <motion.div 
            key={p.code}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="group bg-white p-6 rounded-2xl border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:border-black/10 transition-all flex flex-col gap-6 relative overflow-hidden"
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="w-12 h-12 bg-black/[0.03] rounded-xl flex items-center justify-center group-hover:bg-black/[0.05] transition-colors">
                <Box className="w-6 h-6 text-black/50 group-hover:text-black transition-colors" />
              </div>
              <button 
                onClick={() => onMenu(p)}
                className="p-2 text-black/40 hover:text-black hover:bg-black/[0.03] rounded-xl transition-all"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            <div onClick={() => onProjectClick(p)} className="cursor-pointer relative z-10">
              <h3 className="text-lg font-extrabold text-black tracking-tight group-hover:text-black transition-colors uppercase">{p.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="px-2 py-0.5 bg-black/[0.06] rounded border border-black/10 text-[9px] text-black/80 font-bold tracking-wider">CODE: {p.code}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-1 relative z-10">
              <button 
                onClick={() => onRun(p)}
                className="flex-1 flex items-center justify-center gap-2 bg-pink-deep hover:bg-[#D04260] text-white px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-[0_3px_10px_rgba(224,83,112,0.15)] cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Launch Suite
              </button>
              <button 
                onClick={() => onProjectClick(p)}
                className="p-2.5 bg-black/[0.03] text-black/50 rounded-xl hover:text-black hover:bg-black/[0.06] transition-all border border-black/[0.02]"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function RunConfigModal({ isOpen, title, onClose, onStart }: { isOpen: boolean; title: string; onClose: () => void; onStart: (config: any) => void }) {
  const [platform, setPlatform] = useState<"iOS" | "Android">("iOS");
  const [devices, setDevices] = useState<{ id: string, name: string, platform: string }[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      fetch("/api/devices").then(r => r.json()).then(setDevices);
    }
  }, [isOpen]);

  const filteredDevices = devices.filter(d => d.platform === platform);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Run Configuration: ${title}`}>
      <div className="space-y-6 max-w-lg mx-auto">
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-black/45 uppercase tracking-wider">Platform Selection</label>
          <div className="flex gap-3">
            {["iOS", "Android"].map((p) => (
              <button
                key={p}
                onClick={() => { setPlatform(p as any); setSelectedDevice(""); }}
                className={cn(
                  "flex-1 flex flex-col items-center gap-3 p-6 rounded-xl border transition-all relative overflow-hidden group",
                  platform === p ? "border-pink-light bg-pink-soft text-pink-deep shadow-sm" : "border-black/[0.03] bg-black/[0.01] text-black/45 hover:border-pink-light"
                )}
              >
                {p === "iOS" ? <Cpu className="w-6 h-6 text-pink-deep" /> : <Monitor className="w-6 h-6 text-pink-deep" />}
                <span className="font-bold text-[10px] uppercase tracking-wider">{p}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold text-black/45 uppercase tracking-wider">Device Target pool</label>
          <div className="flex flex-col gap-2">
            {filteredDevices.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDevice(d.id)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all",
                  selectedDevice === d.id ? "border-pink-light bg-pink-soft text-pink-deep" : "border-[#1C1C1C]/10 bg-black/[0.01] text-black/65 hover:border-pink-light"
                )}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className={cn("w-4 h-4", selectedDevice === d.id ? "text-pink-deep" : "text-black/50")} />
                  <span className="text-xs font-bold tracking-tight uppercase">{d.name}</span>
                </div>
                {selectedDevice === d.id && <div className="w-1.5 h-1.5 bg-pink-deep rounded-full" />}
              </button>
            ))}
            {filteredDevices.length === 0 && (
              <div className="p-6 text-center bg-black/[0.01] rounded-xl border border-dashed border-black/10">
                <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider">No active nodes in this sector</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-black/[0.03] text-black/60 font-bold uppercase tracking-wider rounded-xl text-[10px] hover:bg-black/[0.06] hover:text-black transition-all cursor-pointer"
          >
            Abort
          </button>
          <button 
            disabled={!selectedDevice}
            onClick={() => onStart({ platform, selectedDevice })}
            className="flex-[1.5] py-3 bg-pink-deep hover:bg-[#D04260] text-white font-bold uppercase tracking-wider rounded-xl text-[10px] transition-all active:scale-95 disabled:opacity-30 cursor-pointer shadow-[0_4px_12px_rgba(224,83,112,0.2)]"
          >
            Launch Session
          </button>
        </div>
      </div>
    </Modal>
  );
}

function DetailsPage({ run, onBack }: { run: RunDetails | null; onBack: () => void }) {
  if (!run) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-20 bg-[#F7F9FB]">
        <RefreshCw className="w-10 h-10 text-black/60 animate-spin" />
        <h3 className="text-xl font-bold text-[#1C1C1C] tracking-tight uppercase">Syncing execution state...</h3>
        <button onClick={onBack} className="text-black/55 hover:text-black font-semibold text-[11px] uppercase tracking-wider bg-black/[0.03] hover:bg-black/[0.06] px-5 py-2.5 rounded-xl transition-all cursor-pointer">Abort Synchronization</button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar flex flex-col gap-6 bg-[#F7F9FB]">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-black/[0.04] shadow-sm relative overflow-hidden gap-4">
        <div className="flex items-center gap-4 relative z-10">
          <button onClick={onBack} className="p-2 bg-black/[0.03] text-black hover:bg-black/[0.06] rounded-xl border border-black/[0.02] hover:bg-black/[0.05] transition-all cursor-pointer">
            <ChevronRight className="w-4.5 h-4.5 rotate-180 text-black" />
          </button>
          <div className="space-y-0.5">
            <h2 className="text-lg md:text-xl font-extrabold text-[#1C1C1C] tracking-tight uppercase leading-none">{run.suiteName}</h2>
            <div className="flex items-center gap-3 text-[9px] font-bold text-black/40 uppercase tracking-wider">
               <span className="text-black/60">{run.projectName}</span>
               <span>•</span>
               <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(run.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <StatusBadge status={run.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column: Visuals & Logs */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="bg-white p-5 rounded-2xl border border-black/[0.04] shadow-sm space-y-4">
             <div className="flex items-center justify-between px-1">
                <h4 className="text-[10px] font-bold text-black/40 uppercase tracking-wider flex items-center gap-2">
                   <Video className="w-3.5 h-3.5 text-black/60" /> Visual evidence recording
                </h4>
             </div>
             <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-sm border border-black/10 relative">
                <video controls className="w-full h-full object-cover">
                  <source src={run.video} type="video/mp4" />
                </video>
             </div>
          </div>

          <div className="bg-[#1C1C1C] p-5 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 px-1">
               <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-white/60" /> Core Execution Logs
               </h4>
               <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50" />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
               </div>
            </div>
            <div className="font-mono text-[10px] space-y-2.5 overflow-y-auto max-h-[350px] custom-scrollbar pr-2 text-white/70 leading-relaxed text-left">
               {run.logs.map((log, i) => (
                 <div key={i} className={cn("border-l border-white/5 pl-4 py-0.5 transition-all", log.includes("[ERROR]") ? "border-rose-500 bg-rose-500/10 text-rose-300" : "hover:border-white hover:bg-white/5")}>
                    <span className="text-white/20 mr-3 font-bold">[{i.toString().padStart(3, '0')}]</span>
                    {log}
                 </div>
               ))}
            </div>
          </div>

          {run.status === 'failed' && (
            <div className="bg-white p-5 rounded-2xl border border-black/[0.04] shadow-sm space-y-4">
              <h4 className="text-[10px] font-bold text-black/40 uppercase tracking-wider flex items-center gap-2">
                 <ImageIcon className="w-3.5 h-3.5 text-rose-500" /> Integrity Failure Snapshots
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {run.screenshots.map((s, i) => (
                   <div key={i} className="rounded-xl overflow-hidden border border-black/[0.06] shadow-sm hover:scale-[1.01] transition-all cursor-zoom-in group">
                      <img src={s} alt="Capture" className="w-full h-auto opacity-90 group-hover:opacity-100 transition-opacity" />
                   </div>
                 ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Steps, Environment, History */}
        <div className="space-y-6 md:space-y-8">
           {/* Summary Info */}
           <div className="bg-white p-5 rounded-2xl border border-black/[0.04] shadow-sm space-y-5">
             <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-black/[0.03] rounded-xl flex items-center justify-center border border-black/[0.02]">
                   <Activity className="w-5 h-5 text-black/60" />
                </div>
                <h4 className="text-base font-extrabold text-[#1C1C1C] uppercase tracking-tight">Timeline Analytics</h4>
             </div>
             
             {run.error && (
               <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl space-y-2">
                 <span className="text-[9px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                   <AlertCircle className="w-3 h-3" /> Breach identified
                 </span>
                 <p className="text-[10px] font-mono text-rose-800 leading-relaxed break-all">{run.error}</p>
               </div>
             )}

             <div className="space-y-4">
                {run.allure.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 bg-black/[0.01] rounded-xl border border-black/5 hover:bg-black/[0.03] transition-colors">
                     <div className={cn("mt-1.5 w-1.5 h-1.5 rounded-full shrink-0", step.status === 'passed' ? "text-emerald-500 bg-emerald-500" : "text-rose-500 bg-rose-500")} />
                     <div className="flex-1">
                        <div className="text-xs font-semibold text-[#1C1C1C] tracking-tight">{step.name}</div>
                        <div className="text-[9px] font-bold text-[#8A94A6] uppercase tracking-wider mt-0.5">{step.duration}</div>
                     </div>
                  </div>
                ))}
             </div>
           </div>

           <div className="glass-card p-10 rounded-[40px] border border-white/5 space-y-8">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                <Monitor className="w-3.5 h-3.5 text-black/[0.6]" /> Environment context
             </h4>
             <div className="grid grid-cols-2 gap-4">
                {Object.entries(run.allure.environment).map(([k, v]) => (
                  <div key={k} className="p-5 bg-black/[0.01] rounded-xl border border-black/5">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{k}</div>
                    <div className="text-xs font-bold text-text-main tracking-tight truncate">{v}</div>
                  </div>
                ))}
             </div>
           </div>

           <div className="glass-card p-10 rounded-[40px] border border-white/5 space-y-8">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                <RefreshCw className="w-3.5 h-3.5 text-black/65" /> Historical trend
             </h4>
             <div className="flex flex-col gap-4">
                {run.history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-black/[0.03] pb-2 last:border-0 last:pb-0 px-1">
                    <span className="text-[9px] font-bold text-black/50 uppercase tracking-wider">{h.date}</span>
                    <StatusBadge status={h.status} />
                  </div>
                ))}
             </div>
           </div>
        </div>
      </div>
      
      {/* Footer Navigation */}
      <div className="sticky bottom-0 bg-[#F7F9FB] dark:bg-[#101014] pb-6 pt-4 flex gap-3 z-20">
         <button className="flex-grow py-3 bg-black hover:bg-black/95 text-white rounded-xl font-bold uppercase tracking-wider text-[11px] cursor-pointer transition-all active:scale-95">
           Initiate Retest Cycle
         </button>
         <button className="p-3 bg-white border border-black/15 text-black/60 hover:text-black hover:bg-black/[0.02] rounded-xl transition-all">
           <ExternalLink className="w-4 h-4 text-black" />
         </button>
      </div>
    </div>
  );
}

function ProjectView({ project, loading, suiteTree, openDetails, onRunSuite, onBack, onScenarioOpen, onLaunchE2E }: {
  project: QaseProject;
  loading: boolean;
  suiteTree: Map<number, QaseSuite[]>;
  openDetails: (id: string, source?: string) => void;
  onRunSuite: (s: QaseSuite) => void;
  onBack?: () => void;
  /** Called when a scenario row is clicked — opens scenario detail page. */
  onScenarioOpen?: (runId: string, tag: string, name: string) => void;
  /** Avtomat modulu işə salır — launch modalını verilmiş feature path ilə açır. */
  onLaunchE2E?: (featurePath: string) => void;
}) {
  // ── Mobile-type projects render an "Automation Modules" drill-down
  // (suite → sub-suite → test case). Each case's automation status comes from
  // the test-management 'automation' field (0 = none, 1 = to-be, 2 = automated).
  const isMobileAppsProject = (project.title || "").toLowerCase().includes("mobile");
  const [modulePopup, setModulePopup] = useState<{ title: string; note: string } | null>(null);
  const [caseMap, setCaseMap] = useState<Map<number, { id: number; title: string; automation: number; tags: string[] }[]>>(new Map());
  // Drill-down navigation stack: [] = root (top-level suites). Each suite click
  // pushes onto the stack (suite → sub-suite → test case flow).
  const [navPath, setNavPath] = useState<QaseSuite[]>([]);

  // Optional mapping from a case to a runnable feature. Demo build: none.
  const featureForCase = (_title: string): string | undefined => undefined;

  const automationLabel = (a: number) =>
    a === 2 ? "Automated" : a === 1 ? "To be automated" : "Not automated";

  // Mobil proyekt üçün Qase case-lərini suite_id-ə görə qruplaşdırıb saxlayırıq
  // ki, SuiteItem hər suite-in altında öz modullarını (cases) göstərə bilsin.
  // Proyekt dəyişəndə drill-down stack-i sıfırla.
  useEffect(() => { setNavPath([]); }, [project.code]);

  useEffect(() => {
    if (!isMobileAppsProject) return;
    fetch(`/api/qase/cases/${encodeURIComponent(project.code)}`)
      .then(r => r.ok ? r.json() : null)
      .then((data: any) => {
        const items: any[] = data?.result?.entities ?? (Array.isArray(data) ? data : []);
        const m = new Map<number, { id: number; title: string; automation: number; tags: string[] }[]>();
        for (const c of items) {
          const sid = c.suiteId ?? c.suite_id ?? 0;
          const arr = m.get(sid) ?? [];
          // Qase tag-ları "android, ios" kimi vergüllə gələ bilər — ayrı çiplərə bölürük.
          const rawTags: string[] = Array.isArray(c.tags) ? c.tags : [];
          const tags = rawTags.flatMap((t: string) => String(t).split(",").map(s => s.trim())).filter(Boolean);
          arr.push({ id: c.id, title: c.title, automation: typeof c.automation === "number" ? c.automation : 0, tags });
          m.set(sid, arr);
        }
        setCaseMap(m);
      })
      .catch(() => setCaseMap(new Map()));
  }, [project.code, isMobileAppsProject]);

  const [viewMode, setViewMode] = useState<"modules" | "executed">("executed");
  const [runs, setRuns] = useState<any[]>([]);
  const [fetchingRuns, setFetchingRuns] = useState<boolean>(false);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  // Stop POST göndərilibsə (lakin backend hələ "running"-də qalır) — bu run id-lər
  // üçün Stop düyməsini lokal olaraq dərhal gizlədirik. Polling status-u
  // "stopped"-a çevirəndə Set-dən çıxarılır.
  const [stoppingIds, setStoppingIds] = useState<Set<string>>(new Set());

  // Auto-refresh executed-tests list every 4s when this tab is open so
  // in-flight runs update their status without manual reload.
  useEffect(() => {
    fetchRuns();
    if (viewMode !== "executed") return;
    const t = setInterval(fetchRuns, 4000);
    return () => clearInterval(t);
  }, [project, viewMode]);

  const fetchRuns = async () => {
    setFetchingRuns(true);
    try {
      // Per-run aggregate: hər E2E run = 1 sətir. Scenario fan-out-u burada
      // YOXDUR — istifadəçi sətrə basanda ScenarioDetailPage bütün scenarios-u
      // sidebar-da göstərir. Beləliklə "Stop" ediləndə run sətri yox olmur,
      // sadəcə statusu `stopped`-a keçir və icinə girəndə nə qədər scenario
      // parse olunubsa hamısı + log orada görünür.
      const e2e = await fetch(`/api/e2e/runs?projectKey=${encodeURIComponent(project.code)}&take=200`)
        .then(r => r.ok ? r.json() : null).catch(() => null);
      if (Array.isArray(e2e)) {
        const flat: any[] = [];
        await Promise.all(e2e.map(async (run: any) => {
          const sc = await fetch(`/api/e2e/runs/${run.id}/scenarios`)
            .then(r => r.ok ? r.json() : null).catch(() => null);
          const platform = (run.platform === 0 || run.platform === "Android") ? "Android" : "iOS";
          const runStatusName = ["pending", "running", "passed", "failed", "stopped"][run.status] || String(run.status).toLowerCase();
          const items: any[] = sc?.items ?? [];
          const passed  = items.filter(s => s.status === "passed").length;
          const failed  = items.filter(s => s.status === "failed").length;
          const skipped = items.filter(s => s.status === "skipped").length;
          const running = items.filter(s => s.status === "running").length;
          // Case name: device UDIDs + qısa scenario özət
          let caseName = run.deviceUdids || "—";
          if (items.length > 0) {
            const parts: string[] = [`${items.length} scenarios`];
            if (passed > 0)  parts.push(`${passed} ✅`);
            if (failed > 0)  parts.push(`${failed} ❌`);
            if (skipped > 0) parts.push(`${skipped} ⏭`);
            if (running > 0) parts.push(`${running} 🔴`);
            caseName = `${run.deviceUdids || ""} — ${parts.join(" · ")}`;
          }
          flat.push({
            id: run.id,
            runId: run.id,
            suiteName: `${platform} E2E`,
            caseName,
            status: runStatusName,
            duration: run.endedAt ? fmtDur((+new Date(run.endedAt) - +new Date(run.startedAt)) / 1000) : "—",
            timestamp: run.startedAt,
            projectName: project.title,
            projectCode: project.code,
            isE2E: true,
            platform,
            scenarioCount: items.length,
            scenarioStats: { passed, failed, skipped, running },
          });
        }));
        // Ən yeni run ən üstdə
        flat.sort((a, b) => (+new Date(b.timestamp) - +new Date(a.timestamp)));
        setRuns(flat);
        // Backend nəhayət stopped/finished statusuna keçən run-ları
        // stoppingIds-dən təmizlə (artıq həqiqi badge görsənir).
        setStoppingIds(prev => {
          const next = new Set(prev);
          let changed = false;
          for (const r of flat) {
            if (next.has(r.runId) && r.status !== "running") {
              next.delete(r.runId);
              changed = true;
            }
          }
          return changed ? next : prev;
        });
        return;
      }
      // Legacy mock fallback
      const res = await fetch("/api/test-runs");
      const list = await res.json();
      const filtered = list.filter((r: any) =>
        r.projectCode?.toUpperCase() === project.code.toUpperCase() ||
        r.projectName?.toLowerCase() === project.title.toLowerCase()
      );
      setRuns(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingRuns(false);
    }
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 md:gap-8 h-full overflow-y-auto custom-scrollbar bg-[#F7F9FB]">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl border border-black/[0.04] shadow-sm relative overflow-hidden gap-4">
        <div className="flex items-center gap-4 relative z-10">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2.5 bg-white border border-black/[0.06] hover:bg-black/[0.02] text-[#E05370] rounded-xl transition-all cursor-pointer shadow-sm hover:border-pink-light"
              title="Geri qayıt"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-14 h-14 bg-black/[0.03] rounded-xl flex items-center justify-center border border-black/[0.02]">
            <Layers className="w-7 h-7 text-black/60" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-extrabold text-[#1C1C1C] tracking-tight uppercase leading-none">{project.title}</h2>
            <div className="flex items-center gap-3 text-[9px] font-bold text-black/40 uppercase tracking-wider font-mono">
               <span className="text-[#E05370] bg-pink-soft px-2 py-0.5 rounded border border-pink-light/30">PROJECT CODE: {project.code}</span>
               <span>•</span>
               <span className="text-black/55">{suiteTree.get(0)?.length || 0} Primary Modules</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <button 
            onClick={() => onRunSuite({ id: 0, title: project.title, parent_id: null })}
            className="flex items-center gap-2 bg-pink-deep hover:bg-[#D04260] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-[0_4px_14px_rgba(224,83,112,0.25)] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Launch Environment
          </button>
        </div>
      </div>

      {/* Tabs Switcher for Repositories vs Run Executions only */}
      <div className="flex border-b border-black/[0.06] gap-6">
        <button 
          onClick={() => setViewMode("modules")}
          className={`pb-3 font-bold text-xs uppercase tracking-wider relative transition-colors cursor-pointer ${viewMode === "modules" ? "text-[#E05370]" : "text-black/40 hover:text-black/60"}`}
        >
          Automation Modules
          {viewMode === "modules" && (
            <motion.div layoutId="projTabId" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E05370]" />
          )}
        </button>
        <button 
          onClick={() => setViewMode("executed")}
          className={`pb-3 font-bold text-xs uppercase tracking-wider relative transition-colors cursor-pointer ${viewMode === "executed" ? "text-[#E05370]" : "text-black/40 hover:text-black/60"}`}
        >
          Executed Test Cases Only ({runs.length})
          {viewMode === "executed" && (
            <motion.div layoutId="projTabId" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E05370]" />
          )}
        </button>
      </div>

      {viewMode === "modules" ? (
        loading ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-6 opacity-60 py-24">
            <RefreshCw className="w-12 h-12 text-[#1C1C1C] animate-spin" />
            <p className="font-bold text-black/55 text-[10px] uppercase tracking-widest">Mapping Neural Hierarchy...</p>
          </div>
        ) : isMobileAppsProject ? (
          (() => {
            // Drill-down: cari səviyyə = navPath sonuncusu (yoxdursa kök=0).
            const currentSuite = navPath.length ? navPath[navPath.length - 1] : null;
            const currentParentId = currentSuite ? currentSuite.id : 0;
            const childSuites = suiteTree.get(currentParentId) || [];
            const currentCases = currentSuite ? (caseMap.get(currentSuite.id) || []) : [];
            return (
              <div className="flex flex-col gap-4 pb-24">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-bold">
                  <button
                    onClick={() => setNavPath([])}
                    className={cn("px-2 py-1 rounded-lg transition-colors cursor-pointer",
                      navPath.length === 0 ? "text-[#E05370] bg-pink-soft" : "text-black/45 hover:text-black/70 hover:bg-black/[0.03]")}
                  >
                    Automation Modules
                  </button>
                  {navPath.map((s, i) => (
                    <span key={s.id} className="flex items-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-black/25" />
                      <button
                        onClick={() => setNavPath(navPath.slice(0, i + 1))}
                        className={cn("px-2 py-1 rounded-lg transition-colors cursor-pointer max-w-[280px] truncate",
                          i === navPath.length - 1 ? "text-[#E05370] bg-pink-soft" : "text-black/45 hover:text-black/70 hover:bg-black/[0.03]")}
                        title={s.title}
                      >
                        {s.title}
                      </button>
                    </span>
                  ))}
                </div>

                {/* Back button (kök deyilsə) */}
                {navPath.length > 0 && (
                  <button
                    onClick={() => setNavPath(navPath.slice(0, -1))}
                    className="self-start flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black/[0.06] hover:bg-black/[0.02] text-[#E05370] rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                  >
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Geri
                  </button>
                )}

                <div className="space-y-2.5">
                  {/* Sub-suite-lər — klik edəndə içəri gir, ayrıca Launch düyməsi run edir */}
                  {childSuites.map(sub => {
                    const grandChildren = (suiteTree.get(sub.id) || []).length;
                    const subCases = (caseMap.get(sub.id) || []).length;
                    const subFeature = featureForCase(sub.title);
                    return (
                      <div
                        key={sub.id}
                        onClick={() => setNavPath([...navPath, sub])}
                        className="w-full text-left bg-white rounded-2xl border border-black/[0.04] shadow-sm flex items-center justify-between px-6 py-4 hover:border-pink-light transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-black/[0.03] text-pink-deep">
                            <Box className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold text-[#1C1C1C]">{sub.title}</span>
                            <span className="text-[9px] font-bold text-black/40 uppercase tracking-wider">
                              {grandChildren > 0 ? `${grandChildren} sub-suite` : `${subCases} test case`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); onLaunchE2E?.(subFeature ?? ""); }}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black text-white border border-black rounded-xl text-[9px] font-extrabold uppercase tracking-wider hover:bg-black/85 transition-all shadow-sm cursor-pointer"
                            title="Bu suite-i run et"
                          >
                            <Play className="w-3 h-3 fill-current" /> Launch
                          </button>
                          <ChevronRight className="w-5 h-5 text-black/25 group-hover:text-[#E05370] transition-colors" />
                        </div>
                      </div>
                    );
                  })}

                  {/* Test case-lər (modullar) — leaf səviyyə */}
                  {currentCases.map(c => {
                    const isAuto = c.automation === 2;
                    const feature = featureForCase(currentSuite?.title || "") ?? featureForCase(c.title);
                    return (
                      <div key={c.id} className="bg-white rounded-2xl border border-black/[0.04] shadow-sm flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isAuto ? "bg-emerald-500" : c.automation === 1 ? "bg-amber-500" : "bg-black/25")} />
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded bg-pink-soft text-pink-deep shrink-0 font-mono">
                                {project.code}-{c.id}
                              </span>
                              <span className="text-xs font-semibold text-black/85">{c.title}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={cn("text-[8px] font-black uppercase tracking-widest w-fit px-1.5 py-0.5 rounded",
                                isAuto ? "bg-emerald-500/10 text-emerald-600"
                                  : c.automation === 1 ? "bg-amber-500/10 text-amber-600"
                                  : "bg-black/[0.04] text-black/45")}>
                                {automationLabel(c.automation)}
                              </span>
                              {c.tags.map((tag, ti) => (
                                <span key={ti} className="text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 border border-indigo-500/15">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        {isAuto ? (
                          <button
                            onClick={() => onLaunchE2E?.(feature ?? "")}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-pink-deep hover:bg-[#D04260] text-white rounded-xl text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0"
                          >
                            <Play className="w-3 h-3 fill-current" /> Launch
                          </button>
                        ) : (
                          <button
                            onClick={() => setModulePopup({ title: c.title, note: `${automationLabel(c.automation)} — this module is not automated yet and is tested manually.` })}
                            className="px-3.5 py-1.5 bg-white border border-black/[0.08] hover:bg-black/[0.02] text-black/55 rounded-xl text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0"
                          >
                            Ətraflı
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {childSuites.length === 0 && currentCases.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-black/10">
                      <p className="text-black/35 font-bold text-sm uppercase tracking-wider italic">Bu suite-də test case yoxdur</p>
                    </div>
                  )}
                </div>

                {modulePopup && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                       onClick={() => setModulePopup(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 flex flex-col gap-4"
                         onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-sm font-bold text-[#1C1C1C]">{modulePopup.title}</span>
                        <button onClick={() => setModulePopup(null)}
                                className="text-black/30 hover:text-black/60 text-lg leading-none cursor-pointer">×</button>
                      </div>
                      <p className="text-xs text-black/65 leading-relaxed">{modulePopup.note}</p>
                      <button onClick={() => setModulePopup(null)}
                              className="self-end bg-black/[0.04] hover:bg-black/[0.08] text-black/60 px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer">
                        Bağla
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()
        ) : (
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] font-bold text-black/35 uppercase tracking-widest px-1">Automation Protocol Repository</h3>
            <div className="space-y-4 pb-24">
              {suiteTree.get(0)?.map(suite => (
                <SuiteItem
                  key={suite.id}
                  suite={suite}
                  suiteTree={suiteTree}
                  openDetails={openDetails}
                  onRunSuite={onRunSuite}
                  runs={runs}
                />
              ))}
              {(!suiteTree.get(0) || suiteTree.get(0)!.length === 0) && (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-black/10">
                  <p className="text-black/35 font-bold text-sm uppercase tracking-wider italic">Protocol pool empty / awaiting signal</p>
                </div>
              )}
            </div>

            {modulePopup && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                   onClick={() => setModulePopup(null)}>
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 flex flex-col gap-4"
                     onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm font-bold text-[#1C1C1C]">{modulePopup.title}</span>
                    <button onClick={() => setModulePopup(null)}
                            className="text-black/30 hover:text-black/60 text-lg leading-none cursor-pointer">×</button>
                  </div>
                  <p className="text-xs text-black/65 leading-relaxed">{modulePopup.note}</p>
                  <button onClick={() => setModulePopup(null)}
                          className="self-end bg-black/[0.04] hover:bg-black/[0.08] text-black/60 px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer">
                    Bağla
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        /* Executed Test Cases View */
        <div className="flex flex-col gap-4 pb-24">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-black/35 uppercase tracking-widest px-1">Executed Runs (Only run)</h3>
            <button 
              onClick={fetchRuns}
              className="p-1 px-2 hover:bg-black/[0.04] text-[10px] font-bold text-[#E05370] uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${fetchingRuns ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          {fetchingRuns ? (
            <div className="flex justify-center py-16">
              <RefreshCw className="w-8 h-8 text-[#1C1C1C] animate-spin opacity-50" />
            </div>
          ) : runs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-black/10">
              <p className="text-black/35 font-bold text-sm uppercase tracking-wider italic">No executed test cases found in this project</p>
              <p className="text-black/25 text-[11px] font-black uppercase mt-1">Runs are populated once environment suites or launch routines are initiated</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/[0.03] bg-black/[0.01]">
                      <th className="py-4 px-6 text-[10px] font-bold text-black/45 uppercase tracking-wider">Test Suite</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-black/45 uppercase tracking-wider">Executed Test Case</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-black/45 uppercase tracking-wider">Status</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-black/45 uppercase tracking-wider">Duration</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-black/45 uppercase tracking-wider">Timestamp</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-black/45 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.02]">
                    {runs.map((run) => {
                      const openRow = () => {
                        // Run-level klik: ScenarioDetailPage-i boş tag ilə açırıq —
                        // orada sidebar-da bütün parse olunmuş scenarios siyahısı,
                        // tam log + artefaktlar (video / screenshot) görünür.
                        if (run.isE2E && onScenarioOpen) {
                          onScenarioOpen(run.runId, "", "");
                        } else {
                          openDetails(run.id, "suites");
                        }
                      };
                      return (
                      <tr key={run.id} className="hover:bg-pink-soft/20 transition-colors cursor-pointer"
                          onClick={openRow}>
                        <td className="py-4 px-6">
                          <span className="text-xs font-bold text-[#1C1C1C] font-mono">{run.suiteName}</span>
                          {run.platform && (
                            <span className="ml-2 text-[8px] font-black uppercase tracking-widest bg-pink-soft text-pink-deep px-1.5 py-0.5 rounded">{run.platform}</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E05370]" />
                            <span className="text-xs font-semibold text-black/85 truncate max-w-[420px]" title={run.caseName}>{run.caseName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={run.status} />
                        </td>
                        <td className="py-4 px-6 text-xs text-black/40 font-mono font-medium">{run.duration}</td>
                        <td className="py-4 px-6 text-xs text-black/40 font-medium font-mono">
                          {new Date(run.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            {run.status === "running" && !stoppingIds.has(run.runId) && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  // Optimistic: dərhal lokal stoppingIds-ə əlavə
                                  // → düymə dərhal yox olur. fetchRuns polling
                                  // status-u stopped-a çevirəndə Set-dən atılır.
                                  setStoppingIds(prev => new Set(prev).add(run.runId));
                                  await fetch(`/api/e2e/runs/${run.runId}/stop`, { method: "POST" }).catch(() => {});
                                  fetchRuns();
                                }}
                                className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                title="Stop running run"
                              >
                                ⏹ Stop
                              </button>
                            )}
                            {stoppingIds.has(run.runId) && run.status === "running" && (
                              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider animate-pulse">
                                Dayandırılır...
                              </span>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); openRow(); }}
                              className="bg-pink-deep hover:bg-[#D04260] text-white px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Open →
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* E2E run detail panel — live SSE if running, video/screenshot if finished */}
      {selectedRunId && (
        <E2ERunDetailModal runId={selectedRunId} onClose={() => setSelectedRunId(null)} />
      )}
    </div>
  );
}

/** Format seconds as "Mm Ss" / "Ss". */
function fmtDur(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "—";
  const s = Math.round(seconds);
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
}

interface SuiteItemProps {
  key?: any;
  suite: QaseSuite;
  suiteTree: Map<number, QaseSuite[]>;
  depth?: number;
  openDetails: (id: string, source?: string) => void;
  onRunSuite: (s: QaseSuite) => void;
  runs?: any[];
  /** Suite_id → Qase case-ləri (modullar). Yalnız Mobile Apps proyektində verilir. */
  caseMap?: Map<number, { id: number; title: string; automation: number }[]>;
  automationLabel?: (a: number) => string;
  featureForCase?: (title: string) => string | undefined;
  onLaunchE2E?: (featurePath: string) => void;
  onShowModule?: (title: string, note: string) => void;
}

function SuiteItem({ suite, suiteTree, depth = 0, openDetails, onRunSuite, runs = [], caseMap, automationLabel, featureForCase, onLaunchE2E, onShowModule }: SuiteItemProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 1);
  const [showRuns, setShowRuns] = useState(false);
  const subSuites = suiteTree.get(suite.id) || [];
  const hasSub = subSuites.length > 0;
  const suiteCases = caseMap?.get(suite.id) || [];
  const hasCases = suiteCases.length > 0;

  const suiteRuns = (runs || []).filter(r => r.suiteName?.toLowerCase() === suite.title.toLowerCase());

  return (
    <div className="flex flex-col gap-3">
      <div className={cn(
        "group flex items-center p-4 rounded-xl transition-all border relative overflow-hidden",
        depth === 0 
          ? "bg-white dark:bg-[#1A1A20] border-black/[0.04] dark:border-white/[0.05] shadow-sm hover:border-black/10 dark:hover:border-white/10" 
          : "bg-transparent border-transparent hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
      )} style={{ marginLeft: `${depth * 24}px` }}>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn("p-1.5 rounded-lg text-black/40 dark:text-white/45 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] hover:text-black dark:hover:text-white transition-all relative z-10", !hasSub && !hasCases && "invisible")}
        >
          {isExpanded ? <ChevronDown className="w-4.5 h-4.5" /> : <ChevronRight className="w-4.5 h-4.5" />}
        </button>
        
        <div className="flex items-center gap-4 flex-1 px-2 relative z-10">
          <div className={cn("p-2 rounded-lg transition-colors", depth === 0 ? "bg-black/[0.03] dark:bg-white/5 text-black/60 dark:text-white/60" : "bg-black/[0.02] dark:bg-white/[0.02] text-black/40 dark:text-white/40")}>
            <Box className="w-5 h-5 text-pink-deep dark:text-pink-accent" />
          </div>
          <div className="flex flex-col">
            <span className={cn("text-sm font-extrabold tracking-tight uppercase", depth === 0 ? "text-black dark:text-white" : "text-black")}>{suite.title}</span>
            <div className="flex items-center gap-2">
              {depth === 0 && <span className="text-[9px] text-[#8A94A6] dark:text-white/45 font-bold uppercase tracking-wider">{subSuites.length} Neural Sub-nodes</span>}
              {suiteRuns.length > 0 && (
                <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
                  {suiteRuns.length} Runs Mapped
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic View Runs button directly inside row */}
        {suiteRuns.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowRuns(!showRuns);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 rounded-xl text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer mr-2 ml-auto shrink-0 relative z-10 shadow-sm"
          >
            {showRuns ? "Hide Runs" : `View Runs (${suiteRuns.length})`}
          </button>
        )}

        <div className="flex items-center gap-3 transition-all relative z-10">
          <button
            onClick={() => onRunSuite(suite)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white border border-black rounded-xl text-[9px] font-extrabold uppercase tracking-wider hover:bg-black/85 transition-all shadow-sm cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            Launch
          </button>
          <button
            onClick={() => openDetails(suite.id.toString(), "suites")}
            className="p-1.5 bg-black text-white rounded-lg border border-black transition-all hover:bg-black/85 cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Embedded suite active runs log list */}
      <AnimatePresence>
        {showRuns && suiteRuns.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-[#E05370]/5 dark:bg-[#E05370]/10 border border-[#E05370]/10 rounded-2xl p-4 flex flex-col gap-2 mx-4"
            style={{ marginLeft: `${(depth + 1) * 24}px` }}
          >
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[#E05370] border-b border-[#E05370]/10 pb-2 mb-1">
              <span>Executed Test Cases</span>
              <span>{suiteRuns.length} Runs Mapped</span>
            </div>
            {suiteRuns.map(run => (
              <div key={run.id} className="flex items-center justify-between bg-white dark:bg-[#202026] border border-black/[0.04] dark:border-white/5 p-3 rounded-xl shadow-xs transition-all hover:border-pink-light">
                <div className="flex items-center gap-2.5">
                  <span className={cn("w-1.5 h-1.5 rounded-full ring-2", run.status === "passed" ? "bg-emerald-500 ring-emerald-500/10" : "bg-rose-500 ring-rose-500/10")} />
                  <span className="text-xs font-bold text-black/85 dark:text-white/85">{run.caseName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono font-medium text-black/45 dark:text-white/45">{run.duration}</span>
                  <button 
                    type="button" 
                    onClick={() => openDetails(run.id, "suites")}
                    className="p-1.5 px-3 bg-[#E05370] hover:bg-[#D04260] text-white rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Logs
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (hasSub || hasCases) && (
          <motion.div
            initial={{ opacity: 0, height: 0, x: -20 }}
            animate={{ opacity: 1, height: "auto", x: 0 }}
            exit={{ opacity: 0, height: 0, x: -20 }}
            className="overflow-hidden border-l border-black/5 dark:border-white/5 ml-8"
          >
            {subSuites.map(sub => (
              <SuiteItem
                key={sub.id}
                suite={sub}
                suiteTree={suiteTree}
                depth={depth + 1}
                openDetails={openDetails}
                onRunSuite={onRunSuite}
                runs={runs}
                caseMap={caseMap}
                automationLabel={automationLabel}
                featureForCase={featureForCase}
                onLaunchE2E={onLaunchE2E}
                onShowModule={onShowModule}
              />
            ))}

            {/* Qase case-ləri = bu suite-in modulları (Mobile Apps proyekti) */}
            {hasCases && (
              <div className="flex flex-col gap-2 py-2" style={{ marginLeft: `${(depth + 1) * 24}px` }}>
                {suiteCases.map(c => {
                  const isAuto = c.automation === 2;
                  const feature = featureForCase?.(c.title);
                  return (
                    <div key={c.id} className="flex items-center justify-between bg-white dark:bg-[#202026] border border-black/[0.04] dark:border-white/5 px-4 py-3 rounded-xl shadow-xs transition-all hover:border-pink-light">
                      <div className="flex items-center gap-3">
                        <span className={cn("w-1.5 h-1.5 rounded-full", isAuto ? "bg-emerald-500" : c.automation === 1 ? "bg-amber-500" : "bg-black/25")} />
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-black/85 dark:text-white/85">{c.title}</span>
                          <span className={cn("text-[8px] font-black uppercase tracking-widest w-fit px-1.5 py-0.5 rounded",
                            isAuto ? "bg-emerald-500/10 text-emerald-600"
                              : c.automation === 1 ? "bg-amber-500/10 text-amber-600"
                              : "bg-black/[0.04] text-black/45")}>
                            {automationLabel?.(c.automation)}
                          </span>
                        </div>
                      </div>
                      {isAuto ? (
                        <button
                          onClick={() => onLaunchE2E?.(featureForCase?.(suite.title) ?? feature ?? "")}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-pink-deep hover:bg-[#D04260] text-white rounded-xl text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0"
                        >
                          <Play className="w-3 h-3 fill-current" /> Launch
                        </button>
                      ) : (
                        <button
                          onClick={() => onShowModule?.(c.title, `${automationLabel?.(c.automation)} — this module is not automated yet and is tested manually.`)}
                          className="px-3.5 py-1.5 bg-white border border-black/[0.08] hover:bg-black/[0.02] text-black/55 rounded-xl text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0"
                        >
                          Ətraflı
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DevicesPage({ onBack }: { onBack?: () => void }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  const fetchDevices = async () => {
    const res = await fetch("/api/devices");
    const data = await res.json();
    setDevices(data);
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleDelete = async (id: string) => {
    await fetch("/api/devices/" + id, { method: "DELETE" });
    fetchDevices();
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 md:gap-8 overflow-y-auto custom-scrollbar bg-[#F7F9FB]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2.5 bg-white border border-black/[0.06] hover:bg-black/[0.02] text-[#E05370] rounded-xl transition-all cursor-pointer shadow-sm hover:border-pink-light"
              title="Geri qayıt"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-extrabold text-[#1C1C1C] tracking-tight uppercase">Device Cluster</h2>
            <p className="text-black/40 font-bold uppercase tracking-wider text-[9px]">Cloud Infrastructure Managed Nodes</p>
          </div>
        </div>
        <button 
          onClick={() => { setEditingDevice(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-pink-deep hover:bg-[#D04260] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-[0_4px_14px_rgba(224,83,112,0.25)] cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          Provision Device
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device, i) => (
          <motion.div 
            key={device.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="group bg-white p-6 rounded-2xl border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:border-black/10 transition-all flex flex-col gap-5 relative"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-black/[0.03] rounded-xl flex items-center justify-center group-hover:bg-black/[0.05] transition-colors">
                <Smartphone className="w-6 h-6 text-black/50 group-hover:text-black transition-colors" />
              </div>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => { setEditingDevice(device); setIsModalOpen(true); }}
                  className="p-2 text-black/40 hover:text-black hover:bg-black/[0.03] rounded-lg transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(device.id)}
                  className="p-2 text-black/40 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-base font-bold text-[#1C1C1C] tracking-tight uppercase">{device.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-[#8A94A6] font-bold uppercase tracking-wider">{device.platform} • v{device.osVersion}</span>
              </div>
              {device.identity && (
                <div className="mt-1 text-[9px] font-mono text-black/40 dark:text-white/40 truncate">{device.identity}</div>
              )}
            </div>

            <div className="pt-4 border-t border-black/[0.04] flex items-center justify-between">
              <StatusBadge status={device.status} />
              <button className="text-[9px] font-bold text-black/40 hover:text-black uppercase tracking-wider transition-colors">Diagnostics</button>
            </div>
          </motion.div>
        ))}
      </div>

      <DeviceModal 
        isOpen={isModalOpen}
        device={editingDevice}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchDevices}
      />
    </div>
  );
}

function DeviceModal({ isOpen, device, onClose, onSave }: { isOpen: boolean; device: Device | null; onClose: () => void; onSave: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    identity: "",
    platform: "iOS",
    osVersion: "",
    status: "online"
  });

  useEffect(() => {
    if (device) {
      setFormData({
        name: device.name,
        identity: device.identity ?? "",
        platform: device.platform,
        osVersion: device.osVersion,
        status: device.status
      });
    } else {
      setFormData({ name: "", identity: "", platform: "iOS", osVersion: "", status: "online" });
    }
  }, [device, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = device ? "PUT" : "POST";
    const url = device ? `/api/devices/${device.id}` : "/api/devices";
    
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    
    onSave();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={device ? "Upgrade Node" : "Provision New Node"}>
      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg mx-auto">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-black/45 dark:text-white/45 uppercase tracking-wider">Device Name</label>
          <input
            type="text"
            placeholder="e.g. iPhone 15 Pro Max"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-[#1C1C1C] dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-none focus:border-black/25 dark:focus:border-white/20 focus:ring-1 focus:ring-black/5 shift-colors"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-black/45 dark:text-white/45 uppercase tracking-wider">Identity / UDID (Serial)</label>
          <input
            type="text"
            placeholder="e.g. DEVICE-0001"
            value={formData.identity}
            onChange={e => setFormData({ ...formData, identity: e.target.value })}
            className="w-full bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 text-sm font-mono text-[#1C1C1C] dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-none focus:border-black/25 dark:focus:border-white/20 focus:ring-1 focus:ring-black/5"
            required
          />
        </div>

         <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-black/45 dark:text-white/45 uppercase tracking-wider">Platform</label>
            <select 
              value={formData.platform}
              onChange={e => setFormData({ ...formData, platform: e.target.value as any })}
              className="w-full bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl py-3 px-3 text-sm text-[#1C1C1C] dark:text-white focus:outline-none focus:border-black/25 dark:focus:border-white/20 focus:ring-1 focus:ring-black/5"
            >
              <option value="iOS" className="bg-white dark:bg-[#141418] text-[#1C1C1C] dark:text-white/90">iOS</option>
              <option value="Android" className="bg-white dark:bg-[#141418] text-[#1C1C1C] dark:text-white/90">Android</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-black/45 dark:text-white/45 uppercase tracking-wider">OS Version</label>
            <input 
              type="text" 
              placeholder="e.g. 17.4"
              value={formData.osVersion}
              onChange={e => setFormData({ ...formData, osVersion: e.target.value })}
              className="w-full bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-[#1C1C1C] dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-none focus:border-black/25 dark:focus:border-white/20 focus:ring-1 focus:ring-black/5"
              required
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="flex-1 py-3 text-black/50 dark:text-white/50 font-bold uppercase tracking-wider hover:text-black dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded-xl text-[10px] transition-all cursor-pointer">Abort</button>
          <button 
            type="submit" 
            className="flex-[1.5] py-3 bg-pink-deep hover:bg-[#D04260] text-white rounded-xl font-bold uppercase tracking-wider text-[10px] shadow-[0_4px_12px_rgba(224,83,112,0.2)] transition-all active:scale-95 cursor-pointer"
          >
            {device ? "Update Node" : "Provision Node"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function UsersPage({ onBack }: { onBack?: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async () => {
    if (!deletingUser) return;
    await fetch("/api/users/" + deletingUser.id, { method: "DELETE" });
    setDeletingUser(null);
    fetchUsers();
  };

  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 md:gap-8 overflow-y-auto custom-scrollbar bg-[#F7F9FB]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2.5 bg-white border border-black/[0.06] hover:bg-black/[0.02] text-[#E05370] rounded-xl transition-all cursor-pointer shadow-sm hover:border-pink-light"
              title="Geri qayıt"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-extrabold text-[#1C1C1C] tracking-tight uppercase">User Roles</h2>
            <p className="text-black/40 font-bold uppercase tracking-wider text-[9px]">Access Control List & Privileges</p>
          </div>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-pink-deep hover:bg-[#D04260] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-[0_4px_14_rgba(224,83,112,0.25)] w-fit cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Authorize User
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
        <input 
          type="text" 
          placeholder="Filter access pool by username..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-black/[0.04] rounded-xl py-3.5 pl-11 pr-4 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black/15 focus:ring-1 focus:ring-black/5 transition-all shadow-sm"
        />
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.04] overflow-x-auto shadow-sm custom-scrollbar">
        <table className="w-full text-left min-w-[800px]">
          <thead>
            <tr className="border-b border-black/[0.04] bg-black/[0.01]">
              <th className="p-4 md:p-5 text-[9px] font-bold text-black/50 uppercase tracking-widest">Identified User</th>
              <th className="p-4 md:p-5 text-[9px] font-bold text-black/50 uppercase tracking-widest">Permission Tier</th>
              <th className="p-4 md:p-5 text-[9px] font-bold text-black/50 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, i) => (
              <motion.tr 
                key={user.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-black/[0.03] hover:bg-black/[0.01] transition-colors group"
              >
                <td className="p-4 md:p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-black/[0.04] flex items-center justify-center text-[#1C1C1C] font-bold uppercase text-sm">
                      {user.username[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#1C1C1C] tracking-tight text-sm">{user.username}</span>
                      <span className="text-[9px] text-[#8A94A6] font-semibold uppercase tracking-wider mb-1">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                      {(() => {
                        const mails = (user.emails && user.emails.length > 0)
                          ? user.emails
                          : (user.email ? [user.email] : []);
                        return mails.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5 max-w-sm">
                            {mails.map((email, idx) => (
                              <span key={idx} className="bg-pink-soft/80 text-pink-deep px-2 py-0.5 rounded border border-pink-light/40 text-[9px] font-mono tracking-wider">
                                {email}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </td>
                <td className="p-4 md:p-5">
                  <div className="flex flex-wrap gap-1.5">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[9px] font-medium uppercase tracking-wider",
                      user.role === 'admin' ? "bg-black text-white border-black" : "bg-black/[0.04] text-black/60 border-black/[0.04]"
                    )}>
                      <Lock className="w-2.5 h-2.5" />
                      {user.role}
                    </div>
                    {user.permissions?.map(p => (
                      <div key={p} className="px-2.5 py-0.5 rounded-full bg-black/[0.03] border border-black/[0.03] text-[9px] font-medium text-black/60 uppercase tracking-wider">
                        {p}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="p-4 md:p-5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button 
                      onClick={() => { setEditingUser(user); setIsModalOpen(true); }}
                      className="p-2 text-black/40 hover:text-black hover:bg-black/[0.03] rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setDeletingUser(user)}
                      className="p-2 text-black/40 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserModal 
        isOpen={isModalOpen}
        user={editingUser}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchUsers}
      />

      <ConfirmModal 
        isOpen={!!deletingUser}
        title="Terminate Authorization"
        message={`Are you sure you want to delete user "${deletingUser?.username}"? This action cannot be reversed.`}
        confirmText="Yes, Terminate"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeletingUser(null)}
      />
    </div>
  );
}

function UserModal({ isOpen, user, onClose, onSave }: { isOpen: boolean; user: User | null; onClose: () => void; onSave: () => void }) {
  const [emails, setEmails] = useState<string[]>([""]);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "user",
    permissions: [] as string[]
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        password: "", // Keep password empty unless changing
        role: user.role,
        permissions: user.permissions || []
      });
      setEmails(
        user.emails && user.emails.length > 0
          ? [...user.emails]
          : (user.email ? [user.email] : [""])
      );
    } else {
      setFormData({ username: "", password: "", role: "user", permissions: [] });
      setEmails([""]);
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = user ? "PUT" : "POST";
    const url = user ? `/api/users/${user.id}` : "/api/users";
    
    // In edit mode, if password is empty, don't send it
    const cleanedEmails = emails.filter(em => em.trim() !== "");
    const data = {
      ...formData,
      // Backend expects a single `email` (required); keep `emails`
      // for mock/legacy compatibility. Primary email = first entry.
      email: cleanedEmails[0] ?? "",
      emails: cleanedEmails,
    };
    if (user && !data.password) {
      // @ts-ignore
      delete data.password;
    }

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    onSave();
    onClose();
  };

  const togglePermission = (p: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(p) 
        ? prev.permissions.filter(x => x !== p) 
        : [...prev.permissions, p]
    }));
  };

  const availablePermissions = ["execute", "read", "provision", "write"];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? "Edit Axis Access" : "Authorize User Access"}>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-black/45 dark:text-white/45 uppercase tracking-wider">Credential: ID</label>
          <input 
            type="text" 
            placeholder="Unique username identifier..."
            value={formData.username}
            onChange={e => setFormData({ ...formData, username: e.target.value })}
            className="w-full bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-[#1C1C1C] dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-[#E05370]/10 focus:outline-none focus:border-[#E05370]/30"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-black/45 dark:text-white/45 uppercase tracking-wider">
            {user ? "Credential: Reset Keyphrase (Leave blank to keep same)" : "Credential: Keyphrase"}
          </label>
          <input 
            type="password" 
            placeholder="Secure enclave passcode..."
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            className="w-full bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-[#1C1C1C] dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-none focus:border-[#E05370]/30"
            required={!user}
          />
        </div>

        {/* Dynamic Emails list with "+" button */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-black/45 dark:text-white/45 uppercase tracking-wider">Access E-mails</label>
            <button 
              type="button" 
              onClick={() => setEmails([...emails, ""])}
              className="text-[10px] font-bold text-[#E05370] hover:text-[#D04260] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Email
            </button>
          </div>
          <div className="space-y-2.5">
            {emails.map((email, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input 
                  type="email" 
                  placeholder="e.g. user@nexusdash.com"
                  value={email}
                  onChange={e => {
                    const nextEmails = [...emails];
                    nextEmails[idx] = e.target.value;
                    setEmails(nextEmails);
                  }}
                  className="flex-1 bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-[#1C1C1C] dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-[#E05370]/10 focus:outline-none focus:border-[#E05370]/30"
                  required
                />
                {emails.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => setEmails(emails.filter((_, i) => i !== idx))}
                    className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-xl transition-all cursor-pointer border border-red-100 dark:border-red-900/40"
                    title="Remove email"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-black/45 dark:text-white/45 uppercase tracking-wider">Permission Tier</label>
          <div className="grid grid-cols-2 gap-3">
            {["user", "admin"].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setFormData({ ...formData, role: r as any })}
                className={cn(
                  "p-3 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-wider cursor-pointer",
                  formData.role === r 
                    ? "bg-pink-deep text-white border-pink-deep shadow-sm" 
                    : "bg-pink-soft/20 dark:bg-pink-deep/10 border-pink-light/60 dark:border-pink-deep/30 text-black/50 dark:text-white/50 hover:bg-pink-soft/40 dark:hover:bg-pink-deep/20"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-black/45 dark:text-white/45 uppercase tracking-wider">Granular Permissions</label>
          <div className="grid grid-cols-2 gap-2.5">
            {availablePermissions.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => togglePermission(p)}
                className={cn(
                  "flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer",
                  formData.permissions.includes(p) 
                    ? "bg-pink-soft dark:bg-pink-deep/20 border-pink-accent/40 dark:border-pink-light/40 text-[#E05370] dark:text-pink-accent" 
                    : "bg-black/[0.01] dark:bg-white/[0.01] border-black/[0.05] dark:border-white/10 text-black/45 dark:text-white/45 hover:border-pink-light"
                )}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider">{p}</span>
                <div className={cn("w-1.5 h-1.5 rounded-full transition-all", formData.permissions.includes(p) ? "bg-pink-deep dark:bg-pink-accent scale-100" : "bg-black/10 dark:bg-white/10 scale-90")} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 text-black/50 dark:text-white/50 font-bold uppercase tracking-wider hover:text-black dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded-xl text-[10px] transition-all cursor-pointer">Abort</button>
          <button 
            type="submit" 
            className="flex-[1.5] py-3 bg-pink-deep hover:bg-[#D04260] text-white rounded-xl font-bold uppercase tracking-wider text-[10px] shadow-[0_4px_12px_rgba(224,83,112,0.2)] transition-all active:scale-95 cursor-pointer"
          >
            {user ? "Update Protocol" : "Synchronize Access"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ConfirmModal({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel }: { 
  isOpen: boolean; 
  title: string; 
  message: string; 
  confirmText: string; 
  cancelText: string; 
  onConfirm: () => void; 
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-[#1C1C1C]/15 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 12 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl z-[61] overflow-hidden flex flex-col border border-black/10 shadow-[0_16px_50px_rgba(0,0,0,0.06)] p-6 gap-6"
          >
            <div className="space-y-2">
              <h3 className="text-sm md:text-base font-extrabold text-rose-600 tracking-tight uppercase leading-none">{title}</h3>
              <p className="text-xs font-semibold text-black/50 leading-relaxed">{message}</p>
            </div>
            
            <div className="flex gap-3">
              <button onClick={onCancel} className="flex-1 py-2.5 bg-black/[0.03] text-black/60 font-bold uppercase tracking-wider rounded-xl text-[10px] hover:bg-black/[0.06] hover:text-black transition-colors cursor-pointer">{cancelText}</button>
              <button 
                onClick={onConfirm}
                className="flex-[1.5] py-2.5 bg-rose-600 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] shadow-sm hover:bg-rose-700 transition-all active:scale-95 cursor-pointer"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function TestStatusesPage({ openDetails, onBack }: { openDetails: (id: string, source: string) => void; onBack?: () => void }) {
  const [runs, setRuns] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "passed" | "failed">("all");
  const [loading, setLoading] = useState(false);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/test-runs");
      const data = await res.json();
      setRuns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const filteredRuns = runs.filter(run => {
    const matchesSearch = 
      run.projectName.toLowerCase().includes(search.toLowerCase()) || 
      run.suiteName.toLowerCase().includes(search.toLowerCase()) || 
      run.caseName.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && run.status === statusFilter;
  });

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 md:gap-8 overflow-y-auto custom-scrollbar bg-[#F7F9FB] h-full pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2.5 bg-white border border-black/[0.06] hover:bg-black/[0.02] text-[#E05370] rounded-xl transition-all cursor-pointer shadow-sm hover:border-pink-light"
              title="Geri qayıt"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-extrabold text-[#1C1C1C] tracking-tight uppercase">Test Statuses</h2>
            <p className="text-black/40 font-bold uppercase tracking-wider text-[9px]">Global Suite Execution Logs</p>
          </div>
        </div>
        
        <button 
          onClick={fetchRuns}
          className="flex items-center gap-2 bg-white border border-black/10 hover:bg-black/[0.02] text-black/70 px-4 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[9px] transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Stats
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
          <input 
            type="text" 
            placeholder="Search test case or suite code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-black/[0.04] rounded-xl py-3.5 pl-11 pr-4 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black/15 focus:ring-1 focus:ring-black/5 transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "passed", "failed"] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "px-4 py-2 text-[10px] font-bold uppercase tracking-widest border rounded-xl cursor-pointer transition-all",
                statusFilter === f 
                  ? "bg-pink-deep text-white border-pink-deep shadow-sm" 
                  : "bg-white border-black/[0.06] text-black/50 hover:bg-black/[0.01]"
              )}
            >
              {f === "all" ? "All Runs" : f === "passed" ? "Success" : "Failed"}
            </button>
          ))}
        </div>
      </div>

      {loading && runs.length === 0 ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-10 h-10 text-pink-deep animate-spin" />
        </div>
      ) : filteredRuns.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-black/10">
          <p className="text-black/35 font-bold uppercase tracking-wider italic">No run records found</p>
          <p className="text-black/25 text-[10px] font-bold uppercase tracking-widest mt-1">Adjust parameters or execute tests in active projects</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/[0.03] bg-black/[0.01]">
                  <th className="py-4 px-6 text-[10px] font-bold text-black/45 uppercase tracking-wider">Project</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-black/45 uppercase tracking-wider">Test Suite</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-black/45 uppercase tracking-wider">Test Case</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-black/45 uppercase tracking-wider">Execution Status</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-black/45 uppercase tracking-wider">Duration</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-black/45 uppercase tracking-wider">Occurred</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-[#1C1C1C]/45 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.02]">
                {filteredRuns.map((run, idx) => (
                  <motion.tr 
                    key={run.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-black/[0.01] transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Box className="w-3.5 h-3.5 text-pink-deep" />
                        <span className="text-xs font-bold text-black/75">{run.projectName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-semibold text-black/60">{run.suiteName}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-semibold text-black/80">{run.caseName}</span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="py-4 px-6 text-xs text-black/40 font-mono font-medium">{run.duration}</td>
                    <td className="py-4 px-6 text-xs text-black/40 font-medium font-mono">
                      {new Date(run.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        <button 
                          onClick={() => openDetails(run.id, "statuses")}
                          className="bg-[#E05370]/10 hover:bg-[#E05370]/20 text-[#E05370] px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Logs
                        </button>
                        <button 
                          onClick={() => openDetails(run.id, "statuses")}
                          className="p-1.5 text-black/45 hover:text-[#E05370] hover:bg-black/[0.03] rounded-lg transition-colors cursor-pointer"
                          title="Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function NotificationsPage({ onBack, theme, defaultView = "inbox" }: { onBack?: () => void; theme?: "light" | "dark"; defaultView?: "inbox" | "broadcast" }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Custom Inbox Views
  const [activeTab, setActiveTab] = useState<"inbox" | "broadcast">(defaultView);

  useEffect(() => {
    setActiveTab(defaultView);
  }, [defaultView]);
  const [selectedMail, setSelectedMail] = useState<any | null>(null);

  // Form compose fields state
  const [recipient, setRecipient] = useState("");
  const [recipientSearch, setRecipientSearch] = useState("");
  const [showMailDrop, setShowMailDrop] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const list = await res.json();
      setNotifications(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const list = await res.json();
      setUsers(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  // Inbox shows all notifications in this demo build.
  const inboxMails = useMemo(() => notifications, [notifications]);

  // Set initial selected mail on mount/update
  useEffect(() => {
    if (inboxMails.length > 0 && !selectedMail) {
      setSelectedMail(inboxMails[0]);
    }
  }, [inboxMails, selectedMail]);

  // Handle autocomplete matching rules
  const matchedUsers = useMemo(() => {
    if (!recipientSearch) return [];
    const query = recipientSearch.toLowerCase();
    return users.filter(u => {
      const matchesUsername = u.username?.toLowerCase().includes(query);
      // Backend returns a single `email`; mock/legacy returns `emails` array.
      const mails: string[] = (u.emails && u.emails.length > 0)
        ? u.emails
        : (u.email ? [u.email] : []);
      const matchesEmail = mails.some((email: string) => email.toLowerCase().includes(query));
      return matchesUsername || matchesEmail;
    });
  }, [recipientSearch, users]);

  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !subject || !body) return;
    setSending(false);
    setSending(true);
    try {
      const selectedUser = users.find(u => u.emails?.includes(recipient) || u.username === recipientSearch);
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: recipient,
          recipientUsername: selectedUser ? selectedUser.username : recipientSearch || recipient.split("@")[0],
          subject,
          body
        })
      });
      setSubject("");
      setBody("");
      setRecipient("");
      setRecipientSearch("");
      setIsComposeOpen(false);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={cn(
      "p-6 md:p-8 flex flex-col gap-6 md:gap-8 overflow-y-auto custom-scrollbar h-full pb-24 transition-colors duration-300",
      theme === "dark" ? "bg-[#101014]" : "bg-[#F7F9FB]"
    )}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className={cn(
                "p-2.5 border rounded-xl transition-all cursor-pointer shadow-sm",
                theme === "dark" 
                  ? "bg-[#1A1A20] border-white/10 text-[#E05370]" 
                  : "bg-white border-black/[0.06] hover:bg-black/[0.02] text-[#E05370] hover:border-pink-light"
              )}
              title="Geri qayıt"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div className="space-y-1">
            <h2 className={cn("text-xl md:text-2xl font-extrabold tracking-tight uppercase", theme === "dark" ? "text-white" : "text-[#1C1C1C]")}>
              {defaultView === "inbox" ? "Mailing Notices" : "Notifications"}
            </h2>
            <p className={cn("text-[9px] font-bold uppercase tracking-wider", theme === "dark" ? "text-white/40" : "text-black/40")}>
              {defaultView === "inbox" ? "Platform Notification Audit Logs & Inbox" : "Sent Notification Archives"}
            </p>
          </div>
        </div>

        {defaultView === "inbox" && (
          <button
            onClick={() => setIsComposeOpen(true)}
            className="flex items-center gap-2 bg-pink-deep hover:bg-[#D04260] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-[0_4px_14px_rgba(224,83,112,0.25)] cursor-pointer w-fit"
          >
            <Plus className="w-4 h-4" />
            Send Mail
          </button>
        )}
      </div>

      {/* High-visibility headers with dark text for the active view to meet theme contrast requirements */}
      <div className="flex border-b border-black/[0.06] dark:border-white/[0.06] pb-2">
        {defaultView === "inbox" ? (
          <div className="flex items-center gap-2 text-[#1C1C1C] dark:text-white font-extrabold uppercase tracking-wider text-xs pb-1 border-b-2 border-[#E05370]">
            <span className="text-[#1A1A20] dark:text-white font-black text-xs">My Inbox ({inboxMails.length})</span>
            {inboxMails.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#E05370] animate-ping" />
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[#1C1C1C] dark:text-white font-extrabold uppercase tracking-wider text-xs pb-1 border-b-2 border-[#E05370]">
            <span className="text-[#1A1A20] dark:text-white font-black text-xs">Broadcast Log ({notifications.length})</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-10 h-10 text-pink-deep animate-spin" />
        </div>
      ) : activeTab === "inbox" ? (
        /* ELEGANT INTUITIVE INBOX MAIL CLIENT */
        inboxMails.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-[#1A1A20] rounded-3xl border border-dashed border-black/10 dark:border-white/10">
            <Mail className="w-12 h-12 text-black/20 dark:text-white/20 mx-auto animate-bounce" />
            <p className="text-black/35 dark:text-white/35 font-bold uppercase tracking-wider italic mt-3">No mail transmissions found in your inbox</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[500px] overflow-hidden">
            {/* Left messages list */}
            <div className="lg:col-span-2 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
              {inboxMails.map((notif) => {
                const isSelected = selectedMail?.id === notif.id;
                return (
                  <div
                    key={notif.id}
                    onClick={() => setSelectedMail(notif)}
                    className={cn(
                      "p-4 rounded-xl border transition-all cursor-pointer text-left relative overflow-hidden",
                      isSelected
                        ? "bg-pink-soft/30 dark:bg-pink-deep/10 border-[#E05370]/60 text-black dark:text-white"
                        : theme === "dark" 
                          ? "bg-[#1A1A20] border-white/5 text-white/70 hover:bg-white/[0.02]"
                          : "bg-white border-black/[0.04] text-black/70 hover:bg-black/[0.01]"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                        isSelected 
                          ? "bg-[#E05370]/20 border-[#E05370]/30 text-[#E05370]" 
                          : "bg-black/[0.03] dark:bg-white/5 border-black/[0.05] dark:border-white/5 text-black/40 dark:text-white/45"
                      )}>
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-tight text-[#E05370] truncate">
                            {notif.recipientUsername || "user"}
                          </span>
                          <span className="text-[9px] font-mono text-black/40 dark:text-white/40 shrink-0">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h4 className={cn("text-xs font-bold leading-tight truncate", isSelected ? "text-black dark:text-white" : "text-black/85 dark:text-white/85")}>{notif.subject}</h4>
                        <p className="text-[10px] text-black/40 dark:text-white/40 line-clamp-2 truncate">{notif.body}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right selected mail reader */}
            <div className={cn(
              "lg:col-span-3 rounded-2xl border p-6 flex flex-col gap-5 overflow-y-auto custom-scrollbar relative",
              theme === "dark" ? "bg-[#1A1A20] border-white/[0.06]" : "bg-white border-black/[0.04]"
            )}>
              {selectedMail ? (
                <>
                  <div className="flex justify-between items-start border-b border-black/[0.04] dark:border-white/[0.04] pb-4 gap-4">
                    <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        Email Transmitted Successfully
                      </span>
                      <h3 className={cn("text-base md:text-lg font-extrabold tracking-tight leading-snug", theme === "dark" ? "text-white" : "text-[#1C1C1C]")}>
                        {selectedMail.subject}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <span className="text-black/40 dark:text-white/40">From: <strong className="text-pink-deep">Admin Node</strong></span>
                        <span className="text-black/35 dark:text-white/35">|</span>
                        <span className="text-black/40 dark:text-white/40">To: <strong className="text-pink-deep dark:text-pink-accent">{selectedMail.recipientEmail}</strong></span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-black/30 dark:text-white/30 whitespace-nowrap bg-black/[0.02] dark:bg-white/[0.02] px-2.5 py-1 rounded-lg border border-black/[0.03] dark:border-white/[0.03]">
                      {new Date(selectedMail.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className={cn("text-[10px] font-extrabold uppercase tracking-widest mb-3", theme === "dark" ? "text-white/40" : "text-black/40")}>Mailing Payload (Body)</p>
                    <div className={cn(
                      "rounded-xl p-5 border text-xs leading-relaxed whitespace-pre-wrap font-mono",
                      theme === "dark" ? "bg-[#141418] border-white/5 text-white/80" : "bg-[#F7F9FB] border-black/[0.03]"
                    )}>
                      {selectedMail.body}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-black/[0.04] dark:border-white/[0.04] pt-4 mt-auto">
                    <span className="text-[9px] font-mono text-black/40 dark:text-white/40">Secure Hash: SHA-256 Verified Pulse Client</span>
                    <button
                      onClick={() => {
                        setSubject(`Re: ${selectedMail.subject}`);
                        setRecipient(selectedMail.recipientEmail);
                        setRecipientSearch(selectedMail.recipientUsername || selectedMail.recipientEmail.split("@")[0]);
                        setIsComposeOpen(true);
                      }}
                      className="px-4 py-2 bg-[#E05370]/10 hover:bg-[#E05370]/15 text-[#E05370] hover:scale-95 transition-all text-[9px] font-black uppercase tracking-widest rounded-lg cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3" /> Reply Mail
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-40">
                  <Mail className="w-12 h-12 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-wider">Select Mail to inspect headers</p>
                </div>
              )}
            </div>
          </div>
        )
      ) : (
        /* ORIGINAL BROADCAST ARCHIVE */
        notifications.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-[#1A1A20] rounded-3xl border border-dashed border-black/10 dark:border-white/10">
            <Mail className="w-12 h-12 text-black/20 dark:text-white/20 mx-auto animate-bounce" />
            <p className="text-black/35 dark:text-white/35 font-bold uppercase tracking-wider italic mt-3">No mail transmissions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif, i) => {
              const isExpanded = expandedId === notif.id;
              return (
                <motion.div 
                  key={notif.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    "rounded-2xl border p-5 transition-all cursor-pointer shadow-xs",
                    theme === "dark" 
                      ? "bg-[#1A1A20] border-white/[0.04] hover:border-white/10" 
                      : "bg-white border-black/[0.04] hover:border-black/10"
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : notif.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-pink-soft text-pink-deep flex items-center justify-center border border-pink-light/40 shrink-0">
                        <Mail className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <h4 className={cn("text-sm font-bold leading-none", theme === "dark" ? "text-white" : "text-[#1C1C1C]")}>{notif.subject}</h4>
                        <p className="text-xs text-black/45 dark:text-white/45 font-medium">To: <span className="font-bold text-pink-deep dark:text-pink-accent">{notif.recipientUsername}</span> ({notif.recipientEmail})</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 md:text-right shrink-0">
                      <span className="text-[10px] font-mono text-black/30 dark:text-white/30 font-bold">{new Date(notif.timestamp).toLocaleString()}</span>
                      <div className="text-black/30 dark:text-white/30 bg-black/[0.03] dark:bg-white/5 p-1.5 rounded-lg">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-4 pt-4 border-t border-black/[0.04] dark:border-white/[0.04]"
                      >
                        <div className="bg-black/[0.015] dark:bg-white/[0.015] border border-black/[0.03] dark:border-white/[0.03] rounded-xl p-4">
                          <p className="text-xs text-black/45 dark:text-white/40 font-semibold uppercase tracking-wider mb-2">Notice Body Contents</p>
                          <p className={cn("text-xs whitespace-pre-wrap leading-relaxed font-mono p-3 rounded-lg border", theme === "dark" ? "bg-[#101014] border-white/5 text-white/80" : "bg-white border-black/[0.03] text-black/75")}>
                            {notif.body}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )
      )}

      {/* Composition Dialog inside dynamic Modal */}
      <Modal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} title="New Mail Notification">
        <form onSubmit={handleComposeSubmit} className="space-y-5 max-w-lg mx-auto">
          
          {/* USERNAME LIVE SEARCH DROPDOWN COMPONENT */}
          <div className="space-y-2 relative">
            <label className="text-[10px] font-bold text-black/45 dark:text-white/45 uppercase tracking-wider">Search Recipient (Username)</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type and live search username..."
                value={recipientSearch}
                onChange={(e) => {
                  setRecipientSearch(e.target.value);
                  setShowMailDrop(true);
                }}
                onFocus={() => setShowMailDrop(true)}
                className="w-full bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-[#1C1C1C] dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-none focus:border-black/25 dark:focus:border-white/20"
                required
              />
              {recipient && (
                <div className="absolute right-3 top-2.5">
                  <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
                    Selected
                  </span>
                </div>
              )}
            </div>

            {/* Target Display Badge */}
            {recipient && (
              <p className="text-[10px] font-semibold text-pink-deep dark:text-pink-light">
                Recipient Email: <span className="font-mono font-bold decoration-solid underline text-pink-deep dark:text-pink-accent">{recipient}</span>
              </p>
            )}

            {/* Live Autocomplete choice list dropdown */}
            <AnimatePresence>
              {showMailDrop && recipientSearch && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute left-0 right-0 max-h-48 overflow-y-auto bg-white dark:bg-[#1A1A20] border border-black/10 dark:border-white/10 shadow-lg rounded-xl mt-1 z-50 divide-y divide-black/[0.03] dark:divide-white/[0.03] custom-scrollbar"
                >
                  {matchedUsers.length === 0 ? (
                    <div className="p-3 text-xs text-black/40 dark:text-white/40 italic">
                      No matching user matching "{recipientSearch}" found
                    </div>
                  ) : (
                    matchedUsers.map((u) => {
                      const userEmails: string[] = (u.emails && u.emails.length > 0)
                        ? u.emails
                        : (u.email ? [u.email] : []);
                      if (userEmails.length === 0) return null;
                      return userEmails.map((email: string, idx: number) => (
                        <button
                          key={`${u.id}-${idx}`}
                          type="button"
                          onClick={() => {
                            setRecipient(email);
                            setRecipientSearch(u.username);
                            setShowMailDrop(false);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-pink-soft/25 dark:hover:bg-white/[0.05] bg-white dark:bg-[#1A1A20] transition-colors cursor-pointer text-xs"
                        >
                          <div className="font-bold text-black/85 dark:text-white/85 flex items-center justify-between">
                            <span>{u.username}</span>
                            <span className="text-[9px] font-mono opacity-50 font-bold uppercase text-black/50 dark:text-white/50">Role: {u.role}</span>
                          </div>
                          <div className="text-[10px] text-pink-deep dark:text-pink-accent font-mono font-medium">{email}</div>
                        </button>
                      ));
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-black/45 dark:text-white/45 uppercase tracking-wider">Mailing Subject</label>
            <input 
              type="text" 
              placeholder="e.g. Critical Suite Execution Alert"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-[#1C1C1C] dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-none focus:border-black/25 dark:focus:border-white/20"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-black/45 dark:text-white/45 uppercase tracking-wider">Email Text Message</label>
            <textarea 
              rows={5}
              placeholder="Provide execution summaries, fail codes, or directives..."
              value={body}
              onChange={e => setBody(e.target.value)}
              className="w-full bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 text-xs text-[#1C1C1C] dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-none focus:border-black/25 dark:focus:border-white/20 font-mono"
              required
            />
          </div>

          <div className="flex gap-4 pt-3">
            <button 
              type="button" 
              onClick={() => {
                setIsComposeOpen(false);
                setShowMailDrop(false);
              }} 
              className="flex-1 py-3 text-black/50 dark:text-white/50 font-bold uppercase tracking-wider hover:text-black dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded-xl text-[10px] transition-all cursor-pointer"
            >
              Discard
            </button>
            <button 
              type="submit" 
              className="flex-[1.5] py-3 bg-pink-deep hover:bg-[#D04260] text-white rounded-xl font-bold uppercase tracking-wider text-[10px] shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              disabled={sending}
            >
              {sending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Send Notification
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function QaseIntegrationPage({ onBack }: { onBack?: () => void }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProjectCode, setActiveProjectCode] = useState("");
  const [suites, setSuites] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  
  // Creation state
  const [projTitle, setProjTitle] = useState("");
  const [projCode, setProjCode] = useState("");
  const [suiteTitle, setSuiteTitle] = useState("");
  const [suiteParentId, setSuiteParentId] = useState("");
  const [caseTitle, setCaseTitle] = useState("");
  const [caseSuiteId, setCaseSuiteId] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadProjects = async () => {
    try {
      const res = await fetch("/api/qase/projects");
      const data = await res.json();
      setProjects(data.result.entities || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSuitesAndCases = async (code: string) => {
    if (!code) return;
    setLoading(true);
    try {
      const suiteRes = await fetch(`/api/qase/suites/${code}`);
      const suiteData = await suiteRes.json();
      setSuites(suiteData.result.entities || []);

      const caseRes = await fetch(`/api/qase/cases/${code}`);
      const caseData = await caseRes.json();
      setCases(caseData.result.entities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (activeProjectCode) {
      loadSuitesAndCases(activeProjectCode);
    } else {
      setSuites([]);
      setCases([]);
    }
  }, [activeProjectCode]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle || !projCode) return;
    try {
      const res = await fetch("/api/qase/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: projTitle, code: projCode })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed registration");
      }
      // Optimistik update: backend qaytaran DTO-nu dərhal list-ə qoş. Qase-də
      // replication delay olduğu üçün loadProjects() bəzən köhnə data qaytarır.
      const created = data.result; // { code, title }
      setProjects(prev => {
        // Dublikat olmasın
        if (prev.some(p => p.code === created.code)) return prev;
        return [created, ...prev];
      });
      setProjTitle("");
      setProjCode("");
      setMessage({ type: "success", text: `Project "${created.title}" successfully synced with Qase.io` });
      // Backend ilə sync-i təsdiqləmək üçün 1.5s gec yenidən çək
      setTimeout(loadProjects, 1500);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleCreateSuite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suiteTitle || !activeProjectCode) return;
    try {
      const parentIdNum = suiteParentId ? parseInt(suiteParentId, 10) : null;
      const res = await fetch(`/api/qase/suites/${activeProjectCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: suiteTitle, parentId: parentIdNum })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Suite create failed");
      setSuiteTitle("");
      setSuiteParentId("");
      setMessage({ type: "success", text: `Suite "${data.result.title}" successfully registered in Qase hierarchy` });
      loadSuitesAndCases(activeProjectCode);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || String(err) });
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseTitle || !caseSuiteId || !activeProjectCode) return;
    try {
      const suiteIdNum = parseInt(caseSuiteId, 10);
      if (!Number.isFinite(suiteIdNum) || suiteIdNum <= 0) {
        setMessage({ type: "error", text: "Suite ID düzgün rəqəm olmalıdır" });
        return;
      }
      const res = await fetch(`/api/qase/cases/${activeProjectCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: caseTitle, suiteId: suiteIdNum })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Case create failed");
      setCaseTitle("");
      setCaseSuiteId("");
      setMessage({ type: "success", text: `Test Case "${data.result.title}" successfully synchronized. Real-time test runs appended.` });
      loadSuitesAndCases(activeProjectCode);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || String(err) });
    }
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 md:gap-8 overflow-y-auto custom-scrollbar bg-[#F7F9FB] h-full pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2.5 bg-white border border-black/[0.06] hover:bg-black/[0.02] text-[#E05370] rounded-xl transition-all cursor-pointer shadow-sm hover:border-pink-light"
              title="Geri qayıt"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-extrabold text-[#1C1C1C] tracking-tight uppercase">Qase.io Integration Workspace</h2>
            <p className="text-black/40 font-bold uppercase tracking-wider text-[9px]">Direct Connection & Real-time Bi-directional Synchronization</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={cn(
          "p-4 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center justify-between shadow-sm border",
          message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800"
        )}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-[10px] font-black uppercase text-black/50 hover:text-black transition-colors leading-none font-bold">Clear</button>
        </div>
      )}

      {/* Main interactive cards layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Sync Area A: Projects */}
        <div className="bg-white rounded-2xl border border-black/[0.04] p-6 shadow-sm flex flex-col gap-5">
          <div>
            <h3 className="text-sm font-extrabold text-[#111] uppercase tracking-tight">Sync Area A: Projects</h3>
            <p className="text-[10px] font-bold text-[#8A94A6] uppercase tracking-wider">Initialize new repositories natively</p>
          </div>
          
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-black/45 uppercase tracking-widest">Project Name</label>
              <input 
                type="text" 
                placeholder="e.g. Mobile Checkout Repo"
                value={projTitle}
                onChange={e => setProjTitle(e.target.value)}
                className="w-full bg-black/[0.02] border border-black/10 rounded-xl py-2.5 px-4 text-xs text-[#1C1C1C] placeholder:text-black/30 focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-black/45 uppercase tracking-widest">Unique Project Code</label>
              <input 
                type="text" 
                placeholder="e.g. MCR (All Caps)"
                value={projCode}
                onChange={e => setProjCode(e.target.value.toUpperCase())}
                className="w-full bg-black/[0.02] border border-black/10 rounded-xl py-2.5 px-4 text-xs text-[#1C1C1C] placeholder:text-black/30 focus:outline-none font-mono tracking-widest"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full py-2.5 bg-pink-deep hover:bg-[#D04260] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer shadow-sm active:scale-95"
            >
              Synchronize Project Area
            </button>
          </form>

          <div className="pt-4 border-t border-black/[0.04] flex-1">
            <h4 className="text-[9px] font-black uppercase text-black/30 tracking-widest mb-3">Live Repositories list</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {projects.map(p => (
                <div 
                  key={p.code} 
                  onClick={() => setActiveProjectCode(p.code)}
                  className={cn(
                    "p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
                    activeProjectCode === p.code 
                      ? "bg-pink-soft text-pink-deep border-pink-light/80" 
                      : "bg-black/[0.01] border-black/[0.03] text-black/60 hover:bg-black/[0.02]"
                  )}
                >
                  <span className="text-xs font-bold leading-none">{p.title}</span>
                  <span className="text-[9px] font-mono font-bold uppercase bg-white border border-black/10 px-1.5 py-0.5 rounded leading-none text-black/70">{p.code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sync Area B: Suites & Sub-suites */}
        <div className="bg-white rounded-2xl border border-black/[0.04] p-6 shadow-sm flex flex-col gap-5">
          <div>
            <h3 className="text-sm font-extrabold text-[#111] uppercase tracking-tight">Sync Area B: Suites</h3>
            <p className="text-[10px] font-bold text-[#8A94A6] uppercase tracking-wider">Configure dynamic nesting scopes</p>
          </div>

          <form onSubmit={handleCreateSuite} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-black/45 uppercase tracking-widest">Active Project Selection</label>
              <select
                value={activeProjectCode}
                onChange={e => setActiveProjectCode(e.target.value)}
                className="w-full bg-black/[0.02] border border-black/10 rounded-xl py-2.5 px-3 text-xs text-[#1C1C1C]"
                required
              >
                <option value="">-- Choose Target Project area --</option>
                {projects.map(p => (
                  <option key={p.code} value={p.code}>{p.title} ({p.code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-black/45 uppercase tracking-widest">Suite Title</label>
              <input 
                type="text" 
                placeholder="e.g. Checkout Validation Suite"
                value={suiteTitle}
                onChange={e => setSuiteTitle(e.target.value)}
                className="w-full bg-black/[0.02] border border-black/10 rounded-xl py-2.5 px-4 text-xs text-[#1C1C1C] focus:outline-none"
                required
                disabled={!activeProjectCode}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-black/45 uppercase tracking-widest">Nesting Level (Select Parent Suite)</label>
              <select
                value={suiteParentId}
                onChange={e => setSuiteParentId(e.target.value)}
                className="w-full bg-black/[0.02] border border-black/10 rounded-xl py-2.5 px-3 text-xs text-[#1C1C1C]"
                disabled={!activeProjectCode || suites.length === 0}
              >
                <option value="">-- Set as Root Suite --</option>
                {suites.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-pink-deep hover:bg-[#D04260] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 active:scale-95 shadow-sm"
              disabled={!activeProjectCode}
            >
              Synchronize Suite Hierarchy
            </button>
          </form>

          <div className="pt-4 border-t border-black/[0.04] flex-1">
            <h4 className="text-[9px] font-black uppercase text-black/30 tracking-widest mb-3">Modular Suites list</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {suites.map(s => (
                <div key={s.id} className="p-2.5 bg-black/[0.01] border border-black/[0.03] rounded-xl flex items-center justify-between text-black/60">
                  <span className="text-xs font-semibold">{s.title}</span>
                  {s.parent_id ? (
                    <span className="text-[8px] font-mono font-bold uppercase bg-pink-soft px-1 rounded leading-none text-pink-deep">Parent ID: {s.parent_id}</span>
                  ) : (
                    <span className="text-[8px] font-mono font-bold uppercase bg-black/[0.04] px-1 rounded leading-none">Root Node</span>
                  )}
                </div>
              ))}
              {suites.length === 0 && (
                <p className="text-[10px] font-bold text-black/30 uppercase tracking-wider text-center py-6 italic">No active suites mapped</p>
              )}
            </div>
          </div>
        </div>

        {/* Sync Area C: Test Cases creation & Auto Execution sync */}
        <div className="bg-white rounded-2xl border border-black/[0.04] p-6 shadow-sm flex flex-col gap-5">
          <div>
            <h3 className="text-sm font-extrabold text-[#111] uppercase tracking-tight">Sync Area C: Test Cases</h3>
            <p className="text-[10px] font-bold text-[#8A94A6] uppercase tracking-wider">Synchronize and generate execution status</p>
          </div>

          <form onSubmit={handleCreateCase} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-black/45 uppercase tracking-widest">Select Target Suite</label>
              <select
                value={caseSuiteId}
                onChange={e => setCaseSuiteId(e.target.value)}
                className="w-full bg-black/[0.02] border border-black/10 rounded-xl py-2.5 px-3 text-xs text-[#1C1C1C]"
                required
                disabled={!activeProjectCode || suites.length === 0}
              >
                <option value="">-- Choose Suite folder --</option>
                {suites.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-black/45 uppercase tracking-widest">Test Case Name</label>
              <input 
                type="text" 
                placeholder="e.g. Submit payment returns checkout fail assertion error"
                value={caseTitle}
                onChange={e => setCaseTitle(e.target.value)}
                className="w-full bg-black/[0.02] border border-black/10 rounded-xl py-2.5 px-4 text-xs text-[#1C1C1C] focus:outline-none"
                required
                disabled={!caseSuiteId}
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-pink-deep to-[#E05370] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              disabled={!caseSuiteId || !caseTitle}
            >
              Create Sync Case
            </button>
          </form>

          <div className="pt-4 border-t border-black/[0.04] flex-1">
            <h4 className="text-[9px] font-black uppercase text-black/30 tracking-widest mb-3">Synchronized Cases list</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {cases.map(c => (
                <div key={c.id} className="p-2.5 bg-black/[0.01] border border-black/[0.03] rounded-xl flex items-center justify-between text-black/60">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-black/75 leading-tight">{c.title}</span>
                    <span className="text-[8px] font-mono font-bold text-black/35 uppercase mt-1">Belongs to Suite ID: {c.suite_id}</span>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
              {cases.length === 0 && (
                <p className="text-[10px] font-bold text-black/30 uppercase tracking-wider text-center py-6 italic">No synchronized cases mapped</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export function SystemConfigPage({ theme, setTheme, onBack }: { theme: "light" | "dark"; setTheme: (t: "light" | "dark") => void; onBack?: () => void }) {
  return (
    <div className={cn(
      "p-6 md:p-8 flex flex-col gap-6 md:gap-8 overflow-y-auto custom-scrollbar h-full pb-24 transition-colors duration-300",
      theme === "dark" ? "bg-[#101014]" : "bg-[#F7F9FB]"
    )}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className={cn(
                "p-2.5 border rounded-xl transition-all cursor-pointer shadow-sm",
                theme === "dark" 
                  ? "bg-[#1A1A20] border-white/10 hover:bg-white/5 text-[#E05370]" 
                  : "bg-white border-black/[0.06] hover:bg-black/[0.02] text-[#E05370] hover:border-pink-light"
              )}
              title="Geri qayıt"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div className="space-y-1">
            <h2 className={cn("text-xl md:text-2xl font-extrabold tracking-tight uppercase", theme === "dark" ? "text-white" : "text-[#1C1C1C]")}>System Config</h2>
            <p className={cn("text-[9px] font-bold uppercase tracking-wider", theme === "dark" ? "text-white/40" : "text-black/40")}>Global Dashboard Configuration & Enclave Protocols</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl w-full mx-auto grid grid-cols-1 gap-6">
        <div className={cn(
          "rounded-2xl border p-6 shadow-sm flex flex-col gap-6 transition-all",
          theme === "dark" ? "bg-[#1A1A20] border-white/[0.06]" : "bg-white border-black/[0.04]"
        )}>
          <div>
            <h3 className={cn("text-sm font-extrabold uppercase tracking-tight", theme === "dark" ? "text-white" : "text-[#111]")}>Display Theme Selection</h3>
            <p className={cn("text-[10px] font-bold uppercase tracking-wider", theme === "dark" ? "text-white/45" : "text-[#8A94A6]")}>Switch between Light and Dark interface modes instantly</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "p-6 rounded-2xl border flex flex-col items-center gap-4 transition-all cursor-pointer text-center",
                theme === "light" 
                  ? "bg-pink-soft border-[#E05370] text-[#E05370] shadow-[0_4px_16px_rgba(224,83,112,0.1)]" 
                  : "bg-black/[0.01] hover:bg-black/[0.03] border-black/[0.06] text-black/50"
              )}
            >
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all", theme === "light" ? "bg-white text-[#E05370]" : "bg-black/[0.04] text-black/40")}>
                <Sun className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest block">Light Mode</span>
                <span className="text-[9px] font-semibold opacity-60 uppercase tracking-wider block">Soft Pink & White Slate</span>
              </div>
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "p-6 rounded-2xl border flex flex-col items-center gap-4 transition-all cursor-pointer text-center",
                theme === "dark" 
                  ? "bg-[#E05370]/20 border-[#E05370] text-pink-light shadow-[0_4px_16px_rgba(224,83,112,0.15)]" 
                  : "bg-white/[0.01] hover:bg-white/[0.03] border-white/[0.05] text-white/50"
              )}
            >
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all", theme === "dark" ? "bg-[#101014] text-pink-accent" : "bg-white/[0.04] text-white/40")}>
                <Moon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest block">Dark Mode</span>
                <span className="text-[9px] font-semibold opacity-60 uppercase tracking-wider block">Charcoal & Obsidian Enclave</span>
              </div>
            </button>
          </div>
        </div>

        <div className={cn(
          "rounded-2xl border p-6 shadow-sm flex flex-col gap-4 transition-all",
          theme === "dark" ? "bg-[#1A1A20] border-white/[0.06] text-white/90" : "bg-white border-black/[0.04] text-black/85"
        )}>
          <div>
            <h3 className={cn("text-xs font-extrabold uppercase tracking-widest", theme === "dark" ? "text-white" : "text-black")}>System Metadata Enclave</h3>
          </div>
          <div className="space-y-2 text-xs font-medium font-mono">
            <div className="flex justify-between border-b border-black/[0.03] dark:border-white/[0.03] pb-2 text-[10px] uppercase">
              <span className="text-black/40 dark:text-white/40">Status Code</span>
              <span className="text-emerald-500 font-bold">Secure Connection OK</span>
            </div>
            <div className="flex justify-between border-b border-black/[0.03] dark:border-white/[0.03] pb-2 text-[10px] uppercase">
              <span className="text-black/40 dark:text-white/40">Active Enclave API</span>
              <span>1.0.4 - Release Cluster</span>
            </div>
            <div className="flex justify-between text-[10px] uppercase">
              <span className="text-black/40 dark:text-white/40">Authorization Node</span>
              <span>Administrator Portal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * E2E Launch Modal — Telegram bot pattern
 *  1) Loads connected devices via GET /api/e2e/devices
 *  2) Lets user pick platform (Android / iOS)
 *  3) Android: 1-2 cihaz seçilir (2 = multi-device, dev1=pre/dev + dev2=prod paralel)
 *     iOS: tunnel + WDA preflight göstərilir; "Start" disable olunur problem varsa
 *  4) Start → POST /api/e2e/runs/{platform} → run id alır
 *  5) EventSource ilə /api/e2e/runs/{id}/stream-i dinləyir → real-time log axını
 *  6) Stop → POST /api/e2e/runs/{id}/stop
 * ────────────────────────────────────────────────────────────────────── */
interface AndroidDeviceInfo { udid: string; model: string; androidVersion: string; ready: boolean }
interface IosDeviceInfo { udid: string; name: string; osVersion: string }
interface IosPreflightStatus { tunnelUp: boolean; wdaReachable: boolean; wdaUrl: string | null; hint: string | null }
interface DeviceList { android: AndroidDeviceInfo[]; ios: IosDeviceInfo[]; iosPreflight: IosPreflightStatus }

function E2ELaunchModal({ projectTitle, projectCode, prodFeaturePath, onClose, activeRun, setActiveRun }:
    { projectTitle: string; projectCode: string; prodFeaturePath?: string; onClose: () => void;
      activeRun: { runId: string; projectCode: string; platform: "Android" | "iOS" } | null;
      setActiveRun: (r: { runId: string; projectCode: string; platform: "Android" | "iOS" } | null) => void }) {
  const [devices, setDevices] = useState<DeviceList | null>(null);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [platform, setPlatform] = useState<"Android" | "iOS">(activeRun?.platform ?? "Android");
  const [selectedAndroid, setSelectedAndroid] = useState<string[]>([]);
  const [selectedIos, setSelectedIos] = useState<string>("");
  const [iosTags, setIosTags] = useState("");
  const [iosFeature, setIosFeature] = useState("classpath:features/ios/ios_end2end/ios_full_e2e.feature");
  // runId is now sourced from app-level activeRun so closing/re-opening
  // the modal does NOT lose track of the in-flight run.
  const runId = activeRun?.runId ?? null;
  const setRunId = (id: string | null) => {
    if (id) setActiveRun({ runId: id, projectCode, platform });
    else setActiveRun(null);
  };
  const [logs, setLogs] = useState<string[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Son bitmiş run-ın logu — modal açılanda gedən run yoxdursa göstərilir.
  // runId set OLUNMUR, ona görə "Start" düyməsi aktiv qalır.
  const [lastRunLog, setLastRunLog] = useState<string[] | null>(null);
  const [lastRunInfo, setLastRunInfo] = useState<{ id: string; status: string; startedAt: string } | null>(null);
  const logsEndRef = React.useRef<HTMLDivElement | null>(null);

  /* Load devices on open */
  useEffect(() => {
    setLoadingDevices(true);
    fetch("/api/e2e/devices")
      .then(r => r.json())
      .then((d: DeviceList) => {
        setDevices(d);
        // Auto-select up to 2 ready Android devices for convenience.
        const auto = d.android.filter(a => a.ready).slice(0, 2).map(a => a.udid);
        setSelectedAndroid(auto);
        if (d.ios.length > 0) setSelectedIos(d.ios[0].udid);
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoadingDevices(false));
  }, []);

  /* Auto-scroll log panel as new lines arrive */
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [logs]);

  /* Close EventSource on unmount BUT keep activeRun in app state so a
     later re-open can re-attach and replay the SSE backlog. */
  useEffect(() => () => {
    if (esRef.current) { esRef.current.close(); esRef.current = null; }
  }, []);
  const esRef = React.useRef<EventSource | null>(null);

  /* On mount/re-open: if there is a persisted activeRun for this same
     project, reset the local log buffer and reconnect to the SSE — the
     backend replays its accumulated backlog first, so we don't miss
     anything emitted while the modal was closed. */
  useEffect(() => {
    if (activeRun && activeRun.projectCode === projectCode && !streaming) {
      setLogs([]);
      startStreaming(activeRun.runId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRun?.runId]);

  /* Modal hər açılanda (və platforma dəyişəndə): bu layihə+platforma üzrə
     sonuncu run-ı backend-dən çək → gedən (Running) run varsa ona canlı
     qoşul (indi nə icra olunur görünsün); yoxdursa sonuncu bitmiş run-ın
     logunu göstər. Səhifə yenilənsə və ya run başqa yerdən (məs. Telegram
     bot) başlasa belə hər zaman ən son vəziyyət görünür. */
  useEffect(() => {
    // Bu sessiyada artıq aktiv run varsa, yuxarıdakı effekt qoşulmanı idarə edir.
    if (activeRun && activeRun.projectCode === projectCode) return;
    let cancelled = false;
    (async () => {
      try {
        const runs = await fetch(`/api/e2e/runs?projectKey=${encodeURIComponent(projectCode)}&take=20`)
          .then(r => r.ok ? r.json() : []);
        if (cancelled || !Array.isArray(runs)) return;
        const forPlatform = runs.filter((r: any) => r.platform === platform);
        if (forPlatform.length === 0) { setLastRunLog(null); setLastRunInfo(null); return; }
        const running = forPlatform.find((r: any) => r.status === "Running");
        if (running) {
          // Gedən run var → canlı axına qoşul (reattach effekti stream başladır).
          setLastRunLog(null); setLastRunInfo(null);
          setLogs([]);
          setActiveRun({ runId: running.id, projectCode, platform });
        } else {
          // Gedən run yoxdur → sonuncu bitmiş run-ın logunu oxunaqlı göstər.
          const latest = forPlatform[0];
          const text = await fetch(`/api/e2e/runs/${latest.id}/log`)
            .then(r => r.ok ? r.text() : "").catch(() => "");
          if (cancelled) return;
          setLastRunInfo({ id: latest.id, status: latest.status, startedAt: latest.startedAt });
          setLastRunLog(text ? text.split("\n").filter(l => l.trim().length > 0) : []);
        }
      } catch { /* sakit keç — modal yenə də run başlatmağa imkan verir */ }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, projectCode]);

  const toggleAndroid = (udid: string) => {
    setSelectedAndroid(prev =>
      prev.includes(udid) ? prev.filter(u => u !== udid)
        : prev.length >= 2 ? [prev[1], udid] : [...prev, udid]);
  };

  const start = async (featurePath?: string) => {
    const feature = featurePath ?? prodFeaturePath;
    setError(null);
    setLogs([]);
    setLastRunLog(null);
    setLastRunInfo(null);
    try {
      let res: Response;
      if (platform === "Android") {
        if (selectedAndroid.length === 0) {
          setError("Ən azı 1 Android cihaz seçin"); return;
        }
        res = await fetch("/api/e2e/runs/android", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceUdids: selectedAndroid,
            projectKey: projectCode,
            // If a module-specific feature path is provided, the run uses it.
            ...(feature ? { prodFeaturePath: feature } : {}),
          })
        });
      } else {
        if (!selectedIos) { setError("iOS cihaz seçin"); return; }
        if (!devices?.iosPreflight.tunnelUp || !devices?.iosPreflight.wdaReachable) {
          setError(devices?.iosPreflight.hint || "iOS pre-flight (tunnel / WDA) hazır deyil");
          return;
        }
        res = await fetch("/api/e2e/runs/ios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceUdid: selectedIos,
            projectKey: projectCode,
            tags: iosTags || null,
            featureClasspath: feature ?? iosFeature ?? null
          })
        });
      }
      if (!res.ok) {
        const txt = await res.text();
        throw new Error("Start uğursuz: " + res.status + " — " + txt.slice(0, 300));
      }
      const run = await res.json();
      setRunId(run.id);
      startStreaming(run.id);
    } catch (e: any) {
      setError(e.message || String(e));
    }
  };

  const startStreaming = (id: string) => {
    setStreaming(true);
    const token = auth.getToken();
    // EventSource doesn't support custom headers natively; pass token as query.
    // Backend currently requires Bearer — for SSE we let the global fetch
    // interceptor add it via withCredentials trick OR adjust controller to
    // also accept ?token=. Simplest for now: open without auth and rely on
    // the dev cookie / CORS. (Production: add ?access_token= query support.)
    const url = "/api/e2e/runs/" + id + "/stream" + (token ? "?access_token=" + encodeURIComponent(token) : "");
    const es = new EventSource(url);
    esRef.current = es;
    es.onmessage = (ev) => {
      setLogs(prev => [...prev, ev.data]);
    };
    es.onerror = () => {
      // EventSource auto-reconnects; close on terminal state.
      es.close();
      esRef.current = null;
      setStreaming(false);
    };
  };

  const stop = async () => {
    if (!runId) return;
    await fetch("/api/e2e/runs/" + runId + "/stop", { method: "POST" });
    esRef.current?.close();
    esRef.current = null;
    setStreaming(false);
  };

  const canStart = !runId && !loadingDevices;

  // Log sətirinin rəngləməsi — həm canlı, həm son-run panelində istifadə olunur.
  const logLineClass = (l: string) => cn(
    l.startsWith("❌") || l.includes("FAIL") || l.includes("error") ? "text-rose-400" :
    l.startsWith("✅") || l.includes("PASS") || l.includes("BUILD SUCCESS") ? "text-emerald-400" :
    l.startsWith("📺") ? "text-sky-300" :
    l.startsWith("📱") || l.startsWith("🍏") || l.startsWith("[PRE]") || l.startsWith("[DEV]") || l.startsWith("[PROD]") ? "text-pink-300 font-bold" :
    "text-white/80"
  );

  return (
    <Modal isOpen={true} onClose={() => { esRef.current?.close(); onClose(); }} title={`Launch — ${projectTitle}`}>
      <div className="space-y-5 max-w-3xl mx-auto">
        {/* Platform tabs */}
        <div className="flex gap-2">
          {(["Android", "iOS"] as const).map(p => (
            <button key={p} onClick={() => setPlatform(p)} disabled={!!runId}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                platform === p
                  ? "bg-pink-deep text-white shadow-[0_3px_10px_rgba(224,83,112,0.25)]"
                  : "bg-black/[0.03] text-black/60 hover:bg-black/[0.06]"
              )}>{p}</button>
          ))}
        </div>

        {loadingDevices ? (
          <div className="text-center py-10 text-black/50 text-sm">
            <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" />Cihazlar yüklənir...
          </div>
        ) : platform === "Android" ? (
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-black/45 uppercase tracking-wider">
              Android cihazlar (1-2 seçin)
            </label>
            {/* Plan göstəricisi — Telegram bot pattern-inə uyğun */}
            {selectedAndroid.length === 2 ? (
              <div className="text-[11px] bg-pink-soft/40 border border-pink-light/60 text-pink-deep p-3 rounded-lg space-y-1">
                <div className="font-bold">🔀 Multi-device paralel plan:</div>
                <div>📱 <b>Cihaz 1</b> ({selectedAndroid[0]}): <b>PRE → DEV</b> (ardıcıl)</div>
                <div>📱 <b>Cihaz 2</b> ({selectedAndroid[1]}): <b>PROD</b> (paralel)</div>
              </div>
            ) : selectedAndroid.length === 1 ? (
              <div className="text-[11px] bg-amber-100/60 border border-amber-300/60 text-amber-900 p-3 rounded-lg">
                ⚠️ Yalnız 1 cihaz seçildi — <b>PROD atlanacaq</b>. Cihaz 1: PRE → DEV (paralel run üçün 2 cihaz seçin)
              </div>
            ) : (
              <div className="text-[11px] bg-rose-100/60 border border-rose-300/60 text-rose-800 p-3 rounded-lg">
                ⚠️ Cihaz seçin
              </div>
            )}
            {devices?.android.length === 0 && (
              <div className="text-xs text-black/50 italic">Qoşulu Android cihaz yoxdur (adb devices boşdur)</div>
            )}
            {devices?.android.map(d => (
              <label key={d.udid} className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                selectedAndroid.includes(d.udid) ? "bg-pink-soft/30 border-[#E05370]" : "bg-black/[0.02] border-black/[0.04] hover:border-black/15"
              )}>
                <input type="checkbox" checked={selectedAndroid.includes(d.udid)} onChange={() => toggleAndroid(d.udid)} disabled={!d.ready || !!runId} />
                <div className="flex-1 text-sm">
                  <div className="font-bold text-black/85">{d.model} <span className="text-[10px] font-mono text-black/45 ml-2">{d.udid}</span></div>
                  <div className="text-[10px] text-black/45">Android {d.androidVersion} • {d.ready ? "✅ hazır" : "❌ " + d.ready}</div>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-black/45 uppercase tracking-wider">iOS cihaz</label>
            {devices?.ios.length === 0 && (
              <div className="text-xs text-black/50 italic">Qoşulu iOS cihaz yoxdur</div>
            )}
            {devices?.ios.map(d => (
              <label key={d.udid} className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                selectedIos === d.udid ? "bg-pink-soft/30 border-[#E05370]" : "bg-black/[0.02] border-black/[0.04]"
              )}>
                <input type="radio" name="iosdev" checked={selectedIos === d.udid} onChange={() => setSelectedIos(d.udid)} disabled={!!runId} />
                <div className="flex-1 text-sm">
                  <div className="font-bold text-black/85">{d.name} <span className="text-[10px] font-mono text-black/45 ml-2">{d.udid}</span></div>
                  <div className="text-[10px] text-black/45">iOS {d.osVersion}</div>
                </div>
              </label>
            ))}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-[10px] font-bold text-black/45 uppercase tracking-wider">Tunnel</label>
                <div className={cn("mt-1 p-2 rounded-lg text-xs font-bold", devices?.iosPreflight.tunnelUp ? "bg-emerald-500/10 text-emerald-700" : "bg-rose-500/10 text-rose-700")}>
                  {devices?.iosPreflight.tunnelUp ? "✅ Açıqdır" : "❌ Bağlıdır"}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-black/45 uppercase tracking-wider">WDA (8100)</label>
                <div className={cn("mt-1 p-2 rounded-lg text-xs font-bold", devices?.iosPreflight.wdaReachable ? "bg-emerald-500/10 text-emerald-700" : "bg-rose-500/10 text-rose-700")}>
                  {devices?.iosPreflight.wdaReachable ? "✅ Cavab verir" : "❌ Çatılmaz"}
                </div>
              </div>
            </div>
            {devices?.iosPreflight.hint && (
              <div className="text-[11px] text-rose-700 bg-rose-500/5 p-3 rounded-lg border border-rose-500/20">
                {devices.iosPreflight.hint}
              </div>
            )}
            <div className="grid grid-cols-1 gap-2">
              <input type="text" placeholder="Tags (e.g. @smoke or @regression) — leave empty for the whole feature"
                value={iosTags} onChange={e => setIosTags(e.target.value)} disabled={!!runId}
                className="w-full bg-black/[0.02] border border-black/10 rounded-xl py-2 px-3 text-xs font-mono"/>
              <input type="text" placeholder="Feature classpath"
                value={iosFeature} onChange={e => setIosFeature(e.target.value)} disabled={!!runId}
                className="w-full bg-black/[0.02] border border-black/10 rounded-xl py-2 px-3 text-xs font-mono"/>
            </div>
          </div>
        )}

        {error && <div className="text-[11px] text-rose-700 bg-rose-500/5 p-3 rounded-lg border border-rose-500/20">⚠️ {error}</div>}

        {/* Live log panel — appears once run starts */}
        {runId && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-black/45 uppercase tracking-wider">
                Canlı log {streaming ? "🔴" : "⏹"} <span className="ml-1 font-mono text-black/30">{runId.slice(0,8)}</span>
              </label>
              {streaming && (
                <button onClick={stop} className="text-[10px] font-bold bg-rose-500 text-white px-3 py-1.5 rounded-lg hover:bg-rose-600 transition-all">
                  ⏹ Stop
                </button>
              )}
            </div>
            <div className="bg-[#111] text-emerald-300 font-mono text-[11px] p-4 rounded-xl border border-black/10 h-80 overflow-y-auto leading-relaxed">
              {logs.length === 0 && <div className="text-white/40 italic">Log gözlənilir...</div>}
              {logs.map((l, i) => (
                <div key={i} className={logLineClass(l)}>{l}</div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}

        {/* Son run paneli — gedən run yoxdursa, sonuncu run-ın logu (oxunaqlı).
            Start düyməsi aktiv qalır; yeni run başlananda bu panel canlıya keçir. */}
        {!runId && lastRunInfo && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-black/45 uppercase tracking-wider">
                Son run · {lastRunInfo.status}
                <span className="ml-1 font-mono text-black/30">{lastRunInfo.id.slice(0, 8)}</span>
                <span className="ml-2 font-normal normal-case text-black/35">
                  {new Date(lastRunInfo.startedAt).toLocaleString()}
                </span>
              </label>
            </div>
            <div className="bg-[#111] text-emerald-300 font-mono text-[11px] p-4 rounded-xl border border-black/10 h-80 overflow-y-auto leading-relaxed">
              {(!lastRunLog || lastRunLog.length === 0) && <div className="text-white/40 italic">Bu run üçün log tapılmadı</div>}
              {lastRunLog?.map((l, i) => (
                <div key={i} className={logLineClass(l)}>{l}</div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-3">
          <button onClick={() => { esRef.current?.close(); onClose(); }}
            className="flex-1 py-3 text-black/55 font-bold uppercase tracking-wider hover:bg-black/[0.03] rounded-xl text-[10px]">
            {runId ? "Bağla" : "Abort"}
          </button>
          {canStart && (
            <button onClick={() => start()}
              className="flex-[1.5] py-3 bg-pink-deep hover:bg-[#D04260] text-white rounded-xl font-bold uppercase tracking-wider text-[10px] shadow-[0_4px_14px_rgba(224,83,112,0.25)] active:scale-95">
              ▶ Start E2E ({platform})
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * E2E Run Detail Modal
 *  • Status badge + meta (cihaz, platform, müddət)
 *  • Running → canlı SSE log (qara konsol)
 *  • Finished → tam log + artifact tab (video / screenshots)
 *  • Success → video player (Allure attachment)
 *  • Failed  → screenshot grid + log
 * ────────────────────────────────────────────────────────────────────── */
interface E2ERunDetail {
  id: string; projectKey: string;
  platform: number | string;
  status: number | string;
  deviceUdids: string;
  command: string;
  startedAt: string;
  endedAt: string | null;
}
interface ArtifactItem { fileName: string; kind: "video" | "image"; sizeBytes: number; modifiedUtc: string; }

function E2ERunDetailModal({ runId, onClose }: { runId: string; onClose: () => void }) {
  const [run, setRun] = useState<E2ERunDetail | null>(null);
  const [artifacts, setArtifacts] = useState<ArtifactItem[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [tab, setTab] = useState<"log" | "video" | "screenshots">("log");
  const esRef = React.useRef<EventSource | null>(null);
  const logsEndRef = React.useRef<HTMLDivElement | null>(null);

  /* Load run record + artifacts; start SSE if still running */
  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await fetch(`/api/e2e/runs/${runId}`).then(x => x.ok ? x.json() : null);
      if (!alive || !r) return;
      setRun(r);
      const isRunning = r.status === 1 || r.status === "Running";
      if (isRunning) {
        // Pre-fill from persisted log first so user sees history while
        // SSE re-streams the in-memory backlog + new events.
        const text = await fetch(`/api/e2e/runs/${runId}/log`).then(x => x.ok ? x.text() : "").catch(() => "");
        if (text) setLogs(text.split('\n').filter(Boolean));
        startStreaming();
      } else {
        // Finished run — single deterministic GET.
        const text = await fetch(`/api/e2e/runs/${runId}/log`).then(x => x.ok ? x.text() : "").catch(() => "");
        setLogs(text.split('\n').filter(Boolean));
      }
      const a = await fetch(`/api/e2e/runs/${runId}/artifacts`).then(x => x.ok ? x.json() : null).catch(() => null);
      if (alive && a?.items) {
        setArtifacts(a.items);
        // Auto-select most likely tab based on outcome.
        const isSuccess = r.status === 2 || r.status === "Success";
        const isFailed = r.status === 3 || r.status === "Failed";
        if (isSuccess && a.items.some((i: ArtifactItem) => i.kind === "video")) setTab("video");
        else if (isFailed && a.items.some((i: ArtifactItem) => i.kind === "image")) setTab("screenshots");
      }
    })();
    return () => {
      alive = false;
      esRef.current?.close();
      esRef.current = null;
    };
  }, [runId]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [logs]);

  const startStreaming = () => {
    setStreaming(true);
    const token = auth.getToken();
    const url = `/api/e2e/runs/${runId}/stream${token ? "?access_token=" + encodeURIComponent(token) : ""}`;
    const es = new EventSource(url);
    esRef.current = es;
    es.onmessage = (ev) => setLogs(prev => [...prev, ev.data]);
    es.onerror = () => { es.close(); esRef.current = null; setStreaming(false); };
  };

  const statusLabel = (s: any) =>
    typeof s === "number" ? ["pending", "running", "success", "failed", "stopped"][s] ?? String(s) : String(s).toLowerCase();
  const status = run ? statusLabel(run.status) : "—";
  const isRunning = status === "running";
  const isSuccess = status === "success";
  const isFailed = status === "failed";

  const videos = artifacts.filter(a => a.kind === "video");
  const screenshots = artifacts.filter(a => a.kind === "image");

  const platformLabel = run
    ? (run.platform === 0 || run.platform === "Android" ? "Android" : "iOS")
    : "?";

  return (
    <Modal isOpen={true} onClose={() => { esRef.current?.close(); onClose(); }} title="Run Details">
      <div className="space-y-5 max-w-4xl mx-auto">
        {/* Header card */}
        {run && (
          <div className="bg-white border border-black/[0.05] rounded-2xl p-5 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border",
                  isRunning ? "bg-blue-500/10 text-blue-700 border-blue-500/30 animate-pulse" :
                  isSuccess ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" :
                  isFailed  ? "bg-rose-500/10 text-rose-700 border-rose-500/30" :
                              "bg-slate-500/10 text-slate-700 border-slate-500/30"
                )}>
                  {isRunning && "🔴 "} {status}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest bg-pink-soft text-pink-deep px-2 py-1 rounded-md border border-pink-light/40">
                  {platformLabel}
                </span>
                <span className="text-[10px] font-mono text-black/40">{runId.slice(0, 8)}</span>
              </div>
              <div className="text-[11px] font-mono text-black/60 break-all">
                📱 {run.deviceUdids}
              </div>
              <div className="text-[10px] text-black/40 mt-1">
                {new Date(run.startedAt).toLocaleString()} {run.endedAt && `→ ${fmtDur((+new Date(run.endedAt) - +new Date(run.startedAt)) / 1000)}`}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-black/[0.06] gap-4">
          {([
            { id: "log",         label: `📜 Log (${logs.length})` },
            { id: "video",       label: `🎬 Video (${videos.length})`,       disabled: videos.length === 0 },
            { id: "screenshots", label: `🖼  Screenshot (${screenshots.length})`, disabled: screenshots.length === 0 },
          ] as const).map(t => (
            <button key={t.id} disabled={(t as any).disabled}
              onClick={() => setTab(t.id as any)}
              className={cn(
                "pb-3 font-bold text-xs uppercase tracking-wider transition-colors relative",
                tab === t.id ? "text-pink-deep" : "text-black/40 hover:text-black/60",
                (t as any).disabled && "opacity-30 cursor-not-allowed"
              )}>
              {t.label}
              {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-deep" />}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "log" && (
          <div className="bg-[#111] text-emerald-300 font-mono text-[11px] p-4 rounded-xl border border-black/10 h-96 overflow-y-auto leading-relaxed">
            {logs.length === 0 && <div className="text-white/40 italic">{isRunning ? "Gözlənilir..." : "Log boşdur"}</div>}
            {logs.map((l, i) => (
              <div key={i} className={cn(
                l.startsWith("❌") || l.includes("FAIL") || l.includes("error") || l.includes("Error") ? "text-rose-400" :
                l.startsWith("✅") || l.includes("PASS") || l.includes("BUILD SUCCESS") ? "text-emerald-400" :
                l.startsWith("[PRE]") || l.startsWith("[DEV]") || l.startsWith("[PROD]") || l.startsWith("📱") || l.startsWith("🍏") ? "text-pink-300 font-bold" :
                l.startsWith("⚠️") || l.includes("WARN") ? "text-amber-400" :
                "text-white/80"
              )}>{l}</div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}

        {tab === "video" && (
          <div className="space-y-4">
            {videos.length === 0 ? (
              <div className="text-center py-10 text-black/40 italic">Video yoxdur</div>
            ) : videos.slice(0, 3).map(v => (
              <div key={v.fileName} className="bg-black/[0.02] rounded-xl border border-black/[0.05] overflow-hidden">
                <video controls className="w-full max-h-[480px] bg-black"
                       src={`/api/e2e/runs/${runId}/artifacts/${encodeURIComponent(v.fileName)}`} />
                <div className="px-3 py-2 text-[10px] font-mono text-black/40 flex items-center justify-between">
                  <span>{v.fileName}</span>
                  <span>{(v.sizeBytes / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "screenshots" && (
          <div className="grid grid-cols-2 gap-3">
            {screenshots.length === 0 ? (
              <div className="col-span-2 text-center py-10 text-black/40 italic">Screenshot yoxdur</div>
            ) : screenshots.slice(0, 30).map(s => (
              <a key={s.fileName} href={`/api/e2e/runs/${runId}/artifacts/${encodeURIComponent(s.fileName)}`}
                 target="_blank" rel="noopener noreferrer"
                 className="block bg-black/[0.02] rounded-xl border border-black/[0.05] overflow-hidden hover:border-pink-deep transition-all">
                <img src={`/api/e2e/runs/${runId}/artifacts/${encodeURIComponent(s.fileName)}`}
                     alt={s.fileName} className="w-full h-44 object-contain bg-black/5" />
                <div className="px-2 py-1 text-[9px] font-mono text-black/40 truncate">{s.fileName}</div>
              </a>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={() => { esRef.current?.close(); onClose(); }}
            className="py-2 px-6 text-black/55 font-bold uppercase tracking-wider hover:bg-black/[0.03] rounded-xl text-[10px]">
            Bağla {streaming && "(canlı stream dayanır)"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Project Runs Modal — opened from the project card's 3-dot menu.
 * Lists recent E2E runs for the project with status, duration, devices,
 * platform. Auto-refreshes every 4s. Clicking a row opens E2ERunDetailModal.
 * ────────────────────────────────────────────────────────────────────── */
function ProjectRunsModal({ projectKey, projectTitle, onClose }:
    { projectKey: string; projectTitle: string; onClose: () => void }) {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch(`/api/e2e/runs?projectKey=${encodeURIComponent(projectKey)}&take=50`);
        const list = r.ok ? await r.json() : [];
        if (alive) setRuns(Array.isArray(list) ? list : []);
      } finally { if (alive) setLoading(false); }
    };
    load();
    const t = setInterval(load, 4000);
    return () => { alive = false; clearInterval(t); };
  }, [projectKey]);

  const statusLabel = (s: any) =>
    typeof s === "number" ? ["pending", "running", "success", "failed", "stopped"][s] ?? String(s) : String(s).toLowerCase();

  return (
    <>
      <Modal isOpen={true} onClose={onClose} title={`Run History — ${projectTitle}`}>
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#1C1C1C] uppercase tracking-tight">Recent E2E Runs</h3>
              <p className="text-[10px] text-black/45 font-bold uppercase tracking-wider mt-1">
                Auto-refresh hər 4 saniyə • {runs.length} run
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-black/45 text-sm">
              <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" /> Yüklənir...
            </div>
          ) : runs.length === 0 ? (
            <div className="text-center py-20 bg-black/[0.02] rounded-2xl border border-dashed border-black/10">
              <p className="text-black/40 font-bold uppercase tracking-wider italic text-sm">Bu layihə üçün heç bir run yoxdur</p>
              <p className="text-[10px] text-black/30 mt-1">Project kartında <b>Launch Suite</b> ilə yeni run başlat</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden max-h-[60vh] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white border-b border-black/[0.04]">
                  <tr>
                    <th className="py-3 px-4 text-[10px] font-bold text-black/45 uppercase tracking-wider">Platform</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-black/45 uppercase tracking-wider">Cihazlar</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-black/45 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-black/45 uppercase tracking-wider">Müddət</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-black/45 uppercase tracking-wider">Vaxt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.02]">
                  {runs.map((r: any) => {
                    const st = statusLabel(r.status);
                    const platform = (r.platform === 0 || r.platform === "Android") ? "Android" : "iOS";
                    return (
                      <tr key={r.id} className="hover:bg-pink-soft/15 transition-colors cursor-pointer"
                          onClick={() => setSelectedRunId(r.id)}>
                        <td className="py-3 px-4 text-xs font-bold">{platform === "Android" ? "🤖 Android" : "🍏 iOS"}</td>
                        <td className="py-3 px-4 text-[10px] font-mono text-black/60 truncate max-w-[200px]">{r.deviceUdids}</td>
                        <td className="py-3 px-4"><StatusBadge status={st as any} /></td>
                        <td className="py-3 px-4 text-xs font-mono text-black/45">
                          {r.endedAt ? fmtDur((+new Date(r.endedAt) - +new Date(r.startedAt)) / 1000) : "—"}
                        </td>
                        <td className="py-3 px-4 text-[10px] font-mono text-black/40">
                          {new Date(r.startedAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button onClick={onClose}
              className="py-2 px-6 text-black/55 font-bold uppercase tracking-wider hover:bg-black/[0.03] rounded-xl text-[10px]">
              Bağla
            </button>
          </div>
        </div>
      </Modal>
      {selectedRunId && (
        <E2ERunDetailModal runId={selectedRunId} onClose={() => setSelectedRunId(null)} />
      )}
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Scenario Detail Page (full-page, replaces the in-modal detail view)
 *  Tag header + status badge + meta
 *  3 columns / sections:
 *    🎬 Video (if success or available)
 *    🖼 Screenshots (failure evidence)
 *    📜 Log — filtered to lines from this scenario's range (and full log toggle)
 * ────────────────────────────────────────────────────────────────────── */
function ScenarioDetailPage({ runId, tag, name, onBack }:
    { runId: string; tag: string; name: string; onBack: () => void }) {
  const [run, setRun] = useState<E2ERunDetail | null>(null);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [artifacts, setArtifacts] = useState<ArtifactItem[]>([]);
  const [allLogs, setAllLogs] = useState<string[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [showFull, setShowFull] = useState(false);
  /** Currently-focused scenario inside this run. null = use tag/name props
   *  (entry from outside). When user clicks a sibling scenario in the
   *  sidebar, we just shift focus locally — page stays mounted, log
   *  slice changes, allure-style. */
  const [focusedOrder, setFocusedOrder] = useState<number | null>(null);
  const esRef = React.useRef<EventSource | null>(null);
  const logsEndRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;
    let pollTimer: any = null;

    const loadAll = async () => {
      // Artefaktları artıq burada yox, ayrı useEffect-də (scenario name-i
      // dəyişdikcə) yükləyirik. Bu loop yalnız run/scenarios/log üçündür.
      const [r, sc, logText] = await Promise.all([
        fetch(`/api/e2e/runs/${runId}`).then(x => x.ok ? x.json() : null).catch(() => null),
        fetch(`/api/e2e/runs/${runId}/scenarios`).then(x => x.ok ? x.json() : null).catch(() => null),
        fetch(`/api/e2e/runs/${runId}/log`).then(x => x.ok ? x.text() : "").catch(() => ""),
      ]);
      if (!alive) return;
      setRun(r);
      setScenarios(sc?.items ?? []);
      setAllLogs(logText.split('\n').filter(Boolean));
      return r;
    };

    (async () => {
      const r = await loadAll();
      const isRunning = r && (r.status === 1 || r.status === "Running");
      // For running runs poll every 2s — SSE through http-proxy-middleware
      // is unreliable (buffering / encoding), polling /log gives a stable
      // live view that matches the backend's persisted backlog exactly.
      if (isRunning) {
        setStreaming(true);
        pollTimer = setInterval(async () => {
          const rr = await loadAll();
          const stillRunning = rr && (rr.status === 1 || rr.status === "Running");
          if (!stillRunning && pollTimer) { clearInterval(pollTimer); setStreaming(false); }
        }, 2000);
      }
    })();
    return () => {
      alive = false;
      if (pollTimer) clearInterval(pollTimer);
      esRef.current?.close();
      esRef.current = null;
    };
  }, [runId]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [allLogs]);

  // Locate this scenario inside the parsed list to compute log slice.
  // focusedOrder (sidebar click) wins over the original tag/name props.
  const me = focusedOrder !== null
    ? scenarios.find(s => s.order === focusedOrder)
    : scenarios.find(s =>
        (tag && s.tags?.includes(tag)) || (name && s.name === name));

  // Per-scenario artefakt yüklənməsi. me dəyişəndə (sidebar klik / start)
  // artefaktlar həmin scenario-ya görə filterlənir. me yoxdursa (full run
  // baxışı) bütün run-ın artefaktları gəlir (köhnə davranış).
  useEffect(() => {
    let alive = true;
    const load = async () => {
      const url = me?.name
        ? `/api/e2e/runs/${runId}/artifacts?scenarioName=${encodeURIComponent(me.name)}`
        : `/api/e2e/runs/${runId}/artifacts`;
      const a = await fetch(url).then(x => x.ok ? x.json() : null).catch(() => null);
      if (!alive) return;
      setArtifacts(a?.items ?? []);
    };
    load();
    // Hələ run davam edirsə artefaktlar genişlənə bilər → 3s-dən bir poll
    let timer: any = null;
    if (run && (run.status === 1 || run.status === "Running")) {
      timer = setInterval(load, 3000);
    }
    return () => {
      alive = false;
      if (timer) clearInterval(timer);
    };
  }, [runId, me?.name, run?.status]);

  const startStreaming = () => {
    setStreaming(true);
    const token = auth.getToken();
    const url = `/api/e2e/runs/${runId}/stream${token ? "?access_token=" + encodeURIComponent(token) : ""}`;
    const es = new EventSource(url);
    esRef.current = es;
    es.onmessage = (ev) => setAllLogs(prev => [...prev, ev.data]);
    es.onerror = () => { es.close(); esRef.current = null; setStreaming(false); };
  };

  const nextScenario = scenarios.find(s => s.order === (me?.order ?? 0) + 1);
  const logFrom = me?.logLineFrom ?? 0;
  const logTo = nextScenario?.logLineFrom ?? allLogs.length;
  const scenarioLogs = showFull ? allLogs : allLogs.slice(logFrom, logTo);

  const statusLabel = (s: any) =>
    typeof s === "number" ? ["pending", "running", "passed", "failed", "stopped"][s] ?? String(s) : String(s).toLowerCase();
  const status = me ? me.status : (run ? statusLabel(run.status) : "—");
  const isRunning = status === "running";
  const isSuccess = status === "passed" || status === "success";
  const isFailed = status === "failed";

  const videos = artifacts.filter(a => a.kind === "video");
  const screenshots = artifacts.filter(a => a.kind === "image");
  const platform = run ? ((run.platform === 0 || run.platform === "Android") ? "Android" : "iOS") : "?";

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar bg-[#F7F9FB]">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-black/[0.04] shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <button onClick={onBack}
              className="p-2.5 bg-white border border-black/[0.06] hover:bg-black/[0.02] text-pink-deep rounded-xl transition-all cursor-pointer shadow-sm">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {(me?.tags ?? [tag].filter(Boolean)).map((t: string) => (
                  <span key={t} className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border bg-black/[0.03] text-black/55 border-black/10">{t}</span>
                ))}
                <span className="text-[10px] font-black uppercase tracking-widest bg-black/[0.04] text-black/55 px-2 py-1 rounded-md">{platform}</span>
              </div>
              <h2 className="text-xl font-extrabold text-[#1C1C1C] tracking-tight uppercase break-words">
                {me?.name || name || tag || `${platform} E2E Run — Full View`}
              </h2>
              {me?.featureFile && (
                <p className="text-[10px] font-mono text-black/45 mt-1 break-all">{me.featureFile}</p>
              )}
            </div>
          </div>
          <StatusBadge status={status as any} />
        </div>
        {run && (
          <div className="mt-4 pt-4 border-t border-black/[0.04] flex flex-wrap items-center gap-4 text-[10px] text-black/55 font-mono">
            <span>📱 {run.deviceUdids}</span>
            <span>•</span>
            <span>{new Date(run.startedAt).toLocaleString()}</span>
            {run.endedAt && (
              <>
                <span>•</span>
                <span>{fmtDur((+new Date(run.endedAt) - +new Date(run.startedAt)) / 1000)}</span>
              </>
            )}
            {isRunning && (
              <>
                <span>•</span>
                <span className="text-pink-deep font-bold animate-pulse">🔴 CANLI</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
        {/* Left column — video + screenshots */}
        <div className="lg:col-span-1 space-y-6">
          {/* Video — shown on success AND failure (failures benefit from
              replay just as much, often more than success). Skipped while
              still running and no video produced yet. */}
          {videos.length > 0 && (
            <div className={cn(
              "bg-white rounded-2xl overflow-hidden shadow-sm border",
              isSuccess ? "border-emerald-500/30" : isFailed ? "border-rose-500/30" : "border-black/[0.05]"
            )}>
              <div className={cn(
                "px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center justify-between",
                isSuccess ? "bg-emerald-500/10 text-emerald-700"
                : isFailed ? "bg-rose-500/10 text-rose-700"
                           : "bg-black/[0.03] text-black/55"
              )}>
                <span>🎬 Video Recording {isFailed && "— Failure Replay"}</span>
                <span className="text-[9px] opacity-70">{videos.length} fayl</span>
              </div>
              <video controls className="w-full max-h-[320px] bg-black"
                     src={`/api/e2e/runs/${runId}/artifacts/${encodeURIComponent(videos[0].fileName)}`} />
              <div className="px-3 py-2 text-[9px] font-mono text-black/45 flex justify-between">
                <span className="truncate">{videos[0].fileName}</span>
                <span>{(videos[0].sizeBytes / 1024 / 1024).toFixed(1)} MB</span>
              </div>
              {/* Show additional video files (if any) as a quick list */}
              {videos.length > 1 && (
                <div className="px-3 pb-3 space-y-1 border-t border-black/[0.04] pt-2">
                  {videos.slice(1, 5).map(v => (
                    <a key={v.fileName} target="_blank" rel="noopener noreferrer"
                       href={`/api/e2e/runs/${runId}/artifacts/${encodeURIComponent(v.fileName)}`}
                       className="block text-[9px] font-mono text-pink-deep hover:underline truncate">
                      🎬 {v.fileName} <span className="text-black/35">({(v.sizeBytes / 1024 / 1024).toFixed(1)} MB)</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Screenshots — primarily for failures, but also shown for
              success runs when artifacts exist (some scenarios screenshot
              positive states for verification). */}
          {screenshots.length > 0 && (
            <div className={cn(
              "bg-white rounded-2xl overflow-hidden shadow-sm border",
              isFailed ? "border-rose-500/30" : "border-black/[0.05]"
            )}>
              <div className={cn(
                "px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center justify-between",
                isFailed ? "bg-rose-500/10 text-rose-700" : "bg-black/[0.03] text-black/55"
              )}>
                <span>🖼 {isFailed ? "Failure Screenshots" : "Screenshots"}</span>
                <span className="text-[9px] opacity-70">{screenshots.length} kadr</span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3">
                {screenshots.slice(0, 6).map(s => (
                  <a key={s.fileName} target="_blank" rel="noopener noreferrer"
                     href={`/api/e2e/runs/${runId}/artifacts/${encodeURIComponent(s.fileName)}`}
                     className={cn(
                       "block bg-black/[0.02] rounded-lg overflow-hidden border transition-all",
                       isFailed ? "border-black/[0.06] hover:border-rose-500"
                                : "border-black/[0.06] hover:border-pink-deep"
                     )}>
                    <img src={`/api/e2e/runs/${runId}/artifacts/${encodeURIComponent(s.fileName)}`}
                         alt={s.fileName} className="w-full h-28 object-cover" />
                  </a>
                ))}
              </div>
              {screenshots.length > 6 && (
                <div className="px-3 pb-3 text-[9px] text-black/40 font-mono">+ {screenshots.length - 6} əlavə screenshot</div>
              )}
            </div>
          )}

          {/* Empty-state — no artifacts at all (still running early-stage) */}
          {videos.length === 0 && screenshots.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-black/10 p-6 text-center">
              <p className="text-[10px] text-black/40 font-bold uppercase tracking-wider">
                {isRunning ? "Hələ artifact yaranmayıb — run davam edir" : "Video / screenshot yoxdur"}
              </p>
            </div>
          )}

        </div>

        {/* Right column — log */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-black/[0.05] overflow-hidden shadow-sm flex flex-col h-[55vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.05]">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1C1C1C]">
                  📜 Log {streaming && <span className="text-pink-deep">🔴</span>}
                </span>
                <span className="text-[9px] font-mono text-black/40">
                  {showFull ? "full" : `lines ${logFrom + 1} – ${logTo}`} / {allLogs.length}
                </span>
              </div>
              <button onClick={() => setShowFull(s => !s)}
                className="text-[10px] font-bold uppercase tracking-wider bg-black/[0.03] hover:bg-black/[0.06] px-3 py-1 rounded-lg transition-all">
                {showFull ? "Scenario-yə yığış" : "Bütün log"}
              </button>
            </div>
            <div className="bg-[#111] text-emerald-300 font-mono text-[11px] p-4 overflow-y-auto leading-relaxed flex-1">
              {scenarioLogs.length === 0 && <div className="text-white/40 italic">Log boşdur</div>}
              {scenarioLogs.map((l, i) => (
                <div key={i} className={cn(
                  l.startsWith("❌") || l.includes("FAIL") || /\berror\b/i.test(l) || l.includes("Exception") ? "text-rose-400" :
                  l.startsWith("✅") || l.includes("PASS") || l.includes("BUILD SUCCESS") ? "text-emerald-400" :
                  l.startsWith("[PRE]") || l.startsWith("[DEV]") || l.startsWith("[PROD]") || l.startsWith("📱") || l.startsWith("🍏") ? "text-pink-300 font-bold" :
                  l.startsWith("⚠️") || l.includes("WARN") ? "text-amber-400" :
                  l.startsWith("Scenario") || l.startsWith("@") ? "text-cyan-300" :
                  l.match(/^\s*(Given|When|Then|And)\b/) ? "text-blue-300" :
                  "text-white/70"
                )}>{l}</div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Scenarios in this run — full-width horizontal card grid at the bottom.
          Spans the page left→right so the run reads as a single wide board
          instead of a cramped sidebar. Click a card → focus that scenario. */}
      <div className="bg-white rounded-2xl border border-black/[0.05] overflow-hidden shadow-sm shrink-0">
          <div className="bg-black/[0.02] text-black/55 px-5 py-3 text-[11px] font-black uppercase tracking-widest flex items-center justify-between">
            <span>Bu Run-da Bütün Scenari ({scenarios.length})</span>
            {focusedOrder !== null && (
              <button onClick={() => setFocusedOrder(null)}
                className="text-pink-deep hover:underline text-[9px] font-bold normal-case tracking-normal">
                ← İlkin görünüş
              </button>
            )}
          </div>
          {scenarios.length >= 1 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-4">
            {scenarios.map(s => {
              const isMe = s.order === me?.order;
              const refTag = s.tags?.[0];
              return (
                <button key={s.order} type="button"
                  onClick={() => setFocusedOrder(s.order)}
                  className={cn(
                    "text-left p-3.5 rounded-xl border transition-all cursor-pointer h-full flex flex-col gap-2",
                    isMe
                      ? "bg-pink-soft/50 border-pink-deep shadow-sm"
                      : "bg-white hover:bg-pink-soft/15 border-black/[0.06] hover:border-pink-light hover:shadow-sm"
                  )}>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={s.status as any} />
                    <span className="text-[9px] font-mono text-black/35 ml-auto">#{s.order}</span>
                  </div>
                  {refTag && (
                    <span className="self-start text-[8px] font-black uppercase tracking-widest bg-pink-soft text-pink-deep px-1.5 py-0.5 rounded">{refTag}</span>
                  )}
                  <div className="text-[11px] font-semibold text-black/75 leading-snug" title={s.name}>
                    {s.name}
                  </div>
                </button>
              );
            })}
          </div>
          ) : (
            <div className="px-5 py-8 text-center text-[11px] text-black/40 font-bold uppercase tracking-wider">
              {isRunning ? "Scenari-lər yüklənir — run davam edir..." : "Bu run üçün scenari tapılmadı (log parse olunmadı)"}
            </div>
          )}
        </div>
    </div>
  );
}
