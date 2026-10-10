import { createFileRoute } from "@tanstack/react-router";
import { ParkingHistory } from "@/components/smartpark/history";
import { pageHead } from "@/features/parking/metadata";
export const Route = createFileRoute("/history")({
  head: () =>
    pageHead(
      "Parking History",
      "Browse completed SmartPark parking sessions and export filtered demonstration records.",
    ),
  component: ParkingHistory,
});
