import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Maximize2, Info, Camera, AlertCircle } from "lucide-react";
import { createServerFn } from "@tanstack/react-start";
import { getModelProxy } from "@/lib/server-fns";

// Registreer model-viewer als een custom element voor TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": any;
    }
  }
}

const MODELS = [
  { 
    id: "voor", 
    name: "Voor", 
    label: "Huidige situatie", 
    src: "https://nextcloud.eaxj.nl/s/Dyk8jAxw4LQ5DiF/download",
    description: "De situatie zoals deze nu is, zonder aanpassingen."
  },
  { 
    id: "na", 
    name: "Na", 
    label: "Nieuwe situatie", 
    src: "https://nextcloud.eaxj.nl/s/BgQCQLsEWy3JQY6/download",
    description: "De geplande nieuwe situatie met alle verbeteringen toegepast."
  },
];

export function ARViewer() {
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [arSupported, setArSupported] = useState(false);
  const modelViewerRef = useRef<any>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    // Importeer de library dynamisch aan de client-side
    import("@google/model-viewer").catch(console.error);
    
    // Check of AR ondersteund wordt (basis check)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setArSupported(isMobile);

    // Haal de origin op voor absolute proxy URLs
    setOrigin(window.location.origin);
  }, []);

  const current = MODELS[index];
  
  // Bepaal de finale URL. Alleen Nextcloud links hebben de proxy nodig.
  // We gebruiken een absolute URL en voegen '.glb' toe aan het pad om iOS Quick Look te helpen.
  let proxyUrl = current.src;
  if (current.src.includes("nextcloud.eaxj.nl")) {
    const baseUrl = origin || "";
    proxyUrl = `${baseUrl}/api/proxy/model.glb?url=${encodeURIComponent(current.src)}`;
  }

  // Event listeners handmatig toevoegen aan de custom element (betrouwbaarder in React)
  useEffect(() => {
    const viewer = modelViewerRef.current;
    if (!viewer) return;

    const handleLoad = () => {
      console.log("Model geladen!");
      setLoading(false);
      setError(null);
    };

    const handleError = (event: any) => {
      console.error("Model viewer error:", event);
      setError("Het model kon niet worden geladen. Controleer of de link nog geldig is.");
      setLoading(false);
    };

    // Check of het model misschien al geladen was voordat de listener werd toegevoegd
    if (viewer.loaded) {
      handleLoad();
    }

    viewer.addEventListener("load", handleLoad);
    viewer.addEventListener("error", handleError);

    return () => {
      viewer.removeEventListener("load", handleLoad);
      viewer.removeEventListener("error", handleError);
    };
  }, [index, origin, proxyUrl]);

  const handleSelection = (i: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (i !== index) {
      setLoading(true);
      setError(null);
      setIndex(i);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Project Visualisatie
            </h1>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Augmented Reality Viewer
            </p>
          </div>
          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 px-3 py-1">
            v2.1 Stable
          </Badge>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* 3D Preview Sectie */}
          <div className="lg:col-span-8">
            <Card className="relative aspect-[4/3] w-full overflow-hidden border-none bg-gradient-to-b from-slate-100 to-slate-200 shadow-2xl md:aspect-square lg:aspect-[4/3]">
              {loading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100/50 backdrop-blur-sm">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="mt-4 text-sm font-medium text-slate-600">Model wordt geladen...</p>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 p-6 text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Oeps! Er ging iets mis</h3>
                  <p className="text-sm text-slate-600 mb-6 max-w-xs">{error}</p>
                  <Button onClick={(e) => { e.preventDefault(); setError(null); setLoading(true); }} variant="outline">
                    Probeer opnieuw
                  </Button>
                </div>
              )}
              
              <model-viewer
                ref={modelViewerRef}
                src={proxyUrl}
                ar
                ar-modes="webxr scene-viewer quick-look"
                camera-controls
                shadow-intensity="1"
                environment-image="neutral"
                auto-rotate
                exposure="1"
                interaction-prompt="auto"
                loading="eager"
                reveal="auto"
                powerPreference="high-performance"
                style={{ width: "100%", height: "100%", "--poster-color": "transparent" }}
              >
                {/* AR Start Button Customization */}
                <button
                  slot="ar-button"
                  type="button"
                  className="absolute bottom-6 right-6 flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  <Camera className="h-4 w-4" />
                  BEKIJK IN JE RUIMTE
                </button>
              </model-viewer>

              {/* Status Indicator */}
              <div className="absolute left-6 top-6 flex flex-col gap-2">
                <Badge className={cn(
                  "w-fit px-3 py-1 text-sm font-semibold shadow-sm",
                  index === 0 ? "bg-slate-700" : "bg-blue-600"
                )}>
                  {current.label}
                </Badge>
              </div>
            </Card>
          </div>

          {/* Controls Sectie */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Vergelijk Modellen</h2>
              <p className="text-sm leading-relaxed text-slate-500">
                Wissel tussen de huidige en nieuwe situatie om de impact van het project direct te zien.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {MODELS.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={(e) => handleSelection(i, e)}
                  className={cn(
                    "group relative flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all",
                    i === index
                      ? "border-primary bg-white shadow-md"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className={cn(
                      "text-sm font-bold uppercase tracking-tight",
                      i === index ? "text-primary" : "text-slate-500"
                    )}>
                      Optie {i + 1}: {m.name}
                    </span>
                    {i === index && (
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                  <span className="mt-1 text-base font-semibold text-slate-900">
                    {m.label}
                  </span>
                  <p className="mt-2 text-xs text-slate-500 leading-snug">
                    {m.description}
                  </p>
                </button>
              ))}
            </div>

            {!arSupported && (
              <Card className="border-amber-100 bg-amber-50 p-4 shadow-none">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm font-bold text-amber-900">AR Tips</p>
                    <p className="mt-1 text-xs leading-relaxed text-amber-800">
                      Open deze website op een iPhone of Android toestel om de modellen in Augmented Reality te plaatsen.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-slate-200 bg-white px-6 py-8 text-center">
        <p className="text-sm font-medium text-slate-400">
          © 2026 Visualisaties • CORS Proxy Actief
        </p>
      </footer>
    </div>
  );
}
