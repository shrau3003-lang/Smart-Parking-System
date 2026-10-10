import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { createDemoState, parkingService } from "./service";
import type { ParkingCommand, ParkingState, Vehicle } from "./models";
export type ModalState =
  | {
      kind: "park" | "add" | "queue";
      slotId?: string | undefined;
      vehicle?: Vehicle | undefined;
      queueId?: string | undefined;
    }
  | { kind: "exit"; sessionId?: string | undefined }
  | { kind: "details"; vehicleId: string }
  | { kind: "slot"; slotId: string }
  | { kind: "undo" }
  | { kind: "dequeue"; queueId: string }
  | { kind: "search" }
  | null;
interface Store {
  state: ParkingState;
  ready: boolean;
  modal: ModalState;
  open: (modal: ModalState) => void;
  execute: (command: ParkingCommand) => boolean;
  undo: () => boolean;
}
const Context = createContext<Store | undefined>(undefined);
export function ParkingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ParkingState>(() =>
    createDemoState(new Date("2026-10-10T13:12:00Z")),
  );
  const [ready, setReady] = useState(false);
  const [modal, open] = useState<ModalState>(null);
  const current = useRef(state);
  useEffect(() => {
    const loaded = parkingService.load();
    current.current = loaded;
    setState(loaded);
    setReady(true);
  }, []);
  const commit = (next: ParkingState) => {
    current.current = next;
    setState(next);
    try {
      parkingService.save(next);
    } catch {
      toast.error("Browser storage is full. This change will not survive a refresh.");
    }
  };
  const execute = (command: ParkingCommand) => {
    try {
      commit(parkingService.execute(current.current, command));
      toast.success("Demo updated successfully");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to complete action");
      return false;
    }
  };
  const undo = () => {
    try {
      commit(parkingService.undo(current.current));
      toast.success("Last action undone");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to undo");
      return false;
    }
  };
  return (
    <Context.Provider value={{ state, ready, modal, open, execute, undo }}>
      {children}
    </Context.Provider>
  );
}
export function useParking() {
  const context = useContext(Context);
  if (!context) throw new Error("ParkingProvider is required");
  return context;
}
