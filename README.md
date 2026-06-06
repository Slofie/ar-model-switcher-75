# AR Concept - Binnenstedelijke Constructie

An interactive Augmented Reality (AR) viewer designed for urban construction projects. This application allows residents and stakeholders to visualize proposed urban changes in 3D and place them in their physical environment using AR.

## 🌟 Overview

This project provides a "Before / During / After" comparison tool for construction sites. Users can toggle between different phases of a project to see the current situation, the construction phase, and the final planned outcome directly in their browser or in physical space via AR.

## 🚀 Key Features

- **Web-based 3D Viewer:** High-performance rendering of GLB models using `@google/model-viewer`.
- **Augmented Reality:** Seamless AR experience on iOS (Quick Look) and Android (WebXR / Scene Viewer).
- **Phase Switching:** Instant switching between "Voor" (Current), "Tijdens" (Construction), and "Na" (New Situation).
- **Integrated Feedback:** A built-in feedback module for residents to share their thoughts on the proposed changes.
- **CORS Proxy:** A specialized backend route to load 3D models from external sources (GitHub, Nextcloud, etc.) without security blocks.
- **Optimized for Mobile:** Designed for on-site use with a focus on stability and performance.

## 🛠️ Technical Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (React + TypeScript)
- **3D Engine:** [@google/model-viewer](https://modelviewer.dev/)
- **Styling:** Tailwind CSS 4 & [Shadcn/UI](https://ui.shadcn.com/)
- **Deployment:** Cloudflare Workers / Pages (via Wrangler)
- **Icons:** Lucide React

## 📖 How it Works

### 1. AR Implementation
The app uses the web-standard `<model-viewer>` component. It automatically detects the user's device:
- **iOS:** Triggers "AR Quick Look".
- **Android:** Uses "WebXR" or "Scene Viewer".
- **Desktop:** Provides a 360° interactive 3D preview.

### 2. The CORS Proxy Strategy
External storage providers like Nextcloud often block direct 3D model loading due to Cross-Origin Resource Sharing (CORS) restrictions. 
Our solution:
- Requests are routed through `/api/proxy?url=...`.
- The server (Cloudflare Worker) fetches the file and streams it back with safe headers (`Access-Control-Allow-Origin: *`).

### 3. Lighting & Atmosphere
The viewer uses a custom lighting synchronization logic to ensure models are not overexposed. It sets a specific exposure level (default ~0.4) to maintain a realistic atmosphere across different models.

## 💻 Development

### Getting Started

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Run in development mode:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Test local production build (Cloudflare emulation):**
   ```bash
   npm run start
   ```

### Project Structure
- `src/components/ARViewer.tsx`: Main logic and UI for the viewer.
- `src/server.ts`: Server-side proxy and SSR entry point.
- `models-storage/`: Local repository for 3D models (excluded from build to save space).
- `docs/TECHNICAL_REPORT.md`: Detailed technical justification and research findings.

## 📦 3D Model Management

To ensure stability and fast loading times, models should follow these guidelines:

1.  **Format:** Binary GLTF (`.glb`).
2.  **Size:** Ideally under 10MB.
3.  **Textures:** Max 1024x1024 resolution to prevent iOS crashes.
4.  **Hosting:**
    - Place files in `models-storage/`.
    - Push to GitHub.
    - Use the **Raw** URL in `ARViewer.tsx`.

## 📝 License

Private Project - All rights reserved.
