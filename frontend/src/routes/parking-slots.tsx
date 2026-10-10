import { createFileRoute } from "@tanstack/react-router";
import { ParkingSlots } from "@/components/smartpark/slots";
import { pageHead } from "@/features/parking/metadata";
export const Route = createFileRoute("/parking-slots")({
  head: () =>
    pageHead(
      "Parking Slots",
      "Explore SmartPark parking zones and manage available, occupied, reserved and maintenance spaces.",
    ),
  component: ParkingSlots,
});
