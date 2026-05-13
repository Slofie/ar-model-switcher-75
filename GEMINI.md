# Project Overview: AR Model Switcher

Dit project is een interactieve Augmented Reality (AR) viewer gebouwd met **TanStack Start**. Het stelt gebruikers in staat om 3D-modellen (GLB/GLTF) te bekijken in hun browser en deze via AR in hun fysieke ruimte te plaatsen. De focus ligt op een "Voor / Na" vergelijking van projecten.

## Architectuur & Technologieën

- **Framework:** [TanStack Start](https://tanstack.com/start) (React + Router + Query)
- **3D/AR Engine:** [@google/model-viewer](https://modelviewer.dev/) (Native AR via WebXR, Scene Viewer en Quick Look)
- **Runtime/Deployment:** [Cloudflare Workers](https://workers.cloudflare.com/) via Wrangler
- **Styling:** Tailwind CSS + Shadcn UI
- **Routing:** TanStack Router (File-based)
- **Server Logic:** `createServerFn` wordt gebruikt voor server-side acties, zoals de CORS-proxy voor externe modellen.

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
- **Routing:** Nieuwe routes moeten worden toegevoegd in `src/routes/`.
- **Server-side acties:** Gebruik `createServerFn` in componenten of aparte bestanden voor logica die op de server moet draaien (bijv. API calls, database interacties).
- **AR Modellen:** Modellen worden geladen via een proxy (`getModelProxy` in `ARViewer.tsx`) om CORS-beperkingen van externe bronnen zoals Nextcloud te omzeilen.

## Projectstructuur

- `src/components/`: Bevat de hoofdcomponenten zoals `ARViewer.tsx`.
- `src/routes/`: TanStack Router pagina's en layouts.
- `src/server.ts`: Entry point voor de Cloudflare Worker / SSR wrapper.
- `src/styles.css`: Tailwind CSS configuratie en globale styles.
- `wrangler.jsonc`: Configuratie voor Cloudflare deployment.
