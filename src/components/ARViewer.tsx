import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MODELS = [
  {
    name: "Voor",
    label: "Huidige situatie",
    src: "/models/model1.glb",
    iosSrc: "/models/model1.usdz", // optioneel; valt terug op auto-conversie als afwezig
  },
  {
    name: "Na",
    label: "Nieuwe situatie",
    src: "/models/model2.glb",
    iosSrc: "/models/model2.usdz",
  },
];

type ModelViewerProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
  src?: string;
  "ios-src"?: string;
  ar?: boolean;
  "ar-modes"?: string;
  "ar-scale"?: string;
  "ar-placement"?: string;
  "camera-controls"?: boolean;
  "touch-action"?: string;
  "shadow-intensity"?: string;
  "auto-rotate"?: boolean;
  exposure?: string;
  alt?: string;
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          AR Voor / Na Viewer
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vergelijk de huidige en nieuwe situatie in jouw ruimte.
        </p>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4 sm:p-6">
        <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {loaded ? (
            <model-viewer
              ref={viewerRef as React.Ref<HTMLElement>}
              key={current.src}
              src={current.src}
              ios-src={current.iosSrc}
              alt={current.label}
              ar
              ar-modes="webxr scene-viewer quick-look"
              ar-scale="fixed"
              ar-placement="floor"
              camera-controls
              touch-action="pan-y"
              auto-rotate
              shadow-intensity="1"
              exposure="1"
              style={{ width: "100%", height: "70vh", background: "transparent" }}
            >
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

          {/* Voor/Na toggle bovenop het model — werkt buiten AR */}
          <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
            <div className="pointer-events-auto inline-flex rounded-full border border-border bg-background/90 p-1 shadow-md backdrop-blur">
              {MODELS.map((m, i) => (
                <button
                  key={m.name}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                    i === index
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-pressed={i === index}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-muted-foreground">
            Weergave:{" "}
            <span className="font-medium text-foreground">{current.label}</span>
          </p>
          <p className="max-w-md text-xs text-muted-foreground">
            Wisselen op de pagina is direct. In AR op iPhone (Quick Look) is
            wisselen tijdens de sessie technisch niet mogelijk: verlaat AR,
            tik op Voor/Na en open AR opnieuw. Op Android (Scene Viewer /
            WebXR) kan het model wél in AR worden gewisseld via deze knoppen.
          </p>
        </div>
      </main>
    </div>
  );
}
