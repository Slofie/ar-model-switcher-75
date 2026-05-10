import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const MODELS = [
  {
    name: "Astronaut",
    src: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    poster: "https://modelviewer.dev/shared-assets/models/Astronaut.webp",
  },
  {
    name: "Horse",
    src: "https://modelviewer.dev/shared-assets/models/Horse.glb",
    poster: "",
  },
];

type ModelViewerProps = React.HTMLAttributes<HTMLElement> & {
  src?: string;
  ar?: boolean;
  "ar-modes"?: string;
  "camera-controls"?: boolean;
  "touch-action"?: string;
  "shadow-intensity"?: string;
  poster?: string;
  alt?: string;
  "auto-rotate"?: boolean;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerProps;
    }
  }
}

export function ARViewer() {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    import("@google/model-viewer").then(() => setLoaded(true));
  }, []);

  const current = MODELS[index];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          AR Model Viewer
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bekijk 3D-modellen en plaats ze in jouw ruimte met AR.
        </p>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {loaded ? (
            <model-viewer
              key={current.src}
              src={current.src}
              poster={current.poster}
              alt={current.name}
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              touch-action="pan-y"
              auto-rotate
              shadow-intensity="1"
              style={{ width: "100%", height: "70vh", background: "transparent" }}
            />
          ) : (
            <div className="flex h-[70vh] items-center justify-center text-muted-foreground">
              Laden…
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Huidig model: <span className="font-medium text-foreground">{current.name}</span>
          </p>
          <Button
            size="lg"
            onClick={() => setIndex((i) => (i + 1) % MODELS.length)}
          >
            Wissel naar {MODELS[(index + 1) % MODELS.length].name}
          </Button>
          <p className="max-w-md text-center text-xs text-muted-foreground">
            Tik op de AR-knop in de hoek van het model (op een telefoon) om het
            model in jouw ruimte te plaatsen.
          </p>
        </div>
      </main>
    </div>
  );
}
