# Motion Playground

A lightweight playground of playful animations, springy cards, and mischievous interactions.

English, Spanish, and Russian interfaces, selected from browser language preferences or a saved manual choice. Light, dark, and system themes. Independent, lightweight HTML/CSS/JavaScript with no third-party browser dependencies, remote fonts, analytics, or CDN.

## Run

Serve `public/` with any static HTTP server at a domain root. For a local preview, for example:

```sh
python3 -m http.server 8080 --directory public
```

Open http://localhost:8080. Opening the HTML via `file://` is unsupported because native ES modules need HTTP. No Node.js server, database, API key, or build is needed in production.

## Checks

With Node.js 24+: `npm test` and `npm run check`.

## Deployment and data

Upload the contents of `public/` to your static host. Absolute asset paths assume a domain root; a GitHub Pages project subpath requires adapting paths or using a custom domain. Drawings, certificate names, and preferences stay on the device. Clearing site data removes drafts. Exported PNG files are created locally.

Four interactions: an escaping button that surrenders after seven escapes, spring cards, an openly fictional progress bar, and a 3D flip card. Keyboard and touch can activate the button directly. Reduced-motion preferences enable calm mode automatically; the manual switch persists locally. No background animation loop or network calls.
