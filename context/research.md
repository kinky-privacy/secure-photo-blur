# Building an open-source Privacy Image Blur PWA

**No existing tool combines open-source licensing, offline PWA architecture, in-browser face detection, metadata stripping, and mobile-first design into a single application.** This gap creates a clear opportunity. The research below provides a concrete technical blueprint — from ML model selection to pixel-level security guarantees — to build that tool. Every recommendation prioritizes zero-server, offline-first operation suitable for activists, journalists, and privacy-conscious users.

---

## Face detection that actually works on every browser

The critical constraint for in-browser face detection is **iOS Safari compatibility**, which eliminates otherwise-excellent options. Google's MediaPipe `@mediapipe/tasks-vision` offers the smallest face detection model (~200 KB for BlazeFace short-range) with sub-millisecond inference on mobile GPUs, but **multiple GitHub issues document failures on iOS Safari and Chrome-on-iOS** due to its WASM+WebGL pipeline. For a PWA that must work universally, this is disqualifying as the sole detection engine.

**The recommended primary library is `@vladmandic/human`** (GitHub: vladmandic/human, ~3,000 stars, MIT license). It bundles face detection (BlazeFace variant), body pose detection (MoveNet), body segmentation (Google Selfie Segmentation), and object detection (CenterNet with MobileNet v3) into a single package built on TensorFlow.js. Because it uses TensorFlow.js's WebGL backend rather than raw MediaPipe WASM, it **works reliably on Safari and iOS**. The API is straightforward — `const result = await human.detect(input)` — and it supports Web Workers for non-blocking inference. Total model download runs **10–15 MB with all models enabled**, but the library allows loading only needed models.

For teams wanting a lighter footprint, **TensorFlow.js `@tensorflow-models/face-detection`** with the `tfjs` runtime (not the `mediapipe` runtime) provides BlazeFace at ~400 KB model weight with broad browser compatibility including Safari. It achieves **15–30 FPS on mobile** via the WebGL backend. The package hasn't seen updates in two years but remains functional because the underlying TensorFlow.js runtime continues to be maintained.

The original `face-api.js` (16.5K GitHub stars) is **dead** — last meaningful commit was 2020, pinned to TensorFlow.js 1.7.4. The actively maintained fork `@vladmandic/face-api` updates it to TFJS 4.16, but its author recommends migrating to `@vladmandic/human`. ONNX Runtime Web and Transformers.js offer maximum flexibility but require significantly more integration effort and produce larger bundles (10–50+ MB).

For **full-body/person blurring**, `@tensorflow-models/body-segmentation` with MediaPipe Selfie Segmentation provides pixel-level person-vs-background masks at ~21 FPS on iPhone X. This enables blurring entire people, not just faces. The COCO-SSD model (~5 MB) can detect "person" bounding boxes across browsers for rectangular person blur. `@vladmandic/human` includes both capabilities, making it the single-library solution for face and body anonymization.

| Library | Model size | Mobile FPS | Safari/iOS | Maintained |
|---------|-----------|------------|------------|------------|
| `@vladmandic/human` | 10–15 MB (configurable) | 15–30 | ✅ Works | ✅ Active |
| MediaPipe tasks-vision | 200 KB + 5 MB WASM | 30–60 | ⚠️ Broken | ✅ Google |
| TFJS face-detection | ~400 KB | 15–30 | ✅ Works | ❌ Stale |
| face-api.js (original) | 190 KB–5.4 MB | 10–25 | ✅ Works | ❌ Dead |

---

## Gaussian blur is not secure — what to use instead

A June 2025 paper, "Revelio: Restoring Gaussian Blurred Face Images for Deanonymization Attacks" (arXiv:2506.12344), demonstrates that **Gaussian blur is vulnerable to reconstruction even at kernel size 81**. The attack exploits diffusion model memorization: if an attacker's model has seen other images of the target person, it can reconstruct identity from heavily blurred photos. The paper explicitly recommends that photo-processing software display warnings when users apply Gaussian blur for anonymization.

This finding joins a growing body of research. The "Fantômas" paper (PoPETs 2024, arXiv:2210.10651) tested 14 anonymization techniques with ML-based attackers and found **10 of 14 are at least partially reversible**, including Gaussian blur, Gaussian noise, and moderate pixelization. Only methods that completely replace face content — such as solid color fill or synthetic face generation — resisted all attacks.

