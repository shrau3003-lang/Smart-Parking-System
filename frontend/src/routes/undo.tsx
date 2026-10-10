import { createFileRoute } from "@tanstack/react-router";
import { UndoActivity } from "@/components/smartpark/undo";
import { pageHead } from "@/features/parking/metadata";
export const Route = createFileRoute("/undo")({
  head: () =>
    pageHead(
      "Undo Activity",
      "Review SmartPark parking activity and safely undo the latest supported demonstration operation.",
    ),
  component: UndoActivity,
});
