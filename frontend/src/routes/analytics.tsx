import { createFileRoute } from "@tanstack/react-router";
import { Analytics } from "@/components/smartpark/analytics";
import { pageHead } from "@/features/parking/metadata";
export const Route = createFileRoute("/analytics")({
  head: () =>
    pageHead(
      "Parking Analytics",
      "Explore SmartPark occupancy trends, vehicle categories and session analytics from demo records.",
    ),
  component: Analytics,
});
