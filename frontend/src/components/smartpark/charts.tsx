import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useParking } from "@/features/parking/store";
import { activeSessions } from "@/features/parking/service";
import { vehicleTypes } from "@/features/parking/models";
const palette = ["var(--primary)", "var(--occupied)", "var(--reserved)", "var(--maintenance)"];
const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  fontSize: 11,
  color: "var(--foreground)",
};
export function OccupancyChart() {
  const {
    state: { data },
  } = useParking();
  const items = ["available", "occupied", "reserved", "maintenance"].map((status, i) => ({
    name: status,
    value: data.slots.filter((s) => s.status === status).length,
    color: palette[i],
  }));
  const occupied = items[1]?.value ?? 0;
  const percent = Math.round((occupied / Math.max(1, data.slots.length)) * 100);
  return (
    <>
      <div className="occupancy-body">
        <div className="occupancy-ring">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                isAnimationActive={false}
                data={items}
                innerRadius="73%"
                outerRadius="94%"
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                paddingAngle={3}
                stroke="none"
              >
                {items.map((x) => (
                  <Cell key={x.name} fill={x.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="ring-label">
            <strong>{percent}%</strong>
            <span>Occupancy rate</span>
          </div>
        </div>
        <div className="occupancy-list">
          {items.map((x) => (
            <div key={x.name} className="occupancy-row">
              <span className="flex items-center gap-2">
                <span
                  className={`dot ${x.name === "available" ? "bg-primary" : x.name === "occupied" ? "bg-occupied" : x.name === "reserved" ? "bg-reserved" : "bg-maintenance"}`}
                />
                {x.name === "maintenance"
                  ? "Maintenance"
                  : x.name.charAt(0).toUpperCase() + x.name.slice(1)}
              </span>
              <span>
                <strong className="text-foreground mr-2">{x.value}</strong>
                <span className="text-muted-foreground">
                  {Math.round((x.value / Math.max(1, data.slots.length)) * 100)}%
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="zone-bars">
        {[...new Set(data.slots.map((s) => s.zone))].map((zone) => {
          const slots = data.slots.filter((s) => s.zone === zone);
          const count = slots.filter((s) => s.status === "occupied").length;
          return (
            <div key={zone}>
              <div className="flex justify-between">
                <span className="font-semibold">Zone {zone}</span>
                <span className="text-muted-foreground">
                  {count}/{slots.length}
                </span>
              </div>
              <div className="progress">
                <svg width="100%" height="5" aria-label={`Zone ${zone} ${count} occupied`}>
                  <rect
                    width={`${(count / slots.length) * 100}%`}
                    height="5"
                    fill="var(--primary)"
                    rx="2"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
export function EntriesChart({ days = 1 }: { days?: number }) {
  const {
    state: { data },
  } = useParking();
  const now = new Date();
  const items =
    days === 1
      ? Array.from({ length: 7 }, (_, i) => {
          const hour = 6 + i * 2;
          return {
            label: `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? " PM" : " AM"}`,
            Entries: data.sessions.filter(
              (s) =>
                new Date(s.entry).toDateString() === now.toDateString() &&
                new Date(s.entry).getHours() >= hour &&
                new Date(s.entry).getHours() < hour + 2,
            ).length,
            Exits: data.sessions.filter(
              (s) =>
                s.exit &&
                new Date(s.exit).toDateString() === now.toDateString() &&
                new Date(s.exit).getHours() >= hour &&
                new Date(s.exit).getHours() < hour + 2,
            ).length,
          };
        })
      : Array.from({ length: days }, (_, i) => {
          const day = new Date(now);
          day.setDate(day.getDate() - (days - 1 - i));
          return {
            label: day.toLocaleDateString("en-IN", { weekday: "short" }),
            Entries: data.sessions.filter(
              (s) => new Date(s.entry).toDateString() === day.toDateString(),
            ).length,
            Exits: data.sessions.filter(
              (s) => s.exit && new Date(s.exit).toDateString() === day.toDateString(),
            ).length,
          };
        });
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={items} margin={{ top: 12, right: 14, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 4" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          dy={8}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          isAnimationActive={false}
          type="monotone"
          dataKey="Entries"
          stroke="var(--primary)"
          fill="var(--accent)"
          strokeWidth={2.3}
        />
        <Area
          isAnimationActive={false}
          type="monotone"
          dataKey="Exits"
          stroke="var(--info)"
          fill="var(--info-soft)"
          fillOpacity={0.5}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
export function TypeDistribution() {
  const {
    state: { data },
  } = useParking();
  const active = activeSessions(data);
  const items = vehicleTypes.map((type, i) => ({
    name: type,
    value: active.filter((s) => s.type === type).length,
    color: ["var(--primary)", "var(--info)", "var(--reserved)", "var(--secondary)"][i],
  }));
  return (
    <div className="occupancy-body">
      <div className="occupancy-ring">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              isAnimationActive={false}
              data={items}
              dataKey="value"
              innerRadius="64%"
              outerRadius="89%"
              paddingAngle={3}
              stroke="none"
            >
              {items.map((x) => (
                <Cell key={x.name} fill={x.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="ring-label">
          <strong>{active.length}</strong>
          <span>Parked vehicles</span>
        </div>
      </div>
      <div className="occupancy-list">
        {items.map((x, i) => (
          <div key={x.name} className="occupancy-row">
            <span className="flex items-center gap-2">
              <span
                className={`dot ${["bg-primary", "bg-info", "bg-reserved", "bg-secondary"][i]}`}
              />
              {x.name}
            </span>
            <strong>{x.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
export function PeakHoursChart() {
  const {
    state: { data },
  } = useParking();
  const rows = Array.from({ length: 12 }, (_, i) => ({
    hour: `${i + 7}:00`,
    Entries: data.sessions.filter((s) => new Date(s.entry).getHours() === i + 7).length,
  }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows}>
        <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 4" />
        <XAxis
          dataKey="hour"
          tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar
          isAnimationActive={false}
          dataKey="Entries"
          fill="var(--primary)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
export function OccupancyTrend() {
  const {
    state: { data },
  } = useParking();
  const now = new Date();
  const rows = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - 6 + i);
    date.setHours(23, 59, 59, 999);
    const time = Math.min(date.getTime(), now.getTime());
    const count = data.sessions.filter(
      (s) => new Date(s.entry).getTime() <= time && (!s.exit || new Date(s.exit).getTime() > time),
    ).length;
    return { label: date.toLocaleDateString("en-IN", { weekday: "short" }), Occupied: count };
  });
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={rows} margin={{ left: -20, right: 15 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 4" />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
        <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          isAnimationActive={false}
          type="monotone"
          dataKey="Occupied"
          stroke="var(--primary)"
          fill="var(--accent)"
          strokeWidth={2}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
