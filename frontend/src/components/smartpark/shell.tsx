import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  SquareParking,
  CarFront,
  ListOrdered,
  History,
  Undo2,
  ChartNoAxesCombined,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  Search,
  Bell,
  ChevronDown,
  ShieldCheck,
  CircleHelp,
  X,
  ArrowUpRight,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useParking } from "@/features/parking/store";
import { ParkingDialogs } from "./dialogs";
import { formatTime, normalizeRegistration } from "@/features/parking/service";
import { StatusBadge } from "./common";
const links = [
  { to: "/", name: "Dashboard", icon: LayoutDashboard },
  { to: "/parking-slots", name: "Parking Slots", icon: SquareParking },
  { to: "/vehicles", name: "Vehicle Management", icon: CarFront },
  { to: "/waiting-queue", name: "Waiting Queue", icon: ListOrdered },
  { to: "/history", name: "Parking History", icon: History },
  { to: "/undo", name: "Undo Activity", icon: Undo2 },
  { to: "/analytics", name: "Analytics", icon: ChartNoAxesCombined },
  { to: "/settings", name: "Settings", icon: Settings },
] as const;
export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const current = links.find((l) => l.to === path)?.name ?? "SmartPark";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notifications, setNotifications] = useState(false);
  const [about, setAbout] = useState(false);
  const {
    state: { data },
    open,
    ready,
  } = useParking();
  const results = query.trim()
    ? data.vehicles
        .filter((v) => normalizeRegistration(v.registration).includes(normalizeRegistration(query)))
        .slice(0, 5)
    : [];
  return (
    <div className={`app-shell ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      {mobileOpen && <div className="mobile-shade" onClick={() => setMobileOpen(false)} />}
      <aside className="sidebar">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <SquareParking strokeWidth={2.2} />
          </span>
          <span className="brand-name">
            SmartPark<span className="text-primary">.</span>
          </span>
        </Link>
        <div className="nav-caption">Workspace</div>
        <nav aria-label="Main navigation">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: true }}
              className="nav-link"
              title={l.name}
              onClick={() => setMobileOpen(false)}
            >
              <l.icon />
              <span className="nav-label">{l.name}</span>
              {l.to === "/waiting-queue" && data.queue.length > 0 && (
                <span className="nav-count">{data.queue.length}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-box">
            <div className="flex items-center gap-2 text-primary-foreground text-xs font-semibold">
              <ShieldCheck size={15} />
              Demo workspace
              <span className="dot bg-primary ml-auto" />
            </div>
            <p>
              Smart parking. Simplified.
              <br />
              Your campus, in one place.
            </p>
            <Button
              variant="link"
              size="sm"
              className="!px-0 text-xs text-sidebar-foreground"
              onClick={() => setAbout(true)}
            >
              Project overview <ArrowUpRight className="!size-3" />
            </Button>
          </div>
          <div className="sidebar-profile">
            <div className="avatar">{data.settings.adminName.slice(0, 2).toUpperCase()}</div>
            <div className="profile-text min-w-0">
              <div className="text-xs text-primary-foreground font-semibold truncate">
                {data.settings.adminName}
              </div>
              <div className="text-[10px] mt-1">Administrator</div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="profile-text ml-auto"
              aria-label="Project information"
              onClick={() => setAbout(true)}
            >
              <CircleHelp />
            </Button>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="topbar">
          <div className="breadcrumb">
            <Button
              variant="ghost"
              size="icon"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label="Toggle sidebar"
              onClick={() => {
                setCollapsed(!collapsed);
                setMobileOpen(!mobileOpen);
              }}
            >
              <span className="hidden sm:block">
                {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
              </span>
              <Menu className="sm:hidden" />
            </Button>
            <span className="breadcrumb-home text-muted-foreground">Workspace</span>
            <ChevronRight className="breadcrumb-home size-12 !w-3 !h-3 text-muted-foreground" />
            <span className="font-medium truncate">{current}</span>
          </div>
          <div className="top-actions">
            <div className="search-wrap">
              <Search className="search-icon" />
              <input
                aria-label="Global vehicle search"
                placeholder="Search vehicle number…"
                className="search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 !w-7 !h-9"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                >
                  <X className="!size-3" />
                </Button>
              )}
              {query && (
                <div className="absolute top-11 right-0 w-72 max-w-[85vw] z-40 panel p-2">
                  <div className="text-[10px] text-muted-foreground px-2 py-2">
                    VEHICLE SEARCH · DEMO RECORDS
                  </div>
                  {results.length ? (
                    results.map((v) => {
                      const s = data.sessions.find((s) => s.vehicleId === v.id && !s.exit);
                      return (
                        <Button
                          key={v.id}
                          variant="ghost"
                          className="w-full justify-between !h-auto !py-3"
                          onClick={() => {
                            open({ kind: "details", vehicleId: v.id });
                            setQuery("");
                          }}
                        >
                          <span className="text-left">
                            <strong className="text-xs block">{v.registration}</strong>
                            <span className="text-[10px] text-muted-foreground">
                              {v.owner}
                              {s ? ` · ${s.slotId}` : ""}
                            </span>
                          </span>
                          <StatusBadge
                            status={
                              s
                                ? "parked"
                                : data.queue.some((q) => q.vehicleId === v.id)
                                  ? "waiting"
                                  : "registered"
                            }
                          />
                        </Button>
                      );
                    })
                  ) : (
                    <div className="text-center text-xs text-muted-foreground py-8">
                      No matching vehicle. Try another number.
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              className="relative"
              onClick={() => setNotifications(true)}
            >
              <Bell className="!size-[18px]" />
              {data.activities.length > 0 && (
                <span className="absolute right-2 top-1.5 w-1.5 h-1.5 bg-occupied rounded-full" />
              )}
            </Button>
            <div className="h-7 w-px bg-border hidden sm:block" />
            <Button variant="ghost" asChild className="top-profile !px-0">
              <Link to="/settings">
                <span className="avatar">{data.settings.adminName.slice(0, 2).toUpperCase()}</span>
                <span className="top-profile-text text-left">
                  <strong className="block text-xs">{data.settings.adminName}</strong>
                  <span className="block text-[10px] text-muted-foreground font-normal mt-0.5">
                    Administrator
                  </span>
                </span>
                <ChevronDown className="top-profile-text !size-3 ml-2" />
              </Link>
            </Button>
          </div>
        </header>
        <main className="page-content">
          {!ready ? (
            <div className="notice mb-5" role="status">
              Loading your demo workspace…
            </div>
          ) : null}
          {ready ? children : null}
          <footer className="footer">
            <span>© 2026 SmartPark. Smart Parking Management System.</span>
            <span className="flex items-center gap-1.5">
              <span className="dot bg-primary" />
              Frontend demo <span className="mx-1">·</span> Java backend not connected
            </span>
          </footer>
        </main>
      </div>
      <ParkingDialogs />
      <Dialog open={notifications} onOpenChange={setNotifications}>
        <DialogContent>
          <DialogTitle>Recent notifications</DialogTitle>
          <DialogDescription>Activity from your demo parking workspace.</DialogDescription>
          <div className="max-h-96 overflow-auto">
            {data.activities.slice(0, 8).map((a) => (
              <div key={a.id} className="py-3 border-b border-border flex justify-between gap-3">
                <span className="text-xs">{a.description}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {formatTime(a.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={about} onOpenChange={setAbout}>
        <DialogContent>
          <DialogTitle>Smart Parking Management System</DialogTitle>
          <DialogDescription>College DSA project · Frontend demonstration</DialogDescription>
          <p className="text-sm leading-7">
            Your existing Java project uses HashMap for vehicle lookup, PriorityQueue for slot
            allocation, LinkedList for the waiting queue, and Stack for undo. This independent demo
            represents those workflows, with browser-saved sample records.
          </p>
          <div className="notice">
            <ShieldCheck />
            The Java project is preserved and not connected. REST API integration is a separate next
            step.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
