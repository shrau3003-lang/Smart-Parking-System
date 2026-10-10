import { useState } from "react";
import { Download, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParking } from "@/features/parking/store";
import { formatTime, formatDate, duration } from "@/features/parking/service";
import { PageHeading, StatusBadge, EmptyState, Pagination, SortHeading } from "./common";
import { toast } from "sonner";
export function ParkingHistory() {
  const {
    state: { data },
  } = useParking();
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("exit");
  const [asc, setAsc] = useState(false);
  const rows = data.sessions
    .filter((s) => s.exit)
    .filter(
      (s) =>
        `${s.registration} ${s.slotId}`.toLowerCase().includes(search.toLowerCase()) &&
        (!from || new Date(s.entry) >= new Date(`${from}T00:00:00`)) &&
        (!to || new Date(s.entry) <= new Date(`${to}T23:59:59.999`)),
    )
    .sort((a, b) => {
      const value = (s: typeof a) =>
        sort === "registration"
          ? s.registration
          : sort === "slot"
            ? s.slotId
            : sort === "entry"
              ? s.entry
              : (s.exit ?? "");
      return value(a).localeCompare(value(b)) * (asc ? 1 : -1);
    });
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / 8)));
  const toggle = (key: string) => {
    setAsc(sort === key ? !asc : true);
    setSort(key);
  };
  const exportCsv = () => {
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [
      ["Registration", "Vehicle type", "Slot", "Entry", "Exit", "Duration", "Status"],
      ...rows.map((s) => [
        s.registration,
        s.type,
        s.slotId,
        s.entry,
        s.exit ?? "",
        duration(s.entry, s.exit),
        "Completed",
      ]),
    ]
      .map((row) => row.map(escape).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "smartpark-parking-history.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${rows.length} sessions exported`);
  };
  return (
    <>
      <PageHeading
        title="Parking History"
        subtitle="A complete record of finished parking sessions, kept safely in your demo."
      >
        <Button variant="outline" onClick={exportCsv} disabled={!rows.length}>
          <Download />
          Export CSV
        </Button>
      </PageHeading>
      <div className="filter-bar">
        <input
          className="control filter-search"
          aria-label="Search parking history"
          placeholder="Search vehicle or slot…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          From
          <input
            aria-label="History from date"
            type="date"
            className="control !w-auto"
            value={from}
            max={to || undefined}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          To
          <input
            aria-label="History to date"
            type="date"
            className="control !w-auto"
            value={to}
            min={from || undefined}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearch("");
            setFrom("");
            setTo("");
            setPage(1);
          }}
        >
          Clear filters
        </Button>
      </div>
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Completed Sessions</h2>
            <p>{rows.length} matching sessions · Sample and demonstration records</p>
          </div>
          <History className="size-4 text-muted-foreground" />
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <SortHeading onClick={() => toggle("registration")}>Vehicle number</SortHeading>
                </th>
                <th>Type</th>
                <th>
                  <SortHeading onClick={() => toggle("slot")}>Slot</SortHeading>
                </th>
                <th>
                  <SortHeading onClick={() => toggle("entry")}>Entry</SortHeading>
                </th>
                <th>
                  <SortHeading onClick={() => toggle("exit")}>Exit</SortHeading>
                </th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice((currentPage - 1) * 8, currentPage * 8).map((s) => (
                <tr key={s.id}>
                  <td className="registration">{s.registration}</td>
                  <td>{s.type}</td>
                  <td className="font-semibold">{s.slotId}</td>
                  <td>
                    {formatTime(s.entry)}
                    <span className="block text-[10px] text-muted-foreground mt-1">
                      {formatDate(s.entry)}
                    </span>
                  </td>
                  <td>
                    {s.exit ? formatTime(s.exit) : "—"}
                    <span className="block text-[10px] text-muted-foreground mt-1">
                      {s.exit ? formatDate(s.exit) : ""}
                    </span>
                  </td>
                  <td>{duration(s.entry, s.exit)}</td>
                  <td>
                    <StatusBadge status="completed" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && <EmptyState title="No completed sessions found" />}
        <Pagination page={currentPage} total={rows.length} onChange={setPage} />
      </section>
    </>
  );
}
