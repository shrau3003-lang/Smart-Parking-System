import { Undo2, CarFront, LogOut, Settings2, ListOrdered, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParking } from "@/features/parking/store";
import { formatTime, formatDate } from "@/features/parking/service";
import { PageHeading, StatusBadge, EmptyState } from "./common";
export function UndoActivity() {
  const {
    state: { data, undo },
    open,
  } = useParking();
  return (
    <>
      <PageHeading
        title="Undo Activity"
        subtitle="A clear audit trail, with safe, last-in-first-out undo for demo actions."
      >
        <Button onClick={() => open({ kind: "undo" })} disabled={!undo.length}>
          <Undo2 />
          Undo Last Action
        </Button>
      </PageHeading>
      <div className="notice mb-5">
        <Undo2 />
        <span>
          {undo.length
            ? `${undo.length} supported ${undo.length === 1 ? "action" : "actions"} can be undone. Latest: ${undo.at(-1)?.description}.`
            : "Your next parking operation will appear in the undo stack. Initial demo records are not undoable."}
        </span>
      </div>
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Activity timeline</h2>
            <p>Newest operations first · Undo restores all related records together</p>
          </div>
          <span className="text-xs text-muted-foreground">{data.activities.length} activities</span>
        </div>
        {data.activities.map((a) => {
          const Icon =
            a.kind === "park"
              ? CarFront
              : a.kind === "exit"
                ? LogOut
                : a.kind === "queue"
                  ? ListOrdered
                  : Settings2;
          return (
            <div className="activity-item" key={a.id}>
              <span className={`stat-icon status-${a.kind}`}>
                <Icon size={16} />
              </span>
              <div>
                <p className="text-xs font-semibold">{a.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status={a.kind} />
                  {undo.at(-1)?.id === a.id && (
                    <span className="text-[10px] text-primary">Latest · Can undo</span>
                  )}
                  {!undo.some((x) => x.id === a.id) && (
                    <span className="text-[10px] text-muted-foreground">Initial demo record</span>
                  )}
                </div>
              </div>
              <span className="activity-time text-right text-[11px] text-muted-foreground">
                {formatTime(a.timestamp)}
                <span className="block mt-1 text-[10px]">{formatDate(a.timestamp)}</span>
              </span>
            </div>
          );
        })}
        {!data.activities.length && <EmptyState title="No activity yet" />}
      </section>
    </>
  );
}
