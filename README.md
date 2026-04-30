# 🎨 App Icon Generator

**App Icon Generator** is a focused web app for building **platform-ready icon packs** for **Android**, **iOS**, and the **web / PWA**. Start from an uploaded image, curated clipart, or text, tune the foreground, background, shape, and badge, preview the result on-canvas, then download a ZIP with production-ready PNG assets. Server-side image work uses **Sharp**; the UI uses **React**, **Tailwind**, and **Google Sans** with a polished **light / dark** theme.

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)
[![Sharp](https://img.shields.io/badge/Sharp-image-99f)](https://sharp.pixelplumbing.com/)
![PWA](https://img.shields.io/badge/PWA-Install%20banner-7044ff)

## ✨ Key Features

### 📤 Sources & platform targets

- Drag-and-drop or click to upload **PNG / JPG / WebP**
- Use **uploaded image**, **clipart**, or **text** as the foreground source
- Switch between **Android**, **iOS**, **Web**, or **All** export targets

### 🧩 Clipart & badge tools

- Curated **clipart catalog** with search, categories, and featured quick picks
- **Badge presets** such as `NEW`, `BETA`, `PRO`, and `AI`
- Fully editable badge text, colors, and position

### 🖼 Background, shape & finishing

- Solid, **gradient**, **mesh**, or dedicated **background image** layer
- Optional **transparent export** for PNG alpha output
- **Square**, **circle**, **squircle**, or **rounded** mask
- **Padding**, **shadow**, and **gloss** controls with preview parity

### 👁 Preview, export & layout

- Live **canvas** preview of the final export render
- **Desktop workflow**: large preview workspace with dedicated editor rail
- **Mobile / PWA workflow**: separate **Preview / Edit / Export** views for easier use on phones
- **Download ZIP** — client checks `Content-Type`; API returns JSON errors inline when generation fails
- **`/api/generate-icons`** — multipart POST → Sharp → **archiver** ZIP; temp files cleaned in `finally`

### 📱 PWA & install UX

- **`app/manifest.ts`** — `standalone`, theme `#7044ff`, icons from [`public/icon-app-icon-generator.png`](public/icon-app-icon-generator.png)
- **`public/sw.js`** — minimal service worker (installability hook; **no offline cache**)
- **`ServiceWorkerRegister`** — registers the SW in **production** only
- **`PwaInstallBanner`** — Chrome **`beforeinstallprompt`** + **Install** button; iOS fallback with **Add to Home Screen** copy; snooze + installed flags in `localStorage` (same idea as Split The G)

### 🌓 Theme

- **`ThemeSync`** toggles `class="dark"` on `<html>` for Tailwind 4 custom dark variant styling
- CSS variables for surfaces, borders, and typography

## 🛠 Tech Stack

### Frontend

- **React 19**
- **Next.js 16** (App Router, **Turbopack** dev)
- **TypeScript 5**
- **Tailwind CSS 4**
- **Google Sans** ([Google Fonts](https://fonts.google.com/specimen/Google+Sans))

### Server

- **Sharp** — resize, mask, effects, flatten vs transparent PNG
- **archiver** — ZIP stream for download

### Quality

- **ESLint 9** + **`eslint-config-next`** (`eslint.config.mjs`)

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+** (recommended; aligns with Next / ESLint toolchains)
- **npm**

### Installation

```bash
git clone https://github.com/Rixouu/app-icon-generator.git
cd app-icon-generator
npm install
npm run dev
```

Default dev URL: [http://localhost:3000](http://localhost:3000)

### Sharp native module

If you see *Could not load the "sharp" module* for your OS/CPU:

```bash
npm install --include=optional sharp
```

See [Sharp — installation](https://sharp.pixelplumbing.com/install).

### Environment variables

No `.env` is required for local icon generation. Add secrets here only if you extend the app (e.g. analytics, auth).

## 📁 Project structure

```txt
app-icon-generator/
├── app/
│   ├── api/generate-icons/route.ts   # POST → ZIP
│   ├── components/                   # UI, preview, settings, PWA install banner, …
│   ├── manifest.ts                   # Web app manifest (PWA)
│   ├── globals.css                   # Theme tokens + Google Sans @import
│   ├── layout.tsx                    # Metadata, viewport, SW registration
│   └── page.tsx                      # Desktop + mobile workflow shell
├── public/
│   ├── icon-app-icon-generator.png   # App + PWA icon
│   └── sw.js                         # Minimal service worker
├── utils/
│   ├── IconGenerator.ts              # Sharp pipeline
│   └── iconStudio.ts                 # Shared platform exports, clipart, presets, defaults
├── next.config.mjs                   # serverExternalPackages: sharp, archiver
├── eslint.config.mjs
├── tailwind.config.ts
└── package.json                      # overrides: postcss ^8.5.10 (audit hygiene)
```

## 🔧 Available scripts

### Development

```bash
npm run dev              # Next dev (Turbopack)
```

### Build / run

```bash
npm run build            # Production build
npm start                # next start (after build)
```

### Code quality

```bash
npm run lint             # eslint .
```

### Tests

```bash
npm test
npm run test:watch
```

Docs:

- [ARCHITECTURE.md](file:///Users/cto/Documents/Repositories/02-Pro/app-icon-generator/docs/ARCHITECTURE.md)
- [TESTING.md](file:///Users/cto/Documents/Repositories/02-Pro/app-icon-generator/docs/TESTING.md)

## 🌟 Deep dive

### 🧠 Sharp pipeline

Background composition → foreground source render → optional shape mask → shadow / gloss → PNG export with opaque or alpha output depending on settings.

### 🗜 ZIP API

- Validates file + JSON settings
- Streams archive; handles empty icon list with JSON error
- Uses **`Uint8Array`** for `NextResponse` body typing on Next 16

### 📦 Export coverage

- **Android**: launcher PNG sizes plus Play Store asset
- **iOS**: App Store / iPhone / iPad icon matrix
- **Web / PWA**: favicon set, Apple touch icon, and manifest icons

### 🔐 Security notes

- **Do not** expose Sharp to untrusted huge payloads without size limits in production (consider `bodySizeLimit` / reverse proxy limits).
- Keep **Sharp** and **archiver** **externalized** in `next.config.mjs` so native bindings load correctly.

## 📊 Performance & SEO

- Static shell for `/`; API route is dynamic
- `metadata` + **viewport `themeColor`** aligned with brand purple `#7044ff`

## 🚀 Deployment

```bash
npm run build
npm start
```

Deploy on any **Node** host that supports the **Next** standalone or default server output. Ensure **Sharp** optional binaries match the deployment platform. **HTTPS** (or localhost) is required for PWA install prompts.

## 🤝 Contributing

1. Run **`npm run lint`** and **`npm run build`**
2. Open a PR describing UI vs server changes

## 📄 License

No `LICENSE` file is included in this repository; usage terms are at the maintainer’s discretion.

## 👥 Team

- **Jonathan** — Lead Developer — [Rixouu](https://github.com/Rixouu)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the App Router and metadata APIs
- [Sharp](https://sharp.pixelplumbing.com/) for fast image pipelines

---

**Built with care for designers and devs shipping real app icons.**
