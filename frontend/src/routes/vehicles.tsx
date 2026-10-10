import { createFileRoute } from "@tanstack/react-router";
import { Vehicles } from "@/components/smartpark/vehicles";
import { pageHead } from "@/features/parking/metadata";
export const Route = createFileRoute("/vehicles")({
  head: () =>
    pageHead(
      "Vehicle Management",
      "Search and manage registered vehicles and demo parking assignments in SmartPark.",
    ),
  component: Vehicles,
});
