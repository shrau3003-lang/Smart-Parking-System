import { useState } from "react";
import { CarFront, Bike, Zap, Plus, ArrowRight, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParking } from "@/features/parking/store";
import { vehicleTypes } from "@/features/parking/models";
import { PageHeading, EmptyState } from "./common";
export function ParkingSlots() {
  const {
    state: { data },
    open,
  } = useParking();
  const [search, setSearch] = useState("");
  const [zone, setZone] = useState("all");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const zones = [...new Set(data.slots.map((s) => s.zone))];
  const filtered = data.slots.filter(
    (s) =>
      s.id.toLowerCase().includes(search.toLowerCase()) &&
      (zone === "all" || s.zone === zone) &&
      (status === "all" || s.status === status) &&
      (type === "all" || s.types.some((t) => t === type)),
  );
  return (
    <>
      <PageHeading
        title="Parking Slots"
        subtitle="Every space, at a glance. Manage your campus parking zones."
      >
        <Button onClick={() => open({ kind: "park" })}>
          <Plus />
          Park Vehicle
        </Button>
      </PageHeading>
      <div className="slots-summary">
        {["available", "occupied", "reserved", "maintenance"].map((status) => (
          <div key={status} className="panel px-5 py-4 flex items-center justify-between">
            <span className="text-xs capitalize flex items-center gap-2">
              <span
                className={`dot ${status === "available" ? "bg-primary" : status === "occupied" ? "bg-occupied" : status === "reserved" ? "bg-reserved" : "bg-maintenance"}`}
              />
              {status === "maintenance" ? "Maintenance" : status}
            </span>
            <strong className="text-2xl">
              {data.slots.filter((s) => s.status === status).length}
            </strong>
          </div>
        ))}
      </div>
      <div className="filter-bar">
        <input
          className="control filter-search"
          aria-label="Search parking slots"
          placeholder="Search slot number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="control filter-select"
          aria-label="Zone filter"
          value={zone}
          onChange={(e) => setZone(e.target.value)}
        >
          <option value="all">All zones</option>
          {zones.map((z) => (
            <option key={z} value={z}>
              Zone {z}
            </option>
          ))}
        </select>
        <select
          className="control filter-select"
          aria-label="Slot status filter"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All statuses</option>
          {["available", "occupied", "reserved", "maintenance"].map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <select
          className="control filter-select"
          aria-label="Vehicle type filter"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="all">All vehicle types</option>
          {vehicleTypes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearch("");
            setZone("all");
            setStatus("all");
            setType("all");
          }}
        >
          Clear filters
        </Button>
      </div>
      <div className="legend">
        {["Available", "Occupied", "Reserved", "Maintenance"].map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            <span
              className={`dot ${["bg-primary", "bg-occupied", "bg-reserved", "bg-maintenance"][i]}`}
            />
            {s}
          </span>
        ))}
        <span className="ml-auto">{filtered.length} spaces</span>
      </div>
      {!filtered.length && <EmptyState title="No parking spaces match" />}
      {zones
        .filter((z) => filtered.some((s) => s.zone === z))
        .map((z) => (
          <section key={z}>
            <div className="zone-heading">
              <h2>
                <span className="inline-grid place-items-center bg-secondary text-primary-foreground rounded-md w-7 h-7 mr-2 text-xs">
                  {z}
                </span>
                Zone {z}
              </h2>
              <span>
                {data.slots.filter((s) => s.zone === z && s.status === "available").length}{" "}
                available · {data.slots.filter((s) => s.zone === z).length} total
              </span>
            </div>
            <div className="slot-grid">
              {filtered
                .filter((s) => s.zone === z)
                .map((s) => {
                  const session = data.sessions.find(
                    (session) => session.slotId === s.id && !session.exit,
                  );
                  const Icon =
                    session?.type === "Bike"
                      ? Bike
                      : session?.type === "Electric Vehicle"
                        ? Zap
                        : CarFront;
                  return (
                    <Button
                      variant="ghost"
                      key={s.id}
                      className={`slot-card status-${s.status}`}
                      aria-label={`Slot ${s.id}, ${s.status}`}
                      onClick={() => open({ kind: "slot", slotId: s.id })}
                    >
                      <strong>{s.id}</strong>
                      <Icon />
                      <span className="slot-status">
                        {session?.registration ??
                          (s.status === "maintenance"
                            ? "Maintenance"
                            : s.status.charAt(0).toUpperCase() + s.status.slice(1))}
                      </span>
                    </Button>
                  );
                })}
            </div>
            <div className="slot-road">← &nbsp; Zone {z} access lane &nbsp; →</div>
          </section>
        ))}
    </>
  );
}
