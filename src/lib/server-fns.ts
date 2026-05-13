import { createServerFn } from "@tanstack/react-start";

// Server function die fungeert als proxy om CORS-problemen te omzeilen
export const getModelProxy = createServerFn("GET", async (url: string) => {
  try {
    const response = await fetch(url);
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
