# Local Media Viewer

Single-page Next.js app that shows:
- Two stacked video players on the left.
- Photo gallery + slideshow controls on the right.
- Media loaded from a local `stuff` folder outside the project.
- Uses hardcoded media root: `C:\Users\vm\stuff` (no `.env.local` needed).

## Folder Structure

Create this media folder on your machine:

```text
stuff/
  videos/
  photos/
```

Windows path used by this app:
- `C:\Users\vm\stuff`

Put supported files in each folder:
- Videos: `.mp4`, `.webm`, `.mov`
- Photos: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Features

- Responsive single-page layout (desktop split, mobile stacked).
- Two independent video selectors with duplicate-prevention toggle.
- Gallery thumbnails with large preview and lightbox dialog.
- Slideshow controls: play/pause, previous/next, interval, loop.
- Safe server-side file discovery and media serving via API routes.
- Missing folder / empty media states.

## Key Files

- `src/app/page.tsx`: page layout + client interactions.
- `src/app/api/media/route.ts`: media catalog endpoint.
- `src/app/api/media/[kind]/[...slug]/route.ts`: safe media serving endpoint.
- `src/lib/media-config.ts`: root path config and safety helpers.
- `src/lib/media-files.ts`: media discovery and filtering.
- `src/components/media/*`: modular UI panels (video, gallery, slideshow, lightbox).

## Notes

- This app is intended for localhost usage with local files.
- No `.env.local` setup is required.
