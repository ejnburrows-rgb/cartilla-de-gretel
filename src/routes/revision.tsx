import { createFileRoute } from "@tanstack/react-router";
import { OwnerReviewHub } from "@/components/review/OwnerReviewHub";

export const Route = createFileRoute("/revision")({
  component: OwnerReviewHub,
  head: () => ({
    meta: [{ title: "Owner review — La Cartilla de Gretel" }, { name: "robots", content: "noindex" }],
  }),
});
