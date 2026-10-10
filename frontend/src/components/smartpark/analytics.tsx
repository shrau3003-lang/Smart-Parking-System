import { CalendarDays, CarFront, Clock3, TrendingUp, ArrowRight } from "lucide-react";
import { useParking } from "@/features/parking/store";
import { activeSessions } from "@/features/parking/service";
import { PageHeading } from "./common";
import {
  EntriesChart,
  OccupancyChart,
  TypeDistribution,
  PeakHoursChart,
  OccupancyTrend,
} from "./charts";
export function Analytics() {
  const {
    state: { data },
  } = useParking();
  const active = activeSessions(data);
  const complete = data.sessions.filter((s) => s.exit);
  const average = complete.length
    ? Math.round(
        complete.reduce(
          (sum, s) =>
            sum +
            Math.max(
              0,
              (new Date(s.exit ?? s.entry).getTime() - new Date(s.entry).getTime()) / 60000,
            ),
          0,
        ) / complete.length,
      )
    : 0;
  const now = new Date();
  const today = data.sessions.filter(
    (s) => new Date(s.entry).toDateString() === now.toDateString(),
  ).length;
  const metrics = [
    {
      label: "Current Occupancy",
      value: `${Math.round((active.length / Math.max(1, data.slots.length)) * 100)}%`,
      icon: TrendingUp,
      color: "status-available",
      sub: "From current demo assignments",
    },
    {
      label: "Entries Today",
      value: today,
      icon: CarFront,
      color: "status-vehicle",
      sub: "Recorded vehicle arrivals",
    },
    {
      label: "Average Parking Duration",
      value: `${average} min`,
      icon: Clock3,
      color: "status-reserved",
      sub: `Across ${complete.length} completed sessions`,
    },
    {
      label: "Completed Sessions",
      value: complete.length,
      icon: CalendarDays,
      color: "status-maintenance",
      sub: "Preserved historical records",
    },
  ];
  return (
    <>
      <PageHeading
        title="Parking Analytics"
        subtitle="Understand parking patterns with insights from your demonstration records."
      >
        <span className="status-badge status-available">
          <span className="dot bg-primary" />
          Demo analytics · Not sensor data
        </span>
      </PageHeading>
      <div className="stats-grid">
        {metrics.map((m) => (
          <div className="panel stat-card" key={m.label}>
            <div className="stat-top">
              <span>{m.label}</span>
              <span className={`stat-icon ${m.color}`}>
                <m.icon />
              </span>
            </div>
            <div className="stat-value">{m.value}</div>
            <div className="stat-foot">{m.sub}</div>
          </div>
        ))}
      </div>
      <div className="dashboard-middle">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Occupancy Trend</h2>
              <p>Occupied spaces at day-end · Last 7 days</p>
            </div>
          </div>
          <div className="chart-body !h-64 pb-4">
            <OccupancyTrend />
          </div>
        </section>
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Daily Entries & Exits</h2>
              <p>Session movements · Last 7 days</p>
            </div>
          </div>
          <div className="chart-body">
            <EntriesChart days={7} />
          </div>
          <div className="chart-legend">
            <span className="flex items-center gap-2">
              <span className="dot bg-primary" />
              Entries
            </span>
            <span className="flex items-center gap-2">
              <span className="dot bg-info" />
              Exits
            </span>
          </div>
        </section>
      </div>
      <div className="dashboard-middle">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Peak Parking Hours</h2>
              <p>Arrival distribution across all demo sessions</p>
            </div>
          </div>
          <div className="chart-body !h-64 pb-5">
            <PeakHoursChart />
          </div>
        </section>
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Vehicle-Type Distribution</h2>
              <p>Current parked vehicles, by category</p>
            </div>
          </div>
          <TypeDistribution />
        </section>
      </div>
      <section className="panel max-w-3xl">
        <div className="panel-header">
          <div>
            <h2>Available vs. Occupied Slots</h2>
            <p>Current workspace capacity, including reserved and maintenance spaces</p>
          </div>
        </div>
        <OccupancyChart />
      </section>
    </>
  );
}