For pixelization specifically, the security picture is more nuanced. Block sizes of **8×8 or smaller are trivially reversible** — Positive Security demonstrated recovering license plates and IBANs from 10×10 pixelated video using multi-frame super-resolution. However, single-image pixelation at ≥16×16 blocks becomes substantially harder to attack, and **≥24×24 blocks reduce a typical 128×128 face region to just 5×5 effective pixels**, destroying virtually all identity information.

**The recommended approach is a layered defense:**

1. **Primary method: Mosaic pixelization** with a minimum block size of 16px (default 24px). This destroys spatial information through irreversible averaging.
2. **Secondary layer: Random noise overlay** (Gaussian noise, σ ≥ 30) applied over the pixelized region. This defeats ML-based pattern matching that exploits the structured nature of pixelization.
3. **Maximum security option: Solid color fill** (black/white bar). This destroys 100% of pixel information and is provably irreversible.
4. **Extend blur boundaries** 10–20% beyond detected face regions to prevent edge artifacts from leaking identity cues.

Signal's blur tool uses Gaussian blur exclusively — `ScriptIntrinsicBlur` on Android with max radius 25 plus 0.25× bitmap downscaling, and `CIGaussianBlur` on iOS. Given the Revelio findings, **Signal's approach is potentially vulnerable** to sophisticated attackers. ObscuraCam (Guardian Project, github.com/guardianproject/ObscuraCam) offers both pixelation and solid "redact" modes, making its redact mode the more secure option.

**Browser memory safety is an inherent limitation.** JavaScript provides no equivalent to C's `SecureZeroMemory()`. After applying blur, best practices include zeroing `ImageData.data` arrays with `.fill(0)`, clearing canvases with `clearRect()` plus resizing to 0×0, revoking all Object URLs, and processing in Web Workers whose memory is more reliably freed on termination. However, GPU texture memory can retain image data (documented in Seoul National University research on GPU memory remanence), and browser heap dumps can reveal image artifacts even after cleanup. The application should document this limitation transparently — for high-security scenarios, users should process images on air-gapped devices running Tails OS.

---

## A Signal-inspired interaction model for desktop and mobile

Signal's blur tool established the gold standard: **auto-detect faces with one tap, then paint additional blur with a finger/mouse brush**. This two-mode approach — automatic detection plus manual touch-up — covers the vast majority of use cases with minimal cognitive load. The brush metaphor maps naturally to touchscreens (users understand "finger painting") and translates directly to mouse interaction on desktop.

The core interaction architecture should use **Pointer Events API** exclusively, which unifies mouse, touch, and pen input. One-finger/mouse draws blur when a tool is active; two-finger gestures always pan and zoom regardless of active tool. This eliminates the need for explicit mode toggles — the gesture itself disambiguates intent. Setting `touch-action: none` on the canvas element is critical to prevent browsers from intercepting touch gestures for native scrolling.

For **undo/redo**, a command/action stack outperforms bitmap snapshots. Each blur stroke or rectangle is stored as data (`{ type: 'brushStroke', path: [...points], brushSize: 20 }`), and undo re-renders all remaining actions from the original image. This uses far less memory than storing full canvas snapshots (~4 MB each for 1080p) and naturally supports the commit workflow: during editing, all actions are reversible; on export, the final image is rendered at full resolution and all edit history is discarded.

The **commit flow** should follow three phases. In the editing phase, users add blur regions freely with full undo/redo. Tapping "Export" triggers a confirmation dialog — "This permanently applies blur to a new image. Your original photo is not changed." — then renders the final image, strips metadata, and offers download or sharing. The original file is never modified.

**Layout adapts by viewport**: on desktop (>768px), the toolbar lives on the left sidebar with canvas centered; on mobile (<768px), the canvas fills the viewport width and the toolbar sits at the bottom within thumb reach. The toolbar should contain at most 5 icons: Blur Brush, Rectangle Blur, Undo, Redo, and Export. Brush size is adjustable via long-press or a dedicated slider, defaulting to a size large enough to cover a face in 2–3 strokes.

For live preview performance on mobile, blur should render at display resolution during editing, not source resolution. The native `ctx.filter = 'blur(10px)'` combined with `drawImage()` is GPU-accelerated in most browsers and dramatically faster than manual pixel manipulation. Full-resolution blur is applied only during final export. On low-end devices, preview updates can be deferred to `pointerup` (after stroke completion) rather than during stroke movement.

