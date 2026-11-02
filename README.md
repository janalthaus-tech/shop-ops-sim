# Shop Ops Sim

One Vite + React 19 + TypeScript app that combines two training tools for auto repair shops:

| Route | Module | Source |
|---|---|---|
| `/` | Landing page linking to both | new |
| `/board`, `/board/flow` | **Board**: kanban "Board" training simulator (scenarios, magnets, tutorial, decision demo, debrief, flow guide) | [board-sim](https://github.com/janalthaus-tech/board-sim) |
| `/finance` | **Finance**: P&L, balance sheet and KPI calculator (inputs, presets, print summary) | [shop-financial-sim](https://github.com/janalthaus-tech/shop-financial-sim) |

The original repos stay as they are; this repo is an integrated copy.

## Structure
```
src/
  main.tsx, App.tsx, shell.css   # BrowserRouter + shared top nav (Board | Finance)
  bridge.ts                      # stub: board throughput (ROs/day, ARO) -> finance inputs (not wired)
  board/                         # board-sim src (App, components, model, board.css)
  finance/                       # shop-financial-sim src (App, components, hooks, model, finance.css)
ios/, android/                   # Capacitor native projects (from board-sim)
```

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build -> dist/
```

## CSS scoping
- Finance CSS is wrapped in `.finance-app { ... }` with native CSS nesting, so its variables, body background, and classes like `.card` and `.btn` don't leak.
- Board CSS stays mostly global, because it sets the html/body viewport height. Its colliding selectors (`.btn`, `.card`, `.footer`, the `button`, `h1`, `h2` and `p` resets) are scoped to `.board-app`.

## Capacitor
- `capacitor.config.ts`: `appId: com.shopopssim.app` and `appName: Shop Ops Sim`, `webDir: dist`.
- `vite.config.ts` uses `base: './'` so the WebView loads bundled assets.
- `npm run cap:sync` builds and syncs; `npm run cap:ios` / `npm run cap:android` open the native projects.
- The `ios/` and `android/` folders were copied from board-sim and still use the old bundle id `com.boardsim.app` in their native files (Xcode project, `build.gradle`, `strings.xml`). Change those, or regenerate with `npx cap add ios|android`, before you ship a store build under the new id.

## Deploy
`vercel.json` rewrites every path to `index.html` so SPA routes like `/board/flow` and `/finance` work.

All figures are illustrative. This is not financial advice and not an official Shop Fix Academy product.
