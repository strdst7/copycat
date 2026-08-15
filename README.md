# Copycat! — Style Transfer with Imagen 3.0

## > Reimagine any image in a brand-new visual style — powered by Google Imagen 3.0.

### Copycat! is a fast, elegant web app for artistic style transfer. Drop in an image, pick a style, and watch your subject be reborn in an entirely new look — right in the browser.

#### ✨ Features
- 🎨 Imagen 3.0 style transfer — reimagine images with a state-of-the-art generative model
- ⚡ Instant feedback — Vite hot-reload keeps the dev loop tight
- 📱 Responsive UI — great on desktop and mobile
- 🧩 Type-safe — fully typed React + TypeScript
- 🚀 Deploy-ready — pure static output

#### 🚀 Getting started

Prerequisites
- Node.js ≥ 18
- npm (bundled with Node.js)

Install dependencies
bash
npm install


Run the dev server
bash
npm run dev

Open the URL Vite prints (usually http://localhost:5173).

Build for production
bash
npm run build

Outputs an optimized static bundle to dist/.

Preview the production build
bash
npm run preview


#### 🧱 Tech stack

| Layer          | Tech               |
|----------------|--------------------|
| UI             | React + TypeScript |
| Build tool     | Vite               |
| Style transfer | Google Imagen 3.0  |

#### 📁 Project structure


copycat/
├── public/        # static assets
├── src/           # React source
├── index.html     # HTML entry
├── package.json
├── tsconfig.json
└── vite.config.ts


#### ☁️ Deploy

The dist/ folder is a fully static bundle — deploy to any static host.

Render (Static Site)
1. Build command: npm install && npm run build
2. Publish directory: dist

Also works out of the box with Netlify, Vercel, and GitHub Pages.

##### 🤝 Contributing

Contributions are welcome — open an issue to discuss significant changes, then submit a PR.

📄 License

MIT © strdst7
