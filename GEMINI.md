# Project Overview: AR Model Switcher

This project is an interactive Augmented Reality (AR) viewer built with **TanStack Start**. It allows users to view 3D models (GLB/GLTF) in their browser and place them in their physical space via AR. The focus is on a "Before / After" comparison of projects.

## Architecture & Technical Choices

### 1. Framework: TanStack Start (Beta)
TanStack Start was chosen for its seamless integration between client-side routing (TanStack Router) and server-side logic (`createServerFn`). This allows us to write complex server functions that can be called directly from components without setting up a separate API architecture.

### 2. 3D & AR Engine: @google/model-viewer
The web-standard `<model-viewer>` is used for rendering.
- **Why:** It provides native support for AR on both Android (Scene Viewer / WebXR) and iOS (Quick Look) without the user needing to install an app.
- **Configuration:** We use `ar-modes="webxr scene-viewer quick-look"` for maximum compatibility.

### 3. CORS & Proxy Strategy
Many external sources (including Nextcloud) block direct loading of 3D files in a browser component due to Cross-Origin Resource Sharing (CORS) restrictions.
- **Solution:** A `getModelProxy` server function is implemented in `ARViewer.tsx`.
- **How it works:** The server fetches the file on the backend side and streams the data back to the client with the correct headers (`Access-Control-Allow-Origin: *`). This bypasses CORS issues without needing to adjust the source's server settings.

## Nextcloud Integration

To load models directly from your own Nextcloud instance, the links must meet specific requirements:

1.  **Direct Download:** A standard Nextcloud share link opens a web interface. Add **/download** to the end of the URL to unlock the direct file.
    - *Example:* `https://nextcloud.eaxj.nl/s/TOKEN/download`
2.  **Access:** The link must be publicly accessible (no password required).
3.  **File Type:** Preferably use `.glb` files. These are binary containers containing both geometry and textures, ideal for web streaming.

## Important Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Builds the application for production |
| `npm run start` | Starts the application locally via Wrangler (Cloudflare emulation) |
| `npm run lint` | Runs ESLint checks |
| `npm run format` | Formats the code with Prettier |

## Git & Commits

- **Commit Messages:** Always provide a clear, concise commit message in English after every set of changes.

## Development Conventions

- **Language:** All code comments, documentation, and commit messages must be in English.
- **Components:** Reusable UI components are located in `src/components/ui/` (Shadcn).
- **Path Aliases:** Use `@/` to refer to the `src/` directory.
- **Routing:** New routes are added in `src/routes/`.
- **Server-side actions:** Use `createServerFn` with the modern object syntax (`{ method: 'GET' }`) and a `.validator()` for correct RPC-URL generation.

## Project Structure

- `src/components/`: Contains main components like `ARViewer.tsx`.
- `src/routes/`: TanStack Router pages and layouts.
- `src/server.ts`: Entry point for the Cloudflare Worker / SSR wrapper (also contains error handling for SSR).
- `src/styles.css`: Tailwind CSS 4 configuration.
- `wrangler.jsonc`: Configuration for Cloudflare deployment.
