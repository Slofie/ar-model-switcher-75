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
- **Solution:** A manual proxy route is implemented in `src/server.ts` accessible via `/api/proxy?url=...`.
- **How it works:** The server fetches the file on the backend side and streams the data back to the client with the correct headers (`Access-Control-Allow-Origin: *`). This bypasses CORS issues.
- **Optimization:** The proxy is only used for external URLs. Local files in `public/models/` are loaded directly.

## Cloud Storage Alternatives

Since models are often too large for Git (binary files >10MB should generally be hosted externally), use these alternatives:

1.  **OneDrive (Direct Link):** 
    - Get a share link from OneDrive.
    - Replace the end of the URL (e.g., `?embed=1` or nothing) with `?download=1`.
    - *Example:* `https://1drv.ms/u/s!AnH...Example?download=1`
2.  **GitHub (LFS or Raw):** Upload models to a repository and use the "Raw" URL.
    - *Example:* `https://raw.githubusercontent.com/USER/REPO/BRANCH/path/to/model.glb`
3.  **Dropbox:** Use a share link and change `dl=0` to `raw=1` at the end.
    - *Example:* `https://www.dropbox.com/s/TOKEN/model.glb?raw=1`

> **Note:** Always use the `/api/proxy?url=...` prefix for these external links to bypass CORS, as implemented in `ARViewer.tsx`.

## Project Phases

The viewer now supports three phases:
1.  **Voor:** Current situation.
2.  **Onder constructie:** The phase during construction/renovation.
3.  **Na:** The final geplanned situation.

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
