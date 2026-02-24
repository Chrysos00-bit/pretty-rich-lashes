[README.md](https://github.com/user-attachments/files/25520208/README.md)
# Pretty Rich Lashes — Booking Page

Single-page booking site for lash extensions. Clean, production-ready structure.

## Project structure

```
client/                 # Frontend (standalone HTML + optional Next.js)
├── public/             # Static assets and standalone page
│   ├── assets/         # Logo and images (e.g. logo.png)
│   └── index.html      # Standalone booking page
├── src/                # (If using Next.js: app, components, lib)
├── package.json
└── ...
```

- **Logo and assets:** Place `logo.png` and other images in `client/public/assets/`. The page references them as `assets/logo.png`.
- **Standalone:** Open `client/public/index.html` in a browser (with `client/public` as the document root so `assets/` resolves), or serve the `client/public` folder with any static server.

## Booking time slots

Time slots depend on the selected date:

| Day        | Hours (30-min intervals) |
|-----------|---------------------------|
| Mon–Fri   | 16:30 – 22:30             |
| Saturday  | 08:30 – 18:30             |
| Sunday    | No slots; message shown to contact via WhatsApp |

Slots update automatically when the user changes the date.

## Run locally

**Standalone (no build):**  
Serve `client/public` (e.g. `npx serve client/public` or open `index.html` from that folder).

**With Next.js (if present):**  
From project root: `cd client && npm install && npm run dev` → http://localhost:3000
