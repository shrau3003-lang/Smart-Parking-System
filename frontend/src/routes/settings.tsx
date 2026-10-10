import { createFileRoute } from "@tanstack/react-router";
import { ParkingSettings } from "@/components/smartpark/settings";
import { pageHead } from "@/features/parking/metadata";
export const Route = createFileRoute("/settings")({
  head: () =>
    pageHead(
      "Workspace Settings",
      "Configure SmartPark demo parking zones, supported vehicle types and administrator profile.",
    ),
  component: ParkingSettings,
});
