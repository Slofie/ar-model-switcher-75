import { createServerFn } from "@tanstack/react-start";

// Server function die fungeert als proxy om CORS-problemen te omzeilen
export const getModelProxy = createServerFn("GET", async (url: string) => {
  // TanStack Start v1 geeft de url soms direct door, of via een payload wrapper
  // We proberen beide om robuust te zijn.
  let targetUrl = url;
  
  try {
    // Als de url een JSON string is (wat gebeurt bij de payload=... methode)
    if (url.startsWith('"') || url.startsWith('{')) {
      targetUrl = JSON.parse(url);
    }
  } catch (e) {
    // Geen JSON, we gebruiken de originele url
  }

  console.log("Proxying request for:", targetUrl);

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`Source returned ${response.status}`);
    
    // We streamen de body direct terug naar de client met de juiste headers
    return new Response(response.body, {
      headers: {
        "Content-Type": "model/gltf-binary",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response("Failed to fetch model", { status: 500 });
  }
});
