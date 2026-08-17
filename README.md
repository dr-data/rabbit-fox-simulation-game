# 🦊 Lotka–Volterra Predator–Prey Dynamics Simulator

An interactive, high-contrast, game-style Lotka–Volterra ecosystem simulator with retro ASCII graphics, Runge–Kutta 4th order (RK4) numerical integration, 2D phase space orbits, and backward time-series navigation.

---

## 🚀 Deploying to Cloudflare Pages from GitHub

This application is fully pre-configured for instant zero-configuration deployment to **Cloudflare Pages**.

### Method 1: Cloudflare Pages Direct GitHub Integration (Recommended)

1. Push this repository to your **GitHub** account.
2. In the [Cloudflare Dashboard](https://dash.cloudflare.com/), navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository.
4. Set the build settings:
   - **Framework preset**: `Vite` (or `None`)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js Version**: `20` (or `18`)
5. Click **Save and Deploy**. Cloudflare Pages will build and deploy your app globally on their edge network.

### Method 2: GitHub Actions Automated CI/CD

A complete GitHub Actions workflow is pre-configured in `.github/workflows/deploy.yml`:
1. In your GitHub repository settings, go to **Secrets and variables** > **Actions**.
2. Add the following repository secrets:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API Token with Pages deployment permissions.
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID.
3. Every push to `main` or `master` will automatically test, build, and deploy to Cloudflare Pages.

### Method 3: Local Wrangler CLI

```bash
# 1. Install dependencies
npm install

# 2. Build production assets
npm run build

# 3. Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=lotka-volterra-simulator
```

---

## 🎮 Features

- **Interactive Backward Timeline Navigation**:
  - Horizontal timeline slider to inspect past historical days across long simulations.
  - Step navigation buttons (`-15d`, `+15d`, `Day 0`, `Jump to Live`).
  - Available in both **Visual Vector Chart [1]** and **Retro ASCII Timeseries [4]**.
- **Event Trigger & Relief Markers**:
  - Visual indicators for shocks and ecological interventions (`☣` Plague Outbreak, `🌿` Plague Relieved, `❄` Severe Frost, `🥕` Vegetation Drop, `🦊` Fox Influx, `🐺` Apex Wolves, `🎯` Prey Cull, `🏹` Predator Hunt, `⚡` Climate Anomaly).
  - Hover cards with detailed event descriptions and impact stats.
- **5 Visualization Perspectives**:
  1. `[1] Visual Chart`: High-resolution SVG trajectories with area fills and equilibrium reference isoclines.
  2. `[2] Vector Field`: 2D phase-space portrait orbit with dynamic velocity arrows.
  3. `[3] Cycle Guide`: 4-quadrant ecological explainer breaking down trophic cascades.
  4. `[4] ASCII Plot`: Retro terminal time-series graph with interactive backward day navigation and event symbols.
  5. `[5] Math/ODE`: Live derivatives $\frac{dR}{dt}$, $\frac{dF}{dt}$, $\frac{dW}{dt}$, and Jacobian stability calculations.
- **Ecosystem Interventions**:
  - Outbreak diseases, trigger winter freezes, airdrop vegetation, introduce apex wolf packs, or conduct managed culls.
- **Challenge Trials**:
  - Guided game scenarios testing your ability to balance ecosystems against extinction and overpopulation.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `Space` | Pause / Resume simulation |
| `R` | Reset simulation to initial conditions |
| `S` | Cycle speed (0.5x, 1x, 2x, 5x) |
| `1` - `5` | Switch visualization view modes |
| `M` | Open Trials & Challenges Modal |
| `H` / `?` | Open Mathematical Guide |
| `←` / `→` | Navigate parameter controls |

---

## 📄 License

Apache-2.0
