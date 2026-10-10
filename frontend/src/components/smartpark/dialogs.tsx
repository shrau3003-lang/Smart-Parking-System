import { useEffect, useState } from "react";
import { CarFront, CheckCircle2, Info, LogOut, Undo2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useParking } from "@/features/parking/store";
import { vehicleTypes, type VehicleType } from "@/features/parking/models";
import {
  activeSessions,
  suitableSlots,
  formatDate,
  formatTime,
  duration,
} from "@/features/parking/service";
import { Field, StatusBadge, EmptyState } from "./common";
export function ParkingDialogs() {
  const {
    state: { data, undo: undoHistory },
    modal,
    open,
    execute,
    undo,
  } = useParking();
  const [registration, setRegistration] = useState("");
  const [type, setType] = useState<VehicleType>("Car");
  const [owner, setOwner] = useState("");
  const [contact, setContact] = useState("");
  const [slotId, setSlotId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => {
    if (!modal) return;
    if (modal.kind === "park" || modal.kind === "add" || modal.kind === "queue") {
      const v = modal.vehicle;
      setRegistration(v?.registration ?? "");
      setType(v?.type ?? "Car");
      setOwner(v?.owner ?? "");
      setContact(v?.contact ?? "");
      const slot = data.slots.find((s) => s.id === modal.slotId);
      if (slot && !slot.types.includes(v?.type ?? "Car")) setType(slot.types[0] ?? "Car");
      setSlotId(modal.slotId ?? "");
    }
    if (modal.kind === "exit") {
      setSessionId(modal.sessionId ?? "");
      setSearch("");
    }
    if (modal.kind === "search") setSearch("");
  }, [modal]);
  const slots = suitableSlots(data, type);
  const selected = slots.find((s) => s.id === slotId)?.id ?? slots[0]?.id ?? "";
  const close = () => open(null);
  let title = "";
  let description = "";
  let content = null;
  if (modal?.kind === "park" || modal?.kind === "add" || modal?.kind === "queue") {
    const kind = modal.kind;
    title =
      kind === "park"
        ? "Park a vehicle"
        : kind === "add"
          ? "Add a vehicle"
          : "Add to waiting queue";
    description =
      kind === "park"
        ? "Confirm a suitable parking space for this vehicle."
        : kind === "add"
          ? "Register a vehicle in the demo workspace."
          : "Vehicles are served in first-in-first-out order.";
    content = (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const vehicle = { registration, type, owner, contact };
          const success = execute(
            kind === "park"
              ? { kind: "park", vehicle, slotId: selected, queueId: modal.queueId }
              : kind === "add"
                ? { kind: "addVehicle", vehicle }
                : { kind: "enqueue", vehicle },
          );
          if (success) close();
        }}
        className="space-y-5"
      >
        <div className="form-grid">
          <Field label="Registration number">
            <input
              className="control uppercase"
              placeholder="KA01AB1234"
              required
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
            />
          </Field>
          <Field label="Vehicle type">
            <select
              className="control"
              value={type}
              onChange={(e) => {
                const value = vehicleTypes.find((t) => t === e.target.value);
                if (value) {
                  setType(value);
                  setSlotId("");
                }
              }}
            >
              {vehicleTypes
                .filter((t) => data.settings.supportedTypes.includes(t))
                .map((t) => (
                  <option key={t}>{t}</option>
                ))}
            </select>
          </Field>
          <Field label="Owner name">
            <input
              className="control"
              placeholder="Full name"
              required
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            />
          </Field>
          <Field label="Contact number">
            <input
              className="control"
              type="tel"
              placeholder="9876543210"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </Field>
        </div>
        {kind === "park" && (
          <>
            <Field label="Parking slot">
              <select
                className="control"
                value={selected}
                onChange={(e) => setSlotId(e.target.value)}
                disabled={!slots.length}
              >
                {!slots.length && <option>No suitable available slots</option>}
                {slots.map((s, i) => (
                  <option key={s.id} value={s.id}>
                    {s.id} · Zone {s.zone}
                    {i === 0 ? " · Recommended" : ""}
                  </option>
                ))}
              </select>
            </Field>
            <div className="notice">
              <Info />
              {slots.length
                ? `${slots.length} suitable slots available. ${slots[0]?.id} is the next available slot by slot order.`
                : "No suitable slots are available. Add this vehicle to the waiting queue instead."}
            </div>
            {!slots.length && (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  open({ kind: "queue", vehicle: { id: "", registration, type, owner, contact } })
                }
              >
                Add to waiting queue
              </Button>
            )}
          </>
        )}
        <div className="modal-actions">
          <Button type="button" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" disabled={kind === "park" && !selected}>
            <CheckCircle2 />
            {kind === "park" ? "Confirm parking" : kind === "add" ? "Add vehicle" : "Join queue"}
          </Button>
        </div>
      </form>
    );
  } else if (modal?.kind === "exit") {
    title = "Remove vehicle";
    description = "Confirm the exit to release its parking slot and save the session.";
    const active = activeSessions(data).filter((s) =>
      s.registration.includes(search.toUpperCase()),
    );
    const session = data.sessions.find((s) => s.id === sessionId && !s.exit);
    content = (
      <div className="space-y-5">
        {!modal.sessionId && (
          <>
            <Field label="Find parked vehicle">
              <input
                className="control"
                placeholder="Registration number"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Field>
            <Field label="Vehicle to remove">
              <select
                className="control"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
              >
                <option value="">Select a parked vehicle</option>
                {active.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.registration} · {s.slotId}
                  </option>
                ))}
              </select>
            </Field>
          </>
        )}
        {session && (
          <>
            <div className="notice">
              <LogOut />
              <span>
                <strong>{session.registration}</strong> is parked in{" "}
                <strong>{session.slotId}</strong>.<br />
                Parking duration: {duration(session.entry)}. The slot will become available.
              </span>
            </div>
            <dl className="detail-grid">
              <div>
                <dt>Entry date</dt>
                <dd>{formatDate(session.entry)}</dd>
              </div>
              <div>
                <dt>Entry time</dt>
                <dd>{formatTime(session.entry)}</dd>
              </div>
            </dl>
          </>
        )}
        <div className="modal-actions">
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!session}
            onClick={() => {
              if (execute({ kind: "exit", sessionId })) close();
            }}
          >
            <LogOut />
            Confirm exit
          </Button>
        </div>
      </div>
    );
  } else if (modal?.kind === "details") {
    const v = data.vehicles.find((v) => v.id === modal.vehicleId);
    title = v?.registration ?? "Vehicle details";
    description = "Vehicle information from demo records.";
    const session = data.sessions.find((s) => s.vehicleId === v?.id && !s.exit);
    const queue = data.queue.find((q) => q.vehicleId === v?.id);
    content = v ? (
      <div className="space-y-5">
        <StatusBadge status={session ? "parked" : queue ? "waiting" : "registered"} />
        <dl className="detail-grid">
          {[
            ["Owner", v.owner],
            ["Vehicle type", v.type],
            ["Contact", v.contact],
            ["Parking slot", session?.slotId ?? "Not assigned"],
            [
              "Entry time",
              session ? `${formatDate(session.entry)} · ${formatTime(session.entry)}` : "—",
            ],
            ["Parking duration", session ? duration(session.entry) : "—"],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="modal-actions">
          {session ? (
            <Button
              variant="destructive"
              onClick={() => open({ kind: "exit", sessionId: session.id })}
            >
              <LogOut />
              Remove vehicle
            </Button>
          ) : queue ? (
            <Button onClick={() => open({ kind: "park", vehicle: v, queueId: queue.id })}>
              Assign slot
            </Button>
          ) : (
            <Button onClick={() => open({ kind: "park", vehicle: v })}>
              <CarFront />
              Park vehicle
            </Button>
          )}
        </div>
      </div>
    ) : (
      <EmptyState title="Vehicle not found" />
    );
  } else if (modal?.kind === "slot") {
    const slot = data.slots.find((s) => s.id === modal.slotId);
    title = `Slot ${slot?.id ?? ""}`;
    description = `Zone ${slot?.zone ?? ""} · Parking space details`;
    const session = data.sessions.find((s) => s.slotId === slot?.id && !s.exit);
    const v = data.vehicles.find((v) => v.id === session?.vehicleId);
    content = slot ? (
      <div className="space-y-5">
        <StatusBadge status={slot.status} />
        <dl className="detail-grid">
          <div>
            <dt>Assigned vehicle</dt>
            <dd>{v?.registration ?? "None"}</dd>
          </div>
          <div>
            <dt>Owner</dt>
            <dd>{v?.owner ?? "—"}</dd>
          </div>
          <div>
            <dt>Entry time</dt>
            <dd>{session ? formatTime(session.entry) : "—"}</dd>
          </div>
          <div>
            <dt>Supported types</dt>
            <dd>{slot.types.join(", ")}</dd>
          </div>
        </dl>
        {slot.status !== "occupied" && (
          <Field label="Slot status">
            <select
              className="control"
              value={slot.status}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "available" || value === "reserved" || value === "maintenance")
                  execute({ kind: "slot", slotId: slot.id, status: value });
              }}
            >
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Under maintenance</option>
            </select>
          </Field>
        )}
        <div className="modal-actions">
          <Button variant="outline" onClick={close}>
            Close
          </Button>
          {slot.status === "available" && (
            <Button onClick={() => open({ kind: "park", slotId: slot.id })}>
              <CarFront />
              Park vehicle
            </Button>
          )}
          {session && (
            <Button
              variant="destructive"
              onClick={() => open({ kind: "exit", sessionId: session.id })}
            >
              <LogOut />
              Release slot
            </Button>
          )}
        </div>
      </div>
    ) : null;
  } else if (modal?.kind === "undo") {
    title = "Undo last action?";
    description = "This restores the demo state immediately before the latest action.";
    const last = undoHistory.at(-1);
    content = (
      <div className="space-y-5">
        <div className="notice">
          <Undo2 />
          {last?.description ?? "No supported actions to undo."}
        </div>
        <p className="text-xs text-muted-foreground">
          Vehicles, slots, queue and parking records will be restored together. Each action can only
          be undone once.
        </p>
        <div className="modal-actions">
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button
            disabled={!last}
            onClick={() => {
              if (undo()) close();
            }}
          >
            <Undo2 />
            Confirm undo
          </Button>
        </div>
      </div>
    );
  } else if (modal?.kind === "dequeue") {
    title = "Remove from waiting queue?";
    description = "This vehicle will no longer be waiting for a parking slot.";
    content = (
      <div className="modal-actions">
        <Button variant="outline" onClick={close}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            if (execute({ kind: "dequeue", queueId: modal.queueId })) close();
          }}
        >
          Confirm removal
        </Button>
      </div>
    );
  } else if (modal?.kind === "search") {
    title = "Find a vehicle";
    description = "Search registration numbers in your demo records.";
    const matches = search.trim()
      ? data.vehicles.filter((v) =>
          v.registration.includes(search.toUpperCase().replace(/[^A-Z0-9]/g, "")),
        )
      : [];
    content = (
      <div className="space-y-4">
        <Field label="Vehicle registration">
          <input
            autoFocus
            className="control"
            placeholder="KA01AB1234"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Field>
        {matches.map((v) => (
          <Button
            key={v.id}
            variant="outline"
            className="w-full justify-between"
            onClick={() => open({ kind: "details", vehicleId: v.id })}
          >
            {v.registration}
            <span className="text-muted-foreground text-xs">{v.owner}</span>
          </Button>
        ))}
        {search && !matches.length && (
          <EmptyState
            title="No matching vehicle"
            message="Check the registration number and try again."
          />
        )}
        <Button variant="ghost" onClick={() => setSearch("")} disabled={!search}>
          Clear search
        </Button>
      </div>
    );
  }
  return (
    <Dialog
      open={!!modal}
      onOpenChange={(value) => {
        if (!value) close();
      }}
    >
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        {content}
      </DialogContent>
    </Dialog>
  );
}
