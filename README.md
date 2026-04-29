# Secure Photo Blur

![Secure Photo Blur](public/socialpreview@2.png)

**[Try it live](https://securephotoblur.com/)**

Privacy-first photo anonymization — offline, open-source, no personal data collected.

## What it does

Blur faces and sensitive areas in photos before sharing them publicly. Automatic face detection finds faces for you; you can adjust, add, or remove regions manually.

## How it works

The whole thing is a static web page with no backend — you can switch to airplane mode and it still works (PWA, fully offline after first load), or open DevTools → Network on desktop and see for yourself that no photos are ever uploaded. There's no personal data collection, no auth; anonymous page-view analytics via Cloudflare Web Analytics (no cookies, no fingerprinting). Strict Content Security Policy, Referrer-Policy: no-referrer, and camera/mic/geolocation permissions are explicitly disabled. The code is open source and auditable — around 2,000 lines of Preact + TypeScript under a PolyForm Noncommercial 1.0 license — with face detection running locally through [@vladmandic/human](https://github.com/vladmandic/human) (BlazeFace), model weights bundled, no external requests at runtime.

## Blur methods

| Method | Security | How it works |
|--------|----------|-------------|
| Mosaic | High | Pixelates to ~5x5 blocks — irreversible |
| Solid black | Maximum | Covers with solid black — zero information left |
| Solid average color | Maximum | Fills with region's average color — no structural detail |
| Gaussian blur | Low | Soft blur — research shows AI can reverse it |

## Long nerdy details

- **Face detection** — automatically pre-selects faces as useful starting regions; you can adjust, add, or remove any area before exporting. BlazeFace model via @vladmandic/human, GPU-accelerated (WebGL), self-hosted — no external CDN, no network calls.
- **Irreversible blur** — Adaptive mosaic reduces faces to ~5×5 effective pixels (min block 12px; below 8px is reversible via super-resolution). Solid fill sets every pixel to R=G=B=0. Gaussian blur is rated LOW: reversible per Revelio (arXiv:2506.12344) and Fantômas (PoPETs 2024).
- **Network isolation** — Content-Security-Policy blocks all external connections except anonymous page-view analytics (Cloudflare Web Analytics — no cookies, no personal data, no tracking pixels). Your photos never leave your device.
- **Metadata stripping** — Canvas re-rendering inherently strips all EXIF/GPS data. No metadata survives export.
- **Open source** — [source code on GitHub](https://github.com/secure-photo-blur/secure-photo-blur) for everyone to audit.

## Languages

English, Italian, German, French, Spanish — auto-detected from browser locale, switchable from the navbar.

## Supported formats

JPEG, PNG, WebP, HEIC/HEIF. All EXIF/GPS metadata is automatically stripped on export.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build    # output in ./dist
npm run preview  # preview the build
```

## Tech stack

- [Preact](https://preactjs.com/) + TypeScript
- [Vite](https://vitejs.dev/) with PWA plugin (Workbox)
- [@vladmandic/human](https://github.com/vladmandic/human) — BlazeFace face detection, GPU-accelerated via WebGL
- [heic2any](https://github.com/nicolo-ribaudo/heic2any) — HEIC/HEIF conversion
- Deployed on [Cloudflare Pages](https://pages.cloudflare.com/)

## License

[PolyForm Noncommercial 1.0](LICENSE) — free to use, not for commercial purposes.
