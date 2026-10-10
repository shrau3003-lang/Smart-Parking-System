import { Plus, ArrowRight, Clock3, Eye, Trash2, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParking } from "@/features/parking/store";
import { suitableSlots, duration, formatTime, formatDate } from "@/features/parking/service";
import { PageHeading, StatusBadge, EmptyState } from "./common";
import { useEffect, useState } from "react";
export function WaitingQueue() {
  const {
    state: { data },
    open,
  } = useParking();
  const [, tick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => tick((v) => v + 1), 30000);
    return () => clearInterval(timer);
  }, []);
  const next = data.queue.find((q) => {
    const v = data.vehicles.find((v) => v.id === q.vehicleId);
    return v && suitableSlots(data, v.type).length > 0;
  });
  const vehicle = data.vehicles.find((v) => v.id === next?.vehicleId);
  const slots = vehicle ? suitableSlots(data, vehicle.type) : [];
  return (
    <>
      <PageHeading
        title="Waiting Queue"
        subtitle="An orderly arrival. First in, first served, with suitable slot assignments."
      >
        <Button onClick={() => open({ kind: "queue" })}>
          <Plus />
          Add to Queue
        </Button>
      </PageHeading>
      {next && vehicle ? (
        <div className="queue-highlight rounded-md">
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-semibold">
              <ListOrdered size={16} />
              NEXT ELIGIBLE VEHICLE
            </div>
            <div className="mt-2 font-semibold text-lg">
              {vehicle.registration}
              <span className="text-xs font-normal text-muted-foreground ml-3">
                {vehicle.type} · {vehicle.owner}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Waiting {duration(next.arrival)} · Recommended slot {slots[0]?.id}
            </p>
          </div>
          <Button
            onClick={() => open({ kind: "park", vehicle, queueId: next.id, slotId: slots[0]?.id })}
          >
            Assign Available Slot <ArrowRight />
          </Button>
        </div>
      ) : data.queue.length > 0 ? (
        <div className="notice mb-5">
          <Clock3 />
          No suitable spaces are available for queued vehicles. Release a suitable occupied slot to
          continue.
        </div>
      ) : null}
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Waiting vehicles</h2>
            <p>{data.queue.length} vehicles in queue · FIFO order</p>
          </div>
          <span className="status-badge status-queue">
            <Clock3 size={12} />
            Demo arrivals
          </span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Position</th>
                <th>Vehicle number</th>
                <th>Vehicle type</th>
                <th>Arrival time</th>
                <th>Waiting duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.queue.map((q, i) => {
                const v = data.vehicles.find((v) => v.id === q.vehicleId);
                return (
                  <tr key={q.id}>
                    <td>
                      <span
                        className={`inline-grid place-items-center w-7 h-7 rounded-md font-semibold ${q.id === next?.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="registration">{v?.registration}</td>
                    <td>{v?.type}</td>
                    <td>
                      {formatTime(q.arrival)}
                      <span className="block text-[10px] text-muted-foreground mt-1">
                        {formatDate(q.arrival)}
                      </span>
                    </td>
                    <td>{duration(q.arrival)}</td>
                    <td>
                      <StatusBadge status={q.id === next?.id ? "available" : "waiting"} />
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View vehicle details"
                          aria-label={`View queue vehicle ${i + 1}`}
                          onClick={() => open({ kind: "details", vehicleId: q.vehicleId })}
                        >
                          <Eye />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Remove from queue"
                          aria-label={`Remove queue vehicle ${i + 1}`}
                          className="text-occupied"
                          onClick={() => open({ kind: "dequeue", queueId: q.id })}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!data.queue.length && (
          <EmptyState
            title="The queue is clear"
            message="New waiting vehicles will appear here in arrival order."
          />
        )}
      </section>
    </>
  );
}
