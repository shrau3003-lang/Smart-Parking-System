import { ChevronLeft, ChevronRight, SearchX, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";
export function PageHeading({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div className="min-w-0">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  );
}
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      <span className="dot bg-current" />
      {status === "maintenance" ? "Maintenance" : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
export function EmptyState({
  title = "No records found",
  message = "Try another search or clear your filters.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="empty-state">
      <SearchX />
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
export function Pagination({
  page,
  total,
  pageSize = 8,
  onChange,
}: {
  page: number;
  total: number;
  pageSize?: number;
  onChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="pagination">
      <span>
        {total
          ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total} records`
          : "0 records"}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft />
        </Button>
        <span>
          Page {page} of {pages}
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next page"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
export function SortHeading({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 uppercase text-[10px] text-muted-foreground"
      onClick={onClick}
    >
      {children}
      <ArrowUpDown className="!size-3" />
    </Button>
  );
}
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="text-xs font-semibold">{label}</span>
      {children}
    </label>
  );
}
