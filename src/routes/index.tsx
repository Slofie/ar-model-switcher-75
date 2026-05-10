import { createFileRoute } from "@tanstack/react-router";
import { ARViewer } from "@/components/ARViewer";

export const Route = createFileRoute("/")({
  component: ARViewer,
  head: () => ({
    meta: [
      { title: "AR Model Viewer" },
      {
        name: "description",
        content:
          "Bekijk 3D GLB-modellen in augmented reality en wissel met één knop tussen modellen.",
      },
    ],
  }),
});
