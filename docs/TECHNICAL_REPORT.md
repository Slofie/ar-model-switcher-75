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

## 5. Performance & Optimalisatie (Model Grootte)

### Onderzoeksvraag:
Waarom laden modellen traag op mobiele apparaten of zorgen ze voor instabiliteit (refreshes) op iOS?

### Bevindingen:
Tijdens het testen bleek dat grote 3D-modellen (hoge poly-count of grote textures) leiden tot:
- **Lange laadtijden:** Vooral op mobiele netwerken.
- **Instabiliteit op iOS:** Safari op iOS heeft een strikt geheugenlimiet voor web-content. Als een model te groot is, kan de browser de pagina herladen of de AR-functie weigeren te starten.

### Aanbevolen Optimalisaties:
Om een soepele ervaring te garanderen, moeten de `.glb` bestanden geoptimaliseerd worden:
1.  **Polygon Reduction:** Verminder het aantal polygonen in software zoals Blender. Streef naar maximaal 100k - 200k polygonen voor web-gebruik.
2.  **Texture Compressie:** Gebruik texturen van maximaal 1024x1024 of 2048x2048 pixels. Forceer het gebruik van gecomprimeerde formaten (JPG of WebP binnen de GLB).
3.  **Draco Compressie:** Gebruik Google's Draco geometry compression om de bestandsgrootte van de geometrie drastisch te verkleinen zonder zichtbaar kwaliteitsverlies.
4.  **Bestandsgrootte target:** Streef naar een bestandsgrootte van **onder de 10MB** per model voor de beste balans tussen kwaliteit en snelheid.

### Geavanceerde Netwerk-optimalisaties:
Tijdens de ontwikkeling zijn extra stappen ondernomen om de proxy-server te versnellen:
- **ArrayBuffer vs Streaming:** Mobiele browsers (vooral op iOS) kunnen soms "hangen" op lange data-streams. Door het bestand op de server eerst volledig in een `arrayBuffer` te laden en dan in één keer te versturen, wordt de verbinding stabieler.
- **Browser Caching:** Door de header `Cache-Control: public, max-age=86400` mee te geven, hoeft de mobiele browser het model bij een tweede bezoek niet opnieuw te downloaden. Dit bespaart batterij en data.
- **Virtual Extensions:** Door de proxy-URL te laten eindigen op `/model.glb` wordt de browser geholpen bij het herkennen van het MIME-type, wat essentieel is voor iOS Quick Look.

## 6. Deployment: Cloudflare Workers

### Keuze:
Serverless hosting via Cloudflare.

### Argumentatie:
- **Lage Latency:** Cloudflare voert de code uit op servers die fysiek dicht bij de gebruiker staan (Edge computing). Dit is cruciaal voor een soepele ervaring bij het streamen van 3D-modellen.
- **Schaalbaarheid:** De proxy-server kan duizenden aanvragen tegelijk aan zonder vertraging.
