import { createServerFn } from "@tanstack/react-start";

// Server function that acts as a proxy to bypass CORS issues
export const getModelProxy = createServerFn("GET", async (url: string) => {
  // TanStack Start v1 sometimes passes the url directly, or via a payload wrapper.
  // We try both to be robust.
  let targetUrl = url;
  
  try {
    // If the url is a JSON string (happens with the payload=... method)
    if (url.startsWith('"') || url.startsWith('{')) {
      targetUrl = JSON.parse(url);
    }
  } catch (e) {
    // Not JSON, we use the original url
  }

  console.log("Proxying request for:", targetUrl);

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`Source returned ${response.status}`);
    
    // We stream the body directly back to the client with the correct headers
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
