import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const MODELS = [
  {
    name: "Model 1",
    src: "/models/model1.glb",
  },
  {
    name: "Model 2",
    src: "/models/model2.glb",
  },
];

type ModelViewerProps = React.HTMLAttributes<HTMLElement> & {
  key?: React.Key;
  ref?: React.Ref<HTMLElement>;
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
  const viewerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    import("@google/model-viewer").then(() => setLoaded(true));
  }, []);

  const current = MODELS[index];
  const next = MODELS[(index + 1) % MODELS.length];

  const swap = () => setIndex((i) => (i + 1) % MODELS.length);

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
        <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {loaded ? (
            <model-viewer
              ref={viewerRef as React.Ref<HTMLElement>}
              src={current.src}
              alt={current.name}
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              touch-action="pan-y"
              auto-rotate
              shadow-intensity="1"
              style={{ width: "100%", height: "70vh", background: "transparent" }}
            >
              {/* Knop die zichtbaar is binnen WebXR AR-sessie */}
              <button
                slot="ar-button"
                className="absolute bottom-4 right-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow"
              >
                Bekijk in AR
              </button>
            </model-viewer>
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
          <Button size="lg" onClick={swap}>
            Wissel naar {next.name}
          </Button>
          <p className="max-w-md text-center text-xs text-muted-foreground">
            Tip: tijdens een WebXR AR-sessie blijft het model staan en kun je
            via deze knop wisselen. In Scene Viewer (Android) / Quick Look
            (iOS) is een custom knop in AR niet mogelijk — verlaat AR, wissel,
            en open AR opnieuw.
          </p>
        </div>
      </main>
    </div>
  );
}
