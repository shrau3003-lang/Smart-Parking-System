import { useState } from "react";
import { Plus, CarFront, Eye, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParking } from "@/features/parking/store";
import { vehicleTypes } from "@/features/parking/models";
import { formatTime, formatDate, normalizeRegistration } from "@/features/parking/service";
import { PageHeading, StatusBadge, EmptyState, Pagination, SortHeading } from "./common";
export function Vehicles() {
  const {
    state: { data },
    open,
  } = useParking();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("registration");
  const [ascending, setAscending] = useState(true);
  const rows = data.vehicles
    .map((v) => {
      const session = data.sessions.find((s) => s.vehicleId === v.id && !s.exit);
      return {
        ...v,
        session,
        status: session
          ? "parked"
          : data.queue.some((q) => q.vehicleId === v.id)
            ? "waiting"
            : "registered",
      };
    })
    .filter(
      (v) =>
        (normalizeRegistration(v.registration).includes(normalizeRegistration(search)) ||
          v.owner.toLowerCase().includes(search.toLowerCase())) &&
        (type === "all" || v.type === type) &&
        (status === "all" || v.status === status),
    )
    .sort((a, b) => {
      const value = (v: typeof a) =>
        sort === "entry"
          ? (v.session?.entry ?? "")
          : sort === "owner"
            ? v.owner
            : sort === "type"
              ? v.type
              : sort === "slot"
                ? (v.session?.slotId ?? "")
                : v.registration;
      return value(a).localeCompare(value(b)) * (ascending ? 1 : -1);
    });
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / 8)));
  const toggleSort = (field: string) => {
    setAscending(sort === field ? !ascending : true);
    setSort(field);
  };
  return (
    <>
      <PageHeading
        title="Vehicle Management"
        subtitle="Manage registered vehicles and their parking assignments."
      >
        <Button variant="outline" onClick={() => open({ kind: "add" })}>
          <Plus />
          Add Vehicle
        </Button>
        <Button onClick={() => open({ kind: "park" })}>
          <CarFront />
          Park Vehicle
        </Button>
      </PageHeading>
      <div className="filter-bar">
        <input
          className="control filter-search"
          aria-label="Search vehicles"
          placeholder="Search registration or owner…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="control filter-select"
          aria-label="Vehicle type"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All vehicle types</option>
          {vehicleTypes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select
          className="control filter-select"
          aria-label="Vehicle status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All statuses</option>
          <option value="parked">Parked</option>
          <option value="waiting">Waiting</option>
          <option value="registered">Registered</option>
        </select>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearch("");
            setType("all");
            setStatus("all");
            setPage(1);
          }}
        >
          Clear filters
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">
          {rows.length} vehicles · Demo records
        </span>
      </div>
      <section className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <SortHeading onClick={() => toggleSort("registration")}>Registration</SortHeading>
                </th>
                <th>
                  <SortHeading onClick={() => toggleSort("type")}>Type</SortHeading>
                </th>
                <th>
                  <SortHeading onClick={() => toggleSort("owner")}>Owner</SortHeading>
                </th>
                <th>Contact</th>
                <th>
                  <SortHeading onClick={() => toggleSort("slot")}>Slot</SortHeading>
                </th>
                <th>
                  <SortHeading onClick={() => toggleSort("entry")}>Entry time</SortHeading>
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice((currentPage - 1) * 8, currentPage * 8).map((v) => (
                <tr key={v.id}>
                  <td className="registration">{v.registration}</td>
                  <td>{v.type}</td>
                  <td>{v.owner}</td>
                  <td className="text-muted-foreground">{v.contact}</td>
                  <td className="font-semibold">{v.session?.slotId ?? "—"}</td>
                  <td className="text-muted-foreground">
                    {v.session ? (
                      <>
                        <span className="block">{formatTime(v.session.entry)}</span>
                        <span className="text-[10px]">{formatDate(v.session.entry)}</span>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <StatusBadge status={v.status} />
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="View details"
                        aria-label={`View ${v.registration}`}
                        onClick={() => open({ kind: "details", vehicleId: v.id })}
                      >
                        <Eye />
                      </Button>
                      {v.session ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-occupied"
                          title="Remove vehicle"
                          aria-label={`Remove ${v.registration}`}
                          onClick={() => open({ kind: "exit", sessionId: v.session?.id })}
                        >
                          <LogOut />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-primary"
                          title="Park vehicle"
                          aria-label={`Park ${v.registration}`}
                          onClick={() =>
                            open({
                              kind: "park",
                              vehicle: v,
                              queueId: data.queue.find((q) => q.vehicleId === v.id)?.id,
                            })
                          }
                        >
                          <CarFront />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && <EmptyState />}
        <Pagination page={currentPage} total={rows.length} onChange={setPage} />
      </section>
    </>
  );
}
