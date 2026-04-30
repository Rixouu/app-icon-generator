# Architecture

## Overview

The app is a Next.js App Router project with a client-side editor and a server-side ZIP export endpoint.

## Core Flow

1. The user selects a source (image / clipart / text), background, shape, effects, and badge.
2. The preview renders the same composition logic as export.
3. Export sends a multipart request to the API route which generates PNG assets and streams a ZIP response.

## Key Modules

- UI shell and state orchestration: [page.tsx](file:///Users/cto/Documents/Repositories/02-Pro/app-icon-generator/app/page.tsx)
- Editor controls: [IconSettings.tsx](file:///Users/cto/Documents/Repositories/02-Pro/app-icon-generator/app/components/IconSettings.tsx)
- Preview rendering: [IconPreview.tsx](file:///Users/cto/Documents/Repositories/02-Pro/app-icon-generator/app/components/IconPreview.tsx)
- Export UI: [DownloadSection.tsx](file:///Users/cto/Documents/Repositories/02-Pro/app-icon-generator/app/components/DownloadSection.tsx)
- Export specs, defaults, and catalog data: [iconStudio.ts](file:///Users/cto/Documents/Repositories/02-Pro/app-icon-generator/utils/iconStudio.ts)
- Image generation pipeline: [IconGenerator.ts](file:///Users/cto/Documents/Repositories/02-Pro/app-icon-generator/utils/IconGenerator.ts)
- ZIP API endpoint: [route.ts](file:///Users/cto/Documents/Repositories/02-Pro/app-icon-generator/app/api/generate-icons/route.ts)

## API Contract

`POST /api/generate-icons`

- Multipart form fields:
  - `iconType`: `android | ios | web | all`
  - `settings`: JSON string of icon settings
  - `file`: optional foreground image
  - `backgroundFile`: optional background image
- Response:
  - Success: `application/zip`
  - Error: JSON with `error` and optional `details`

## PWA

- Manifest: [manifest.ts](file:///Users/cto/Documents/Repositories/02-Pro/app-icon-generator/app/manifest.ts)
- Service worker: [sw.js](file:///Users/cto/Documents/Repositories/02-Pro/app-icon-generator/public/sw.js)
- Install UI: [PwaInstallBanner.tsx](file:///Users/cto/Documents/Repositories/02-Pro/app-icon-generator/app/components/PwaInstallBanner.tsx)

