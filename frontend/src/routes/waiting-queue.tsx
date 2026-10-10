import { createFileRoute } from "@tanstack/react-router";
import { WaitingQueue } from "@/components/smartpark/queue";
import { pageHead } from "@/features/parking/metadata";
export const Route = createFileRoute("/waiting-queue")({
  head: () =>
    pageHead(
      "Waiting Queue",
      "Manage the SmartPark FIFO vehicle waiting queue and confirm suitable parking assignments.",
    ),
  component: WaitingQueue,
});
