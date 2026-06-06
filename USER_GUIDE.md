# User Guide: AR Concept - Binnenstedelijke Constructie

This guide explains how to use, manage, and maintain the AR Model Viewer for urban construction projects.

## 1. What does this website do?
This application is a digital visualization tool for residents and project stakeholders. It allows them to:
- **View 3D Models:** See high-quality 3D representations of a construction site directly in their web browser.
- **Switch Phases:** Toggle between three distinct phases:
  - **Voor (Before):** The current state of the location.
  - **Tijdens (During):** The situation during the construction process.
  - **Na (After):** The final proposed outcome.
- **AR Experience:** Use a smartphone or tablet to "place" these models in the real world at their actual location, allowing for an immersive "walk-through" experience.
- **Provide Feedback:** Submit comments and contact details regarding the proposed plans.

## 2. How to use the Viewer
### On Desktop
- **Navigation:** Click and drag to rotate the model. Use the scroll wheel to zoom in and out.
- **Switching:** Use the buttons on the right side to switch between "Huidige situatie", "Onder constructie", and "Nieuwe situatie".
- **Feedback:** Fill in the form on the right to send your thoughts to the project team.

### On Mobile (AR Mode)
1. Open the website on a modern iOS (Safari) or Android (Chrome) device.
2. Navigate to the model you want to see.
3. Tap the button **"BEKIJK IN JE RUIMTE"** (View in your space).
4. Follow the on-screen instructions to scan the ground.
5. Once the model appears, you can move it with one finger and rotate/scale it with two fingers.

## 3. How to Update 3D Models
The 3D models are stored as `.glb` files. Follow these steps to replace or update them:

1. **Prepare your model:**
   - Ensure it is a `.glb` file.
   - Limit texture size to **1024x1024** for mobile stability.
   - Keep the total file size **under 15MB** if possible.

2. **Upload to GitHub:**
   - Place your file in the `models-storage/` folder in the root of this project.
   - Commit and push your changes to the repository.

3. **Get the Raw URL:**
   - Go to your repository on GitHub.com.
   - Open the `models-storage` folder.
   - Click on your `.glb` file.
   - Click the **"Raw"** button.
   - Copy the URL from your browser's address bar.

4. **Update the code:**
   - Open `src/components/ARViewer.tsx`.
   - Find the `MODELS` constant at the top of the file.
   - Replace the `src` URL for the relevant phase (voor, constructie, or na) with your new Raw URL.

## 4. Technical Workings
### The Proxy System
The website uses a custom "Proxy" to load models. This is necessary because many storage providers (like GitHub or Nextcloud) block direct loading into a 3D viewer for security reasons (CORS). The proxy fetches the file on the server and safely hands it to the browser.

### Feedback Module
Currently, the feedback form is a **prototype**. When a user clicks "Verzenden", it shows a success message, but the data is not yet stored in a database. In a production environment, this would be connected to an API or database service.

## 5. Troubleshooting
- **Model not loading?** Check if the URL in the code is still valid.
- **AR button not appearing?** Ensure you are on a compatible mobile device and using a secure (HTTPS) connection.
- **Model looks too bright/dark?** The lighting is synchronized automatically. If it's consistently off, the `exposure` settings in `ARViewer.tsx` can be adjusted.
