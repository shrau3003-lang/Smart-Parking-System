import { describe, expect, it } from "vitest";
import {
  createDemoState,
  applyCommand,
  undoLast,
  activeSessions,
  suitableSlots,
} from "@/features/parking/service";
import type { Vehicle, ParkingState } from "@/features/parking/models";
const vehicle: Omit<Vehicle, "id"> = {
  registration: "KA01XY9999",
  type: "Car",
  owner: "Test Owner",
  contact: "9876543210",
};
const initial = () => createDemoState(new Date("2026-10-10T13:12:00Z"));
const park = (state: ParkingState) =>
  applyCommand(state, { kind: "park", vehicle, slotId: "A09" }, "2026-10-10T13:12:00Z");
describe("SmartPark parking rules", () => {
  it("parks in an available slot and synchronizes active sessions", () => {
    const next = park(initial());
    expect(next.data.slots.find((s) => s.id === "A09")?.status).toBe("occupied");
    expect(activeSessions(next.data)).toHaveLength(25);
    expect(next.data.sessions[0]?.registration).toBe("KA01XY9999");
  });
  for (const [slotId, status] of [
    ["A01", "occupied"],
    ["A13", "reserved"],
    ["C13", "maintenance"],
  ])
    it(`prevents parking in a ${status} slot`, () => {
      expect(() =>
        applyCommand(initial(), { kind: "park", vehicle, slotId: slotId ?? "" }),
      ).toThrow("not available");
    });
  it("prevents duplicate active registration including alternate formatting", () => {
    const next = park(initial());
    expect(() =>
      applyCommand(next, {
        kind: "park",
        vehicle: { ...vehicle, registration: "ka-01-xy-9999" },
        slotId: "A10",
      }),
    ).toThrow("already parked");
  });
  it("prevents incompatible slot assignment", () => {
    expect(() =>
      applyCommand(initial(), {
        kind: "park",
        vehicle: { ...vehicle, type: "Bike" },
        slotId: "A09",
      }),
    ).toThrow("suitable");
  });
  it("exit releases the slot and preserves the completed session with exit time", () => {
    const parked = park(initial());
    const session = parked.data.sessions[0];
    if (!session) throw new Error("Missing session");
    const next = applyCommand(
      parked,
      { kind: "exit", sessionId: session.id },
      "2026-10-10T14:12:00Z",
    );
    expect(next.data.slots.find((s) => s.id === "A09")?.status).toBe("available");
    expect(next.data.sessions.find((s) => s.id === session.id)?.exit).toBe("2026-10-10T14:12:00Z");
    expect(activeSessions(next.data)).toHaveLength(24);
  });
  it("prevents repeated exit operations", () => {
    const parked = park(initial());
    const sessionId = parked.data.sessions[0]?.id;
    if (!sessionId) throw new Error("Missing session");
    const exited = applyCommand(parked, { kind: "exit", sessionId });
    expect(() => applyCommand(exited, { kind: "exit", sessionId })).toThrow("already ended");
  });
  it("serves next eligible queued vehicle in FIFO order", () => {
    const state = initial();
    const second = state.data.vehicles.find((v) => v.id === state.data.queue[1]?.vehicleId);
    if (!second) throw new Error("Seed vehicle missing");
    expect(() =>
      applyCommand(state, {
        kind: "park",
        vehicle: second,
        slotId: suitableSlots(state.data, second.type)[0]?.id ?? "",
        queueId: state.data.queue[1]?.id ?? "",
      }),
    ).toThrow("FIFO");
    const first = state.data.vehicles.find((v) => v.id === state.data.queue[0]?.vehicleId);
    if (!first) throw new Error("Seed vehicle missing");
    const next = applyCommand(state, {
      kind: "park",
      vehicle: first,
      slotId: suitableSlots(state.data, first.type)[0]?.id ?? "",
      queueId: state.data.queue[0]?.id ?? "",
    });
    expect(next.data.queue).toHaveLength(2);
    expect(next.data.queue[0]?.id).toBe(state.data.queue[1]?.id ?? "");
  });
  it("prevents duplicate waiting queue entries", () => {
    const state = applyCommand(initial(), { kind: "enqueue", vehicle });
    expect(() => applyCommand(state, { kind: "enqueue", vehicle })).toThrow("already in the queue");
  });
  it("restores exact prior state and consumes each undo once", () => {
    const state = initial();
    const next = undoLast(park(state));
    expect(next.data).toEqual(state.data);
    expect(next.undo).toHaveLength(0);
    expect(() => undoLast(next)).toThrow("no more actions");
  });
  it("restores an exited vehicle and occupied slot together", () => {
    const parked = park(initial());
    const exited = applyCommand(parked, {
      kind: "exit",
      sessionId: parked.data.sessions[0]?.id ?? "",
    });
    expect(undoLast(exited).data).toEqual(parked.data);
  });
  for (const slotsPerZone of [0, 51, 1.5])
    it(`rejects invalid slot count ${slotsPerZone}`, () => {
      const state = initial();
      expect(() =>
        applyCommand(state, {
          kind: "settings",
          settings: state.data.settings,
          zones: ["A", "B", "C"],
          slotsPerZone,
        }),
      ).toThrow("1–50");
    });
  it("requires at least one supported vehicle type", () => {
    const state = initial();
    expect(() =>
      applyCommand(state, {
        kind: "settings",
        settings: { ...state.data.settings, supportedTypes: [] },
        zones: ["A", "B", "C"],
        slotsPerZone: 16,
      }),
    ).toThrow("At least one");
  });
  it("refuses occupied zone removal from configuration", () => {
    const state = initial();
    expect(() =>
      applyCommand(state, {
        kind: "settings",
        settings: state.data.settings,
        zones: ["A", "B"],
        slotsPerZone: 16,
      }),
    ).toThrow("Only available");
  });
  it("rejects missing owner and invalid phone input", () => {
    expect(() =>
      applyCommand(initial(), { kind: "park", vehicle: { ...vehicle, owner: "" }, slotId: "A09" }),
    ).toThrow("Owner name");
    expect(() =>
      applyCommand(initial(), {
        kind: "park",
        vehicle: { ...vehicle, contact: "123" },
        slotId: "A09",
      }),
    ).toThrow("contact");
  });
});
