import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { 
  Loader2, 
  Info, 
  Camera, 
  AlertCircle, 
  MessageSquare, 
  Send,
  CheckCircle2,
  Moon,
  Sun
} from "lucide-react";

// Register model-viewer as a custom element for TypeScript
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
  }
];

export function ARViewer() {
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [arSupported, setArSupported] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const modelViewerRef = useRef<any>(null);

  const [origin, setOrigin] = useState("");

  useEffect(() => {
    // Import the library dynamically on the client-side
    import("@google/model-viewer").catch(console.error);

    // Check if AR is supported (basic check)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setArSupported(isMobile);

    // Get origin for absolute proxy URLs
    setOrigin(window.location.origin);
  }, []);

  const current = MODELS[index];

  // Determine final URL. We route everything through the proxy for testing.
  const baseUrl = origin || "";
  const proxyUrl = `${baseUrl}/api/proxy/model.glb?url=${encodeURIComponent(current.src)}`;

  // Robust function to sync exposure and lighting
  const syncLighting = () => {
    const viewer = modelViewerRef.current;
    if (viewer) {
      viewer.exposure = isNightMode ? 0.08 : 0.4;
      viewer.shadowIntensity = isNightMode ? 0.3 : 1;
    }
  };

  // Sync lighting whenever the mode changes
  useEffect(() => {
    syncLighting();
  }, [isNightMode]);

  // Manually add event listeners to the custom element (more reliable in React)
  useEffect(() => {
    const viewer = modelViewerRef.current;
    if (!viewer) return;

    const handleLoad = () => {
      setLoading(false);
      setError(null);
      // Ensure exposure is correctly applied when a model finishes loading.
      // We use a small timeout to ensure model-viewer's internal reset is done.
      setTimeout(syncLighting, 50);
    };

    const handleError = (event: any) => {
      console.error("Model viewer error:", event);
      setError("Het model kon niet worden geladen. Controleer of de link nog geldig is.");
      setLoading(false);
    };

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

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate an API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("Feedback succesvol verzonden!");
    }, 1500);
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
            v2.6 Stable
          </Badge>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* 3D Preview Section */}
          <div className="lg:col-span-8">
            <Card className={cn(
              "relative aspect-[4/3] w-full overflow-hidden border-none shadow-2xl transition-colors duration-500 md:aspect-square lg:aspect-[4/3]",
              isNightMode ? "bg-[#0f172a]" : "bg-gradient-to-b from-slate-100 to-slate-200"
            )}>
              {loading && (
                <div className={cn(
                  "absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-sm",
                  isNightMode ? "bg-slate-900/50" : "bg-slate-100/50"
                )}>
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className={cn("mt-4 text-sm font-medium", isNightMode ? "text-slate-400" : "text-slate-600")}>
                    Model wordt geladen...
                  </p>
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
                environment-image="neutral"
                auto-rotate
                interaction-prompt="auto"
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

          {/* Controls & Feedback Sectie */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Instellingen</h2>
              
              {/* Lighting Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "rounded-lg p-2 transition-colors",
                    isNightMode ? "bg-slate-900 text-amber-400" : "bg-amber-100 text-amber-600"
                  )}>
                    {isNightMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Avond weergave</p>
                    <p className="text-[10px] text-slate-500 uppercase font-medium">Sfeer & Belichting</p>
                  </div>
                </div>
                <Switch 
                  checked={isNightMode} 
                  onCheckedChange={setIsNightMode}
                />
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
                      <span className="text-base font-semibold text-slate-900">
                        {m.label}
                      </span>
                      {i === index && (
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-500 leading-snug">
                      {m.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Formulier */}
            <Card className="border-slate-200 p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-slate-900">Uw Mening</h3>
              </div>
              
              {!submitted ? (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-bold uppercase text-slate-500">Naam</Label>
                    <Input id="name" placeholder="Uw naam" required className="bg-slate-50 border-slate-200 focus:bg-white transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase text-slate-500">E-mailadres</Label>
                    <Input id="email" type="email" placeholder="uw@email.nl" required className="bg-slate-50 border-slate-200 focus:bg-white transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feedback" className="text-xs font-bold uppercase text-slate-500">Feedback</Label>
                    <Textarea 
                      id="feedback" 
                      placeholder="Wat vindt u van de nieuwe situatie?" 
                      className="min-h-[100px] bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full font-bold transition-all active:scale-95" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verzenden...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Feedback Verzenden
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in duration-300">
                  <div className="mb-4 rounded-full bg-green-100 p-3">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Bedankt!</h4>
                  <p className="mt-2 text-sm text-slate-500">
                    Uw feedback is waardevol voor dit project.
                  </p>
                  <Button 
                    variant="ghost" 
                    className="mt-4 text-xs font-semibold text-primary"
                    onClick={() => setSubmitted(false)}
                  >
                    Nog een bericht sturen
                  </Button>
                </div>
              )}
            </Card>

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
          © 2026 Visualisaties • Nacht-modus & Contrast Correctie
        </p>
      </footer>
    </div>
  );
}
