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

## Cloud Storage & Large Files

Grote 3D-bestanden (zoals `.glb` bestanden) kunnen de website build laten mislukken als ze in de `public/` map staan. Daarom gebruiken we een speciale strategie:

### 1. GitHub Hosting (Aanbevolen)
We gebruiken de repository zelf als opslag, maar we sluiten de bestanden uit van de website-build.
- **Locatie:** Plaats je modellen in de map `models-storage/` (deze staat in de root, NIET in `public/`).
- **Workflow:**
    1. Voeg je `.glb` bestanden toe aan `models-storage/`.
    2. Commit en push naar GitHub.
    3. Ga op GitHub naar het bestand en klik op de knop **"Raw"**.
    4. Kopieer die URL (bijv. `https://raw.githubusercontent.com/GEBRUIKER/REPO/BRANCH/models-storage/voor.glb`).
    5. Gebruik deze URL in `src/components/ARViewer.tsx`.

### 2. OneDrive / Dropbox
- **OneDrive:** Gebruik een deel-link en verander het einde naar `?download=1`.
- **Dropbox:** Gebruik een deel-link en verander `dl=0` naar `raw=1`.

> **Belangrijk:** Gebruik altijd de proxy (gebeurt automatisch in de code) voor deze externe links om CORS-blokkades te voorkomen.

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