---

## Preact, Vite, and a 50 KB app shell

The ML model dominates the total payload at 5–15 MB regardless of framework choice, making the framework's runtime size a rounding error. Still, **Preact + Vite** offers the best balance: a **~3 KB gzipped runtime** with React-compatible APIs (hooks, JSX, component model), plus access to the React ecosystem via the compatibility layer. Svelte 5 compiles to ~1.6 KB runtime and is an excellent alternative. SolidJS (7 KB) provides top-tier benchmark performance but has a smaller ecosystem. Full React 19 adds 42 KB of unnecessary overhead.

The **`vite-plugin-pwa`** plugin provides zero-config PWA setup with Workbox under the hood and works identically across all framework choices. The build configuration should precache the app shell (HTML, CSS, JS) and use cache-first runtime caching for ML model files (.tflite, .wasm), which are versioned and immutable. Setting `maximumFileSizeToCacheInBytes` to 10 MB accommodates WASM runtimes. After first visit, the entire application including ML models serves from cache, enabling **full offline operation**.

For image processing, **Canvas 2D with OffscreenCanvas in a Web Worker** keeps the UI responsive during blur operations. OffscreenCanvas reached Baseline Widely Available status in September 2025 (Chrome 69+, Firefox 105+, Safari 16.4+). A 12 MP image requires ~48 MB in RGBA memory; creating working copies can push total memory past 150 MB. The critical constraint is **iOS Safari's 16.7 MP canvas pixel limit** — a 48 MP iPhone photo exceeds this and will silently fail. The application must detect image dimensions via `createImageBitmap(blob)` and downscale for editing when necessary, mapping face detection coordinates back to original dimensions for full-resolution export.

**Lazy-loading the ML model is essential.** The app shell loads instantly from cache (~50–80 KB). When the user selects an image, the face detection module loads via dynamic `import()` — Vite automatically code-splits this. The WASM runtime and model files should be self-hosted in the `/public` directory rather than loaded from CDN, ensuring offline availability after first cache. During the initial model download (~5 MB), the UI shows a progress indicator and allows manual brush use immediately — face detection becomes available once the model finishes loading.

| Component | Size (gzipped) |
|-----------|---------------|
| Preact runtime | ~3 KB |
| Application code | ~15–30 KB |
| CSS | ~5–10 KB |
| **App shell total** | **~50–80 KB** |
| ML WASM runtime (lazy) | ~4–5 MB |
| BlazeFace model (lazy) | ~200 KB |
| **Total with ML (cached)** | **~5.5 MB** |

For hosting, **Cloudflare Pages** provides unlimited bandwidth (critical when serving 5 MB WASM files) with the fastest global CDN on a generous free tier. GitHub Pages is the simplest option for open-source projects with integrated GitHub Actions CI/CD, though its 100 GB/month bandwidth cap could constrain high-traffic usage.

---

## Metadata stripping and HEIC are solved problems

**Canvas `toBlob()` and `toDataURL()` automatically strip all EXIF, IPTC, XMP, and GPS metadata.** When an image is drawn to a Canvas and re-exported, the output contains only pixel data — no metadata survives. This was confirmed in WHATWG specification discussions and is the technique used by every browser-based EXIF removal tool. This makes Canvas re-encoding the zero-dependency, zero-configuration solution for metadata stripping, and it's inherent to the application's export pipeline.

For optional verification, **exifr** (npm: `exifr`, mini browser build ~9 KB gzipped) can confirm that exported images contain no metadata. It reads JPEG, HEIC, TIFF, AVIF, and PNG metadata in ~2.5 ms per photo. **piexifjs** (~12 KB) can explicitly remove EXIF from JPEG files and serves as a belt-and-suspenders layer, though Canvas re-encoding makes it redundant for most workflows.

**HEIC handling requires a polyfill** since only Safari has reliable native support. Chrome, Firefox, and Android browsers cannot decode HEIC natively. **heic2any** (npm: `heic2any`, ~543K weekly downloads) is the most popular solution, wrapping libheif compiled to JavaScript. At ~2.7 MB, it's heavy but should be **lazy-loaded only when a HEIC file is detected** — the vast majority of users will load JPEG/PNG files and never trigger this download. The conversion is CPU-intensive (2–5 seconds on older phones), so it should run with a loading indicator. For applications requiring strict Content Security Policy without `unsafe-eval`, **heic-to** provides a CSP-friendly alternative built on newer libheif releases.

