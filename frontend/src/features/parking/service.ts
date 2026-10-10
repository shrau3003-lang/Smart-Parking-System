import {
  vehicleTypes,
  type ParkingState,
  type ParkingData,
  type ParkingCommand,
  type Vehicle,
  type VehicleType,
  type Activity,
} from "./models";
const key = "smartpark-demo-v1";
const id = () => crypto.randomUUID();
export const normalizeRegistration = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, "");
export const activeSessions = (data: ParkingData) => data.sessions.filter((s) => !s.exit);
export const suitableSlots = (data: ParkingData, type: VehicleType) =>
  data.slots
    .filter((s) => s.status === "available" && s.types.includes(type))
    .sort((a, b) => a.id.localeCompare(b.id));
export function validateVehicle(vehicle: Omit<Vehicle, "id">) {
  if (!/^[A-Z0-9]{5,15}$/.test(normalizeRegistration(vehicle.registration)))
    throw new Error("Enter a registration number with 5–15 letters or numbers.");
  if (!vehicle.owner.trim()) throw new Error("Owner name is required.");
  if (!/^[+\d\s()-]{7,18}$/.test(vehicle.contact) || vehicle.contact.replace(/\D/g, "").length < 7)
    throw new Error("Enter a valid contact number.");
  if (!vehicleTypes.includes(vehicle.type)) throw new Error("Select a supported vehicle type.");
}
export function createDemoState(now = new Date()): ParkingState {
  const stamp = (hours: number) => new Date(now.getTime() - hours * 3600000).toISOString();
  const slots = ["A", "B", "C"].flatMap((zone) =>
    Array.from({ length: 16 }, (_, i) => ({
      id: `${zone}${String(i + 1).padStart(2, "0")}`,
      zone,
      status:
        i < 8
          ? ("occupied" as const)
          : i === 12 || i === 13
            ? zone === "C"
              ? ("maintenance" as const)
              : ("reserved" as const)
            : ("available" as const),
      types:
        zone === "A"
          ? (["Car", "SUV"] as VehicleType[])
          : zone === "B"
            ? (["Bike", "Car"] as VehicleType[])
            : (["Electric Vehicle", "SUV", "Car"] as VehicleType[]),
    })),
  );
  const names = [
    "Aarav Sharma",
    "Priya Patel",
    "Rohan Mehta",
    "Ananya Singh",
    "Vikram Rao",
    "Sneha Iyer",
    "Arjun Nair",
    "Diya Shah",
  ];
  const vehicles: Vehicle[] = Array.from({ length: 27 }, (_, i) => ({
    id: `v${i}`,
    registration: `KA${i % 2 ? "05" : "01"}${["MN", "AB", "CD"][i % 3]}${String(1234 + i * 173).slice(-4)}`,
    type:
      i < 8
        ? i % 3 === 0
          ? "SUV"
          : "Car"
        : i < 16
          ? i % 2
            ? "Bike"
            : "Car"
          : i < 24
            ? i % 3
              ? "Electric Vehicle"
              : "SUV"
            : (vehicleTypes[i % 4] ?? "Car"),
    owner: names[i % names.length] ?? "Demo Owner",
    contact: `98765${String(43210 + i).padStart(5, "0")}`,
  }));
  const sessions = slots
    .filter((s) => s.status === "occupied")
    .map((s, i) => {
      const v = vehicles[i];
      if (!v) throw new Error("Demo vehicle missing");
      return {
        id: `active${i}`,
        vehicleId: v.id,
        registration: v.registration,
        type: v.type,
        slotId: s.id,
        entry: stamp(0.3 + i * 0.14),
      };
    });
  const completed = Array.from({ length: 84 }, (_, i) => {
    const v = vehicles[i % 24];
    const slot = slots[i % 48];
    if (!v || !slot) throw new Error("Demo session data missing");
    const entry = stamp(5 + i * 1.8);
    return {
      id: `history${i}`,
      vehicleId: v.id,
      registration: v.registration,
      type: v.type,
      slotId: slot.id,
      entry,
      exit: new Date(new Date(entry).getTime() + (35 + (i % 8) * 19) * 60000).toISOString(),
    };
  });
  const activities: Activity[] = sessions
    .slice(0, 7)
    .map((s) => ({
      id: `activity${s.id}`,
      kind: "park",
      description: `${s.registration} parked in ${s.slotId}`,
      registration: s.registration,
      slotId: s.slotId,
      timestamp: s.entry,
    }));
  return {
    data: {
      slots,
      vehicles,
      sessions: [...sessions, ...completed],
      queue: vehicles
        .slice(24)
        .map((v, i) => ({ id: `q${i}`, vehicleId: v.id, arrival: stamp(0.7 - i * 0.15) })),
      activities,
      settings: {
        lotName: "Campus Central Parking",
        adminName: "Shravani",
        adminEmail: "admin@smartpark.demo",
        supportedTypes: [...vehicleTypes],
      },
    },
    undo: [],
  };
}
export function applyCommand(
  state: ParkingState,
  command: ParkingCommand,
  now = new Date().toISOString(),
): ParkingState {
  const data: ParkingData = structuredClone(state.data);
  let kind: Activity["kind"] = "vehicle";
  let description = "";
  let registration: string | undefined;
  let slotId: string | undefined;
  const getVehicle = (input: Omit<Vehicle, "id">) => {
    validateVehicle(input);
    if (!data.settings.supportedTypes.includes(input.type))
      throw new Error("This vehicle type is disabled in settings.");
    const normalized = normalizeRegistration(input.registration);
    const existing = data.vehicles.find(
      (v) => normalizeRegistration(v.registration) === normalized,
    );
    const value = {
      ...input,
      registration: normalized,
      owner: input.owner.trim(),
      contact: input.contact.trim(),
      id: existing?.id ?? id(),
    };
    if (existing) data.vehicles = data.vehicles.map((v) => (v.id === existing.id ? value : v));
    else data.vehicles.push(value);
    return value;
  };
  if (command.kind === "park") {
    const vehicle = getVehicle(command.vehicle);
    registration = vehicle.registration;
    if (activeSessions(data).some((s) => s.registration === registration))
      throw new Error("This vehicle is already parked.");
    const slot = data.slots.find((s) => s.id === command.slotId);
    if (!slot || slot.status !== "available")
      throw new Error("This slot is not available. Choose another slot.");
    if (!slot.types.includes(vehicle.type))
      throw new Error("Choose a slot suitable for this vehicle type.");
    const queued = data.queue.find((q) => q.vehicleId === vehicle.id);
    if (queued) {
      const eligible = data.queue.find((q) => {
        const v = data.vehicles.find((v) => v.id === q.vehicleId);
        return v && suitableSlots(data, v.type).length > 0;
      });
      if (eligible?.id !== queued.id)
        throw new Error("Serve the next eligible vehicle first (FIFO).");
      if (command.queueId !== queued.id)
        throw new Error("Assign this vehicle from the waiting queue.");
    }
    slot.status = "occupied";
    slotId = slot.id;
    data.sessions.unshift({
      id: id(),
      vehicleId: vehicle.id,
      registration: vehicle.registration,
      type: vehicle.type,
      slotId: slot.id,
      entry: now,
    });
    data.queue = data.queue.filter((q) => q.vehicleId !== vehicle.id);
    kind = "park";
    description = `${registration} parked in ${slot.id}`;
  } else if (command.kind === "exit") {
    const session = data.sessions.find((s) => s.id === command.sessionId && !s.exit);
    if (!session) throw new Error("This parking session has already ended.");
    const slot = data.slots.find((s) => s.id === session.slotId);
    if (!slot) throw new Error("Assigned slot could not be found.");
    session.exit = now;
    slot.status = "available";
    registration = session.registration;
    slotId = slot.id;
    kind = "exit";
    description = `${registration} exited ${slot.id}`;
  } else if (command.kind === "addVehicle") {
    if (
      data.vehicles.some(
        (v) =>
          normalizeRegistration(v.registration) ===
          normalizeRegistration(command.vehicle.registration),
      )
    )
      throw new Error("This vehicle is already registered.");
    const v = getVehicle(command.vehicle);
    registration = v.registration;
    description = `${registration} registered`;
  } else if (command.kind === "enqueue") {
    const v = getVehicle(command.vehicle);
    if (activeSessions(data).some((s) => s.vehicleId === v.id))
      throw new Error("This vehicle is already parked.");
    if (data.queue.some((q) => q.vehicleId === v.id))
      throw new Error("This vehicle is already in the queue.");
    data.queue.push({ id: id(), vehicleId: v.id, arrival: now });
    registration = v.registration;
    kind = "queue";
    description = `${registration} joined the waiting queue`;
  } else if (command.kind === "dequeue") {
    const q = data.queue.find((q) => q.id === command.queueId);
    if (!q) throw new Error("Queue entry no longer exists.");
    registration = data.vehicles.find((v) => v.id === q.vehicleId)?.registration;
    data.queue = data.queue.filter((q) => q.id !== command.queueId);
    kind = "queue";
    description = `${registration} removed from the queue`;
  } else if (command.kind === "slot") {
    const slot = data.slots.find((s) => s.id === command.slotId);
    if (!slot || slot.status === "occupied")
      throw new Error("Release the vehicle before changing this slot.");
    slot.status = command.status;
    slotId = slot.id;
    kind = "slot";
    description = `${slot.id} marked ${command.status}`;
  } else {
    if (
      !command.settings.lotName.trim() ||
      !command.settings.adminName.trim() ||
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(command.settings.adminEmail)
    )
      throw new Error("Enter a lot name, administrator name and valid email.");
    if (!command.settings.supportedTypes.length)
      throw new Error("At least one vehicle type is required.");
    if (
      !Number.isInteger(command.slotsPerZone) ||
      command.slotsPerZone < 1 ||
      command.slotsPerZone > 50
    )
      throw new Error("Choose 1–50 slots per zone.");
    if (
      !command.zones.length ||
      new Set(command.zones).size !== command.zones.length ||
      command.zones.some((z) => !/^[A-Z]{1,3}$/.test(z))
    )
      throw new Error("Use unique zone names with 1–3 letters.");
    const removed = data.slots.filter(
      (s) =>
        !command.zones.includes(s.zone) || Number(s.id.slice(s.zone.length)) > command.slotsPerZone,
    );
    if (removed.some((s) => s.status !== "available"))
      throw new Error(
        "Only available slots can be removed. Release occupied, reserved or maintenance slots first.",
      );
    data.slots = command.zones.flatMap((zone) =>
      Array.from({ length: command.slotsPerZone }, (_, i) => {
        const slotId = `${zone}${String(i + 1).padStart(2, "0")}`;
        return (
          data.slots.find((s) => s.id === slotId) ?? {
            id: slotId,
            zone,
            status: "available" as const,
            types: [...command.settings.supportedTypes],
          }
        );
      }),
    );
    data.settings = command.settings;
    kind = "settings";
    description = "Demo parking settings updated";
  }
  const activity = { id: id(), kind, description, timestamp: now, registration, slotId };
  data.activities.unshift(activity);
  return {
    data,
    undo: [
      ...state.undo,
      { id: activity.id, description, timestamp: now, previous: state.data },
    ].slice(-25),
  };
}
export function undoLast(state: ParkingState): ParkingState {
  const last = state.undo.at(-1);
  if (!last) throw new Error("There are no more actions to undo.");
  return { data: structuredClone(last.previous), undo: state.undo.slice(0, -1) };
}
export const parkingService = {
  load(): ParkingState {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          Array.isArray(parsed?.data?.slots) &&
          Array.isArray(parsed?.data?.sessions) &&
          Array.isArray(parsed?.undo)
        )
          return parsed;
      }
    } catch {
      /* recover corrupted demo storage */
    }
    return createDemoState();
  },
  save(state: ParkingState) {
    localStorage.setItem(key, JSON.stringify(state));
  },
  execute: applyCommand,
  undo: undoLast,
};
export const formatTime = (stamp: string) =>
  new Date(stamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
export const formatDate = (stamp: string) =>
  new Date(stamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
export const duration = (entry: string, exit = new Date().toISOString()) => {
  const mins = Math.max(
    0,
    Math.floor((new Date(exit).getTime() - new Date(entry).getTime()) / 60000),
  );
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
};
