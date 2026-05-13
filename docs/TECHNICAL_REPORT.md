# Technisch Onderzoeksrapport: AR Model Switcher

Dit document dient als naslagwerk voor de gemaakte technische keuzes tijdens de ontwikkeling van de AR Model Switcher. Deze informatie kan gebruikt worden voor verslaglegging of verantwoording van het project.

## 1. Keuze voor AR-Engine: @google/model-viewer

### Onderzoeksvraag:
Hoe kunnen we 3D-modellen in Augmented Reality weergeven zonder dat de gebruiker een externe app (zoals een specifieke AR-app) hoeft te installeren?

### Keuze:
Er is gekozen voor de `<model-viewer>` web component van Google.

### Argumentatie:
- **Cross-Platform compatibiliteit:** Het ondersteunt zowel **iOS (Apple)** als **Android**. 
    - Op iOS maakt het gebruik van **AR Quick Look** (native .usdz preview).
    - Op Android maakt het gebruik van **Scene Viewer** of **WebXR**.
- **Geen App vereist:** De gebruiker opent simpelweg de URL in Safari of Chrome. Dit verlaagt de drempel voor gebruik aanzienlijk.
- **Progressive Enhancement:** Als een apparaat geen AR ondersteunt, krijgt de gebruiker nog steeds een interactieve 3D-viewer te zien in de browser.
- **Prestaties:** Het component is geoptimaliseerd voor mobiele browsers en gaat efficiënt om met geheugen bij het laden van 3D-modellen.

## 2. Framework keuze: TanStack Start

### Onderzoeksvraag:
Welk framework biedt de beste balans tussen een snelle gebruikersinterface en de mogelijkheid om server-side bewerkingen uit te voeren?

### Keuze:
TanStack Start (React-gebaseerd).

### Argumentatie:
- **Server Functions (`createServerFn`):** Dit was de doorslaggevende factor. We hadden een server nodig om bestanden van Nextcloud "door te sluizen" om CORS-problemen te voorkomen. Met TanStack Start kan deze server-logica in hetzelfde bestand staan als de UI-component, wat de onderhoudbaarheid vergroot.
- **Type-Safety:** Door het gebruik van TypeScript door de hele stack (router, state, server functions) is de kans op runtime errors minimaal.
- **SSR (Server Side Rendering):** Zorgt voor een snellere initiële laadtijd en betere indexering door zoekmachines.

## 3. Hosting & CORS Problematiek (Nextcloud)

### Onderzoeksvraag:
Hoe laden we veilig 3D-modellen vanaf een privé opslagmedium (Nextcloud) zonder tegen beveiligingsblokkades in de browser aan te lopen?

### Probleem:
Browsers blokkeren het laden van 3D-modellen vanaf een ander domein (Nextcloud) naar de AR-app (`ar.eaxj.nl`) vanwege **CORS (Cross-Origin Resource Sharing)**. Nextcloud staat standaard niet toe dat andere websites hun bestanden direct 'embedden' in een 3D-viewer.

### Oplossing:
Implementatie van een **Server-Side Proxy**.
- In plaats van dat de browser het model direct bij Nextcloud ophaalt, vraagt de browser het model aan onze eigen server.
- Onze server (Cloudflare Worker via TanStack Start) haalt het bestand op bij Nextcloud.
- De server stuurt de data terug naar de browser met de header `Access-Control-Allow-Origin: *`.
- **Resultaat:** De browser ziet de data als "veilig" en het model wordt geladen.

## 4. Bestandsformaat: .GLB vs .GLTF

### Keuze:
**.GLB (GL Transmission Format Binary)**.

### Argumentatie:
- **Single File:** Een `.gltf` bestand heeft vaak losse textures (.jpg, .png) en shader-bestanden nodig. Een `.glb` is een binair pakket waar alles in zit. Dit is veel makkelijker te beheren via een proxy en Nextcloud links.
- **Bestandsgrootte:** Door de binaire structuur is een `.glb` vaak kleiner dan een ongecomprimeerde `.gltf`, wat essentieel is voor mobiele gebruikers op een 4G/5G netwerk.

## 5. Deployment: Cloudflare Workers

### Keuze:
Serverless hosting via Cloudflare.

### Argumentatie:
- **Lage Latency:** Cloudflare voert de code uit op servers die fysiek dicht bij de gebruiker staan (Edge computing). Dit is cruciaal voor een soepele ervaring bij het streamen van 3D-modellen.
- **Schaalbaarheid:** De proxy-server kan duizenden aanvragen tegelijk aan zonder vertraging.