The **Web Share API** covers ~92% of global browser usage (Chrome 128+, Safari 12.1+, Edge 95+, Samsung Internet 8.2+) but **Firefox does not support it at all**. The implementation should wrap shared blobs as `File` objects (`new File([blob], 'blurred-image.jpg', { type: 'image/jpeg' })`) and fall back to `<a download>` with `URL.createObjectURL()` for unsupported browsers. Export should default to **JPEG at 0.85 quality** — visually indistinguishable from the original, with 40–60% file size reduction. PNG should be offered for lossless output when needed.

The application should enforce a **strict Content Security Policy**: `default-src 'self'; script-src 'self'; img-src 'self' blob: data:; worker-src 'self' blob:; object-src 'none'`. Additional headers — `Referrer-Policy: no-referrer`, `Permissions-Policy: geolocation=(), camera=(), microphone=()` — reinforce the privacy posture. The application should be **completely stateless**: never persist images to IndexedDB, localStorage, or Cache API. Process in memory, export, and discard.

---

## The competitive landscape has a clear gap

The closest open-source web competitor is **Image Scrubber** (github.com/everestpipkin/image-scrubber), created during the 2020 protests. It runs client-side, works offline, strips EXIF data, and supports brush-based manual blur — but it has **no auto face detection**, a 2500×2500 pixel limit, and minimal maintenance. Every commercial tool with auto face detection (Facepixelizer, Abraia, Imagy.app) is closed-source. Signal's blur tool has excellent UX and auto-detection but is locked inside the Signal messaging app. ObscuraCam is Android-only, semi-abandoned, and runs on an outdated codebase.

**No existing tool combines all of**: open-source code, installable PWA, offline-first operation, in-browser face detection, multiple redaction modes with security guidance, EXIF stripping, and mobile-first design. This is the gap.

| Tool | Open source | PWA/offline | Auto face detect | EXIF strip | Mobile-first |
|------|:-----------:|:-----------:|:----------------:|:----------:|:------------:|
| Signal Blur | ✅ (app code) | ❌ (native only) | ✅ | ✅ | ✅ |
| ObscuraCam | ✅ | ❌ (Android) | ✅ | ✅ | ✅ |
| Image Scrubber | ✅ | Partial | ❌ | ✅ | ✅ |
| Facepixelizer | ❌ | ❌ | ✅ | ❌ | ❌ |
| Redact.photo | ❌ | ❌ | ❌ | ❓ | Partial |
| **This project** | ✅ | ✅ | ✅ | ✅ | ✅ |

Demand is validated by Signal developing blur tools during record download spikes in 2020, Image Scrubber going viral on Hacker News, ObscuraCam winning a Knight News Challenge, and the continuous emergence of new tools (CodeShack, Imagy.app, redact.miski.studio) through 2024–2025. GDPR compliance needs and ongoing global activism sustain this demand.

---

## Conclusion: the recommended architecture

The application should load as a **~50 KB app shell** that renders instantly from service worker cache. When the user selects an image, the face detection module loads lazily (~5 MB, cached after first use). `@vladmandic/human` runs BlazeFace detection in a Web Worker, returning bounding boxes in 10–50 ms. The user sees auto-detected faces with blur preview and can paint additional regions with a brush tool. Blur uses **mosaic pixelization at 24px blocks with noise overlay** — not Gaussian blur, which 2025 research proves vulnerable. Export renders at full resolution via Canvas `toBlob('image/jpeg', 0.85)`, which inherently strips all metadata. The Web Share API offers direct sharing with download fallback.

Three design decisions will differentiate this project from everything else in the market. First, **security-honest defaults** — defaulting to pixelization+noise rather than aesthetically pleasing but insecure Gaussian blur, with clear documentation of each method's security properties. Second, **progressive capability loading** — the app is usable for manual blur within 50 KB, with face detection enhancing the experience once cached. Third, **radical transparency** — open-source code, documented threat model including browser memory limitations, and no analytics or tracking of any kind. This combination of security rigor, lightweight architecture, and accessibility creates a tool that the privacy and activism communities currently lack.