import { Link } from "@tanstack/react-router";
import {
  SquareParking,
  CircleParking,
  CarFront,
  CalendarDays,
  Plus,
  LogOut,
  Search,
  ArrowRight,
  ListOrdered,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useParking } from "@/features/parking/store";
import { activeSessions, formatTime } from "@/features/parking/service";
import { PageHeading, StatusBadge } from "./common";
import { OccupancyChart, EntriesChart, TypeDistribution } from "./charts";
export function Dashboard() {
  const {
    state: { data },
    open,
  } = useParking();
  const [days, setDays] = useState(1);
  const active = activeSessions(data);
  const available = data.slots.filter((s) => s.status === "available").length;
  const reserved = data.slots.filter((s) => s.status === "reserved").length;
  const total = data.slots.length;
  const stats = [
    {
      label: "Total Parking Slots",
      value: total,
      icon: SquareParking,
      color: "bg-info-soft text-info",
      foot: `Across ${new Set(data.slots.map((s) => s.zone)).size} parking zones`,
      small: "Configured capacity",
    },
    {
      label: "Available Slots",
      value: available,
      icon: CircleParking,
      color: "bg-success-soft text-primary",
      foot: `${Math.round((available / Math.max(1, total)) * 100)}% of total capacity`,
      small: "Ready for parking",
    },
    {
      label: "Occupied Slots",
      value: active.length,
      icon: CarFront,
      color: "bg-occupied-soft text-occupied",
      foot: `${Math.round((active.length / Math.max(1, total)) * 100)}% occupancy rate`,
      small: "Currently parked",
    },
    {
      label: "Reserved Slots",
      value: reserved,
      icon: CalendarDays,
      color: "bg-reserved-soft text-reserved",
      foot: "Reserved parking spaces",
      small: "Held for arrival",
    },
  ];
  return (
    <>
      <PageHeading
        title="Parking Dashboard"
        subtitle="A clear view of your parking space. Everything, in one place."
      >
        <div className="hidden md:flex items-center gap-2 text-[11px] text-muted-foreground mr-2">
          <CalendarDays size={14} />
          {new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
        <Button onClick={() => open({ kind: "park" })}>
          <Plus />
          Park Vehicle
        </Button>
      </PageHeading>
      <div className="stats-grid">
        {stats.map((s) => (
          <div className="panel stat-card" key={s.label}>
            <div className="stat-top">
              <span>{s.label}</span>
              <span className={`stat-icon ${s.color}`}>
                <s.icon />
              </span>
            </div>
            <div className="stat-value">{String(s.value).padStart(2, "0")}</div>
            <div className="stat-foot">
              <span
                className={`dot ${s.label === "Available Slots" ? "bg-primary" : "bg-muted-foreground"}`}
              />
              {s.foot}
            </div>
          </div>
        ))}
      </div>
      <div className="dashboard-middle">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Parking Occupancy</h2>
              <p>Current distribution across all parking zones</p>
            </div>
            <span className="status-badge status-available">
              <span className="dot bg-primary" />
              Demo data
            </span>
          </div>
          <OccupancyChart />
        </section>
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Vehicle Activity</h2>
              <p>Vehicle entries and exits from demo records</p>
            </div>
            <select
              aria-label="Activity chart period"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="control !w-auto !h-7 !text-[10px]"
            >
              <option value="1">Today</option>
              <option value="7">This week</option>
            </select>
          </div>
          <div className="chart-body">
            <EntriesChart days={days} />
          </div>
          <div className="chart-legend">
            <span className="flex items-center gap-1.5">
              <span className="dot bg-primary" />
              Vehicle entries
            </span>
            <span className="flex items-center gap-1.5">
              <span className="dot bg-info" />
              Vehicle exits
            </span>
          </div>
        </section>
      </div>
      <div className="quick-actions">
        <Button variant="outline" className="quick-button" onClick={() => open({ kind: "park" })}>
          <Plus />
          Park Vehicle
        </Button>
        <Button variant="outline" className="quick-button" onClick={() => open({ kind: "exit" })}>
          <LogOut />
          Remove Vehicle
        </Button>
        <Button variant="outline" className="quick-button" onClick={() => open({ kind: "search" })}>
          <Search />
          Find Vehicle
        </Button>
        <Button variant="outline" className="quick-button" asChild>
          <Link to="/parking-slots">
            <SquareParking />
            View Parking Slots
            <ArrowRight className="!size-3" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {[
          {
            label: "Occupancy Rate",
            value: `${Math.round((active.length / Math.max(1, total)) * 100)}%`,
            icon: TrendingUp,
            sub: "Occupied spaces / total spaces",
          },
          {
            label: "Vehicles Parked",
            value: active.length,
            icon: CarFront,
            sub: "Active parking sessions",
          },
          {
            label: "Vehicles in Queue",
            value: data.queue.length,
            icon: ListOrdered,
            sub: "Waiting for a suitable space",
          },
        ].map((m) => (
          <div className="panel px-5 py-4 flex justify-between items-center" key={m.label}>
            <div>
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <strong className="text-xl font-display block mt-1">{m.value}</strong>
              <p className="text-[10px] text-muted-foreground mt-1">{m.sub}</p>
            </div>
            <span className="stat-icon bg-success-soft text-primary">
              <m.icon />
            </span>
          </div>
        ))}
      </div>
      <div className="dashboard-bottom">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Recent Activity</h2>
              <p>The latest movements in your parking lot</p>
            </div>
            <Button variant="link" size="sm" asChild>
              <Link to="/undo">
                View all <ArrowRight className="!size-3" />
              </Link>
            </Button>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle number</th>
                  <th>Slot</th>
                  <th>Activity</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {data.activities.slice(0, 5).map((a) => (
                  <tr key={a.id}>
                    <td>
                      <span className="flex items-center gap-2.5">
                        <span
                          className={`grid place-items-center w-7 h-7 rounded-md ${a.kind === "exit" ? "bg-info-soft text-info" : "bg-success-soft text-primary"}`}
                        >
                          {a.kind === "exit" ? (
                            <ArrowUpRight size={13} />
                          ) : (
                            <ArrowDownLeft size={13} />
                          )}
                        </span>
                        <span className="registration">{a.registration ?? "Workspace"}</span>
                      </span>
                    </td>
                    <td>{a.slotId ?? "—"}</td>
                    <td>
                      <StatusBadge status={a.kind} />
                    </td>
                    <td className="text-muted-foreground">{formatTime(a.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Vehicle Distribution</h2>
              <p>Currently parked, by vehicle type</p>
            </div>
            <CarFront className="size-4 text-muted-foreground" />
          </div>
          <TypeDistribution />
          <div className="border-t border-border px-5 py-3 flex justify-between gap-3 text-[11px]">
            <span className="text-muted-foreground">
              Vehicles parked <strong className="text-foreground ml-1">{active.length}</strong>
            </span>
            <Link to="/waiting-queue" className="text-primary flex items-center gap-1.5">
              <ListOrdered size={13} />
              {data.queue.length} in waiting queue <ArrowRight size={12} />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
