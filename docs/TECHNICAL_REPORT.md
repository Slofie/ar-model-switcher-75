# Technical Research Report: AR Model Switcher

This document serves as a reference for the technical choices made during the development of the AR Model Switcher. This information can be used for reporting or project justification.

## 1. AR Engine Choice: @google/model-viewer

### Research Question:
How can we display 3D models in Augmented Reality without requiring the user to install an external app?

### Choice:
The `<model-viewer>` web component from Google was selected.

### Rationale:
- **Cross-Platform Compatibility:** It supports both **iOS (Apple)** and **Android**.
    - On iOS, it utilizes **AR Quick Look** (native .usdz preview).
    - On Android, it uses **Scene Viewer** or **WebXR**.
- **No App Required:** Users simply open the URL in Safari or Chrome, significantly lowering the barrier to entry.
- **Progressive Enhancement:** If a device does not support AR, the user still sees an interactive 3D viewer in the browser.
- **Performance:** The component is optimized for mobile browsers and handles memory efficiently when loading 3D models.

## 2. Framework Choice: TanStack Start

### Research Question:
Which framework provides the best balance between a fast user interface and the ability to perform server-side operations?

### Choice:
TanStack Start (React-based).

### Rationale:
- **Server Functions (`createServerFn`):** This was the deciding factor. We needed a server to "proxy" files from Nextcloud to prevent CORS issues. TanStack Start allows this server logic to reside in the same codebase as the UI components, increasing maintainability.
- **Type-Safety:** Using TypeScript throughout the entire stack (router, state, server functions) minimizes runtime errors.
- **SSR (Server Side Rendering):** Ensures faster initial load times and better search engine indexing.

## 3. CORS & Proxy Strategy (Nextcloud Integration)

### Research Question:
How do we safely load 3D models from a private storage medium (Nextcloud) without running into browser security blocks?

### Problem:
Browsers block loading 3D models from a different domain (Nextcloud) to the AR app due to **CORS (Cross-Origin Resource Sharing)**. Nextcloud does not allow other websites to 'embed' their files directly into a 3D viewer by default.

### Solution:
Implementation of a **Server-Side Proxy**.
- Instead of the browser fetching the model directly from Nextcloud, it requests the model from our own server.
- Our server (Cloudflare Worker via TanStack Start) fetches the file from Nextcloud.
- The server streams the data back to the browser with the header `Access-Control-Allow-Origin: *`.
- **Result:** The browser treats the data as "safe," and the model loads successfully. This approach was chosen over modifying server settings as it provides a universal solution for any private cloud storage.

## 4. Visual Atmosphere & Lighting Control

### Research Question:
How can we maintain consistent lighting across different models and simulate an evening atmosphere?

### Findings & Implementation:
- **Exposure Reset Issue:** During testing, we discovered that `model-viewer` resets its `exposure` to the default value (1.0) every time a new model is loaded. For the specific models used in this project, 1.0 proved to be significantly overexposed.
- **Technical Synchronization:** A specialized `syncLighting` function was implemented. We found that applying a **50ms timeout** after the `load` event is essential to reliably override the viewer's internal reset mechanism.
- **Standardized Values:** Baseline exposure is strictly set to **0.4** for optimal clarity in daylight mode, and **0.08** for night mode to simulate evening conditions. This simulates depth and atmosphere without requiring expensive real-time lights within the 3D model.

## 5. Participation & Feedback Strategy

### Feature:
Integrated Resident Feedback Form.

### Rationale:
- **Identifiability:** The form explicitly requires an **Email Address**. This choice was made to ensure that project developers can follow up with residents, making the feedback loop actionable rather than anonymous.
- **Bilingual Implementation:** A strategic decision was made to keep the **User Interface in Dutch** to ensure maximum accessibility for local residents, while maintaining **English for all code comments and technical documentation** to adhere to global software engineering standards.

## 6. Optimization & iOS Stability

### The "Large Texture" Challenge:
During development, we encountered frequent crashes on iOS (Safari) when using models with high-resolution textures (e.g., 4K). 

### Technical Insight:
- **RAM vs. Storage:** A common misconception is that file size (MB on disk) is the primary constraint. On iOS, the critical bottleneck is **RAM usage**. When Safari unpacks a 4K texture, it consumes ~64MB of RAM regardless of the compressed file size. If multiple textures are used, the browser exceeds its memory limit and force-refreshes the page.
- **The Solution:** We established a strict **1024x1024 texture resolution cap**. This ensures stability on mobile devices while maintaining sufficient visual quality for web-based AR.

### Recommended Optimizations for Model Export:
1.  **Texture Resolution:** Downscale all textures to **1024x1024** or **512x512**.
2.  **Mesh Decimation:** Aim for a maximum of **150,000 polygons** per model.
3.  **File Format:** Always use **.GLB (Binary)** to ensure a single-file container that is easily handled by our proxy server.
4.  **Target Size:** Aim for a total file size **under 10MB** to ensure fast loading on mobile networks (4G/5G).
