import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MODELS = [
  { name: "Voor", label: "Huidige situatie", src: "https://nextcloud.eaxj.nl/s/Dyk8jAxw4LQ5DiF/download" },
  { name: "Na", label: "Nieuwe situatie", src: "https://nextcloud.eaxj.nl/s/BgQCQLsEWy3JQY6/download" },
];

// A-Frame + AR.js zijn web components; we registreren ze als generieke JSX tags
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "a-scene": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, unknown>;
      "a-marker": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, unknown>;
      "a-entity": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, unknown>;
      "a-camera": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, unknown>;
    }
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;
    if (existingScript) {
      if (existingScript.getAttribute("data-loaded") === "true") {
        resolve();
      } else {
        existingScript.addEventListener("load", () => resolve());
        existingScript.addEventListener("error", () => reject(new Error(`Kon script niet laden: ${src}`)));
      }
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => {
      s.setAttribute("data-loaded", "true");
      resolve();
    };
    s.onerror = () => reject(new Error(`Kon script niet laden: ${src}`));
    document.head.appendChild(s);
  });
}

export function ARViewer() {
  const [index, setIndex] = useState(0);
  const [arReady, setArReady] = useState(false);
  const [arActive, setArActive] = useState(false);
  const entityRef = useRef<HTMLElement | null>(null);

  // Laad A-Frame + AR.js zodra de gebruiker AR start
  useEffect(() => {
    if (!arActive || arReady) return;
    let cancelled = false;
    (async () => {
      try {
        await loadScript("https://aframe.io/releases/1.5.0/aframe.min.js");
        await loadScript(
          "https://raw.githack.com/AR-js-org/AR.js/3.4.5/aframe/build/aframe-ar.js",
        );
        if (!cancelled) setArReady(true);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [arActive, arReady]);

  // Wissel het model in AR door het gltf-model attribuut te updaten
  useEffect(() => {
    if (!arReady || !entityRef.current) return;
    entityRef.current.setAttribute("gltf-model", MODELS[index].src);
  }, [index, arReady]);

  const current = MODELS[index];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          AR Voor / Na Viewer
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Marker-based AR met AR.js + A-Frame. Werkt op iOS Safari en Android Chrome.
        </p>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4 sm:p-6">
        {!arActive ? (
          <div className="w-full max-w-2xl space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Zo werkt het</h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                <li>
                  Print of toon de <strong>Hiro-marker</strong> op een ander scherm:{" "}
                  <a
                    href="https://stemkoski.github.io/AR-Examples/markers/hiro.png"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    download Hiro-marker
                  </a>
                </li>
                <li>Tik op "Start AR" en geef toegang tot je camera.</li>
                <li>Richt de camera op de marker — het 3D-model verschijnt erbovenop.</li>
                <li>Wissel met de Voor/Na-knoppen tijdens de AR-sessie.</li>
              </ol>
            </div>
            <button
              onClick={() => setArActive(true)}
              className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Start AR
            </button>
            <p className="text-xs text-muted-foreground">
              Let op: AR.js vereist <strong>HTTPS</strong> (camera-toegang). Op
              localhost werkt het ook.
            </p>
          </div>
        ) : (
          <div className="relative h-[80vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-black shadow-sm">
            {!arReady ? (
              <div className="flex h-full items-center justify-center text-white/80">
                AR-bibliotheek laden…
              </div>
            ) : (
              <a-scene
                embedded
                vr-mode-ui="enabled: false"
                renderer="logarithmicDepthBuffer: true; antialias: true; alpha: true"
                arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3"
                style={{ width: "100%", height: "100%" }}
              >
                <a-marker preset="hiro">
                  <a-entity
                    ref={entityRef as React.Ref<HTMLElement>}
                    gltf-model={current.src}
                    scale="0.5 0.5 0.5"
                    position="0 0 0"
                    rotation="0 0 0"
                  />
                </a-marker>
                <a-entity camera />
              </a-scene>
            )}

            {/* Voor/Na toggle — werkt live in AR */}
            <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center">
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

            <button
              onClick={() => {
                setArActive(false);
                setArReady(false);
                // Volledige reload is de schoonste manier om AR.js' camera-stream op te ruimen
                setTimeout(() => window.location.reload(), 50);
              }}
              className="absolute bottom-4 right-4 z-10 rounded-md bg-background/90 px-4 py-2 text-sm font-medium text-foreground shadow backdrop-blur"
            >
              Stop AR
            </button>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Weergave:{" "}
          <span className="font-medium text-foreground">{current.label}</span>
        </p>
      </main>
    </div>
  );
}
