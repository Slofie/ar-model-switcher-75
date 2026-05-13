# Project Overview: AR Model Switcher

Dit project is een interactieve Augmented Reality (AR) viewer gebouwd met **TanStack Start**. Het stelt gebruikers in staat om 3D-modellen (GLB/GLTF) te bekijken in hun browser en deze via AR in hun fysieke ruimte te plaatsen. De focus ligt op een "Voor / Na" vergelijking van projecten.

## Architectuur & Technische Keuzes

### 1. Framework: TanStack Start (Beta)
Er is gekozen voor TanStack Start vanwege de naadloze integratie tussen client-side routing (TanStack Router) en server-side logic (`createServerFn`). Dit stelt ons in staat om complexe server-functies te schrijven die direct vanuit componenten aangeroepen kunnen worden zonder een aparte API-architectuur op te tuigen.

### 2. 3D & AR Engine: @google/model-viewer
Voor de weergave wordt gebruik gemaakt van de web-standard `<model-viewer>`. 
- **Waarom:** Het biedt native ondersteuning voor AR op zowel Android (Scene Viewer / WebXR) als iOS (Quick Look) zonder dat de gebruiker een app hoeft te installeren.
- **Configuratie:** We gebruiken `ar-modes="webxr scene-viewer quick-look"` voor maximale compatibiliteit.

### 3. CORS & Proxy Strategie
Veel externe bronnen (waaronder Nextcloud) blokkeren het direct laden van 3D-bestanden in een browser-component vanwege Cross-Origin Resource Sharing (CORS) restricties.
- **Oplossing:** Er is een `getModelProxy` server-functie geïmplementeerd in `ARViewer.tsx`.
- **Werking:** De server haalt het bestand op aan de backend-zijde en streamt de data terug naar de client met de juiste headers (`Access-Control-Allow-Origin: *`). Dit omzeilt CORS-problemen zonder dat de serverinstellingen van de bron aangepast hoeven te worden.

## Nextcloud Integratie

Om modellen direct vanuit een eigen Nextcloud-instantie te laden, moeten de links aan specifieke eisen voldoen:

1.  **Directe Download:** Een standaard Nextcloud deellink opent een web-interface. Voeg **/download** toe aan het einde van de URL om het directe bestand te ontsluiten.
    - *Voorbeeld:* `https://nextcloud.eaxj.nl/s/TOKEN/download`
2.  **Toegang:** De link moet publiek toegankelijk zijn (geen wachtwoord vereist).
3.  **Bestandstype:** Gebruik bij voorkeur `.glb` bestanden. Dit zijn binaire containers die zowel de geometrie als de textures bevatten, wat ideaal is voor web-streaming.

## Belangrijke Commando's

| Commando | Beschrijving |
| :--- | :--- |
| `npm run dev` | Start de Vite development server |
| `npm run build` | Bouwt de applicatie voor productie |
| `npm run start` | Start de applicatie lokaal via Wrangler (Cloudflare emulatie) |
| `npm run lint` | Voert ESLint checks uit |
| `npm run format` | Formatteert de code met Prettier |

## Ontwikkelingsconventies

- **Componenten:** Herbruikbare UI-componenten staan in `src/components/ui/` (Shadcn).
- **Pad Aliassen:** Gebruik `@/` om te verwijzen naar de `src/` directory.
- **Routing:** Nieuwe routes worden toegevoegd in `src/routes/`.
- **Server-side acties:** Gebruik `createServerFn` met de moderne object-syntax (`{ method: 'GET' }`) en een `.validator()` voor correcte RPC-URL generatie.

## Projectstructuur

- `src/components/`: Bevat de hoofdcomponenten zoals `ARViewer.tsx`.
- `src/routes/`: TanStack Router pagina's en layouts.
- `src/server.ts`: Entry point voor de Cloudflare Worker / SSR wrapper (bevat ook error-handling voor SSR).
- `src/styles.css`: Tailwind CSS 4 configuratie.
- `wrangler.jsonc`: Configuratie voor Cloudflare deployment.
