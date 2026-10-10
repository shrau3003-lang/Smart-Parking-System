import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/smartpark/dashboard";
import { pageHead } from "@/features/parking/metadata";
export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Parking Dashboard",
      "SmartPark campus parking overview with demo occupancy, arrivals, departures and quick parking actions.",
    ),
  component: Dashboard,
});
