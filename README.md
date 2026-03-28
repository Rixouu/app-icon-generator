# App Icon Generator

A small **Next.js** web app for turning one source image into a **ZIP of PNG icons** sized for **Android** or **iOS** launcher and asset slots. Processing runs on the server with **[Sharp](https://sharp.pixelplumbing.com/)**; the UI is **React** with **Tailwind CSS**, **Google Sans** (via [Google Fonts](https://fonts.google.com/specimen/Google+Sans)), and a **light / dark** theme.

## Features

- **Platform presets** — Android (6 sizes) or iOS (12 standard point sizes).
- **Scaling** — *Center (contain)* or *Crop (cover)*, aligned with Sharp’s resize behavior.
- **Shape** — Square, circle, or squircle (mask applied before export).
- **Effects** — None, shadow, or gloss (preview matches server output).
- **Padding** — Uniform padding inside the final square; inner artwork scales to the remaining area.
- **Background** — Solid fill **or** **transparent export** (PNG alpha for padding and letterboxing).
- **Live preview** — Canvas preview; checkerboard when background is transparent.
- **Download** — Single `icons.zip` of PNG files; errors surfaced in the UI when the API returns JSON.

## Tech stack

| Area | Choice |
|------|--------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com/) |
| Images | [Sharp](https://sharp.pixelplumbing.com/) |
| Archives | [archiver](https://www.archiverjs.com/) (ZIP) |
| Lint | [ESLint 9](https://eslint.org/) + `eslint-config-next` |

## Requirements

- **Node.js** 20.x or newer is recommended (matches current Next / ESLint expectations).
- **npm** (ships with Node).

Sharp installs **platform-specific native binaries**. If you see errors like *Could not load the "sharp" module*, reinstall for your OS/CPU:

```bash
npm install --include=optional sharp
```

See the [Sharp installation docs](https://sharp.pixelplumbing.com/install) for more options.

## Getting started

```bash
git clone https://github.com/Rixouu/app-icon-generator.git
cd app-icon-generator
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Run production server (after `build`) |
| `npm run lint` | ESLint (`eslint .`, flat config) |

## How it works

1. The browser **POST**s `multipart/form-data` to `/api/generate-icons` with the image file, platform key, and JSON **settings**.
2. The route writes a temporary upload, calls **`generateIcons()`** in [`utils/IconGenerator.ts`](utils/IconGenerator.ts), then streams a **ZIP** of PNGs.
3. **Sharp** resizes, masks, applies effects, extends padding, then either **flattens** to a solid background or writes **transparent** PNGs.
4. Temp upload and generated files under `temp/` are removed in a **`finally`** block.

`next.config.mjs` lists **`sharp`** and **`archiver`** in **`serverExternalPackages`** so they are not bundled incorrectly on the server.

## Project layout

```
app/
  api/generate-icons/route.ts   # POST handler + ZIP response
  components/                   # UI pieces (preview, settings, theme sync, …)
  globals.css                   # Theme tokens + Google Sans import
  layout.tsx
  page.tsx
utils/
  IconGenerator.ts              # Sharp pipeline
```

## Deployment notes

- The app expects a **Node** runtime (filesystem temp paths, native Sharp).
- Ensure the host installs **optional dependencies** so Sharp matches the deployment OS/architecture.
- Do not commit **`.next/`** or **`node_modules/`**; they are listed in `.gitignore`.

## Contributing

Issues and pull requests are welcome. Please run **`npm run build`** and **`npm run lint`** before submitting changes.
