export const vehicleTypes = ["Car", "Bike", "SUV", "Electric Vehicle"] as const;
export type VehicleType = (typeof vehicleTypes)[number];
export type SlotStatus = "available" | "occupied" | "reserved" | "maintenance";
export interface ParkingSlot {
  id: string;
  zone: string;
  status: SlotStatus;
  types: VehicleType[];
}
export interface Vehicle {
  id: string;
  registration: string;
  type: VehicleType;
  owner: string;
  contact: string;
}
export interface ParkingSession {
  id: string;
  vehicleId: string;
  registration: string;
  type: VehicleType;
  slotId: string;
  entry: string;
  exit?: string | undefined;
}
export interface QueueEntry {
  id: string;
  vehicleId: string;
  arrival: string;
}
export interface Activity {
  id: string;
  kind: "park" | "exit" | "queue" | "vehicle" | "slot" | "settings";
  description: string;
  timestamp: string;
  registration?: string | undefined;
  slotId?: string | undefined;
}
export interface Settings {
  lotName: string;
  adminName: string;
  adminEmail: string;
  supportedTypes: VehicleType[];
}
export interface ParkingData {
  slots: ParkingSlot[];
  vehicles: Vehicle[];
  sessions: ParkingSession[];
  queue: QueueEntry[];
  activities: Activity[];
  settings: Settings;
}
export interface UndoEntry {
  id: string;
  description: string;
  timestamp: string;
  previous: ParkingData;
}
export interface ParkingState {
  data: ParkingData;
  undo: UndoEntry[];
}
export type ParkingCommand =
  | { kind: "park"; vehicle: Omit<Vehicle, "id">; slotId: string; queueId?: string | undefined }
  | { kind: "exit"; sessionId: string }
  | { kind: "addVehicle"; vehicle: Omit<Vehicle, "id"> }
  | { kind: "enqueue"; vehicle: Omit<Vehicle, "id"> }
  | { kind: "dequeue"; queueId: string }
  | { kind: "slot"; slotId: string; status: Exclude<SlotStatus, "occupied"> }
  | { kind: "settings"; settings: Settings; zones: string[]; slotsPerZone: number };
