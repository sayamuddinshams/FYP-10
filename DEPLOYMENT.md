# Deploying RentLink

The front end lives in `frontend/` and is a static single-page app built with Vite.
The GitHub Actions workflow at `.github/workflows/deploy.yml` builds it and publishes
it to GitHub Pages.

## Automatic deploy (current setup)

Every push to `main` (or a manual **workflow_dispatch** run) does the following:

1. Installs dependencies from `frontend/package-lock.json`.
2. Builds the app with `npm run build` in `frontend/`.
3. Copies `frontend/dist/index.html` to `frontend/dist/404.html` so deep links to
   client-side routes (for example `/property/p1`) resolve correctly on Pages.
4. Uploads `frontend/dist` and deploys it.

### One-time repository setup

In **Settings → Pages**, set **Source** to **GitHub Actions**. No branch folder is
required. After the first successful workflow run the site is available at:

```
https://sayamuddinshams.github.io/FYP-10/
```

The Pages project path (`/FYP-10/`) is applied through the `VITE_BASE` environment
variable in the workflow. `frontend/vite.config.js` falls back to `/FYP-10/` when the
variable is not set, so a plain `npm run build` also produces a Pages-ready bundle.

## Connect a custom domain later

When you are ready to use a custom domain (for example `rentlink.pk`):

1. **Choose where DNS is managed.** Add a `CNAME` record pointing your domain to
   `sayamuddinshams.github.io`, or the four GitHub Pages `A` records for an apex domain:
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
2. **Tell GitHub Pages.** In **Settings → Pages → Custom domain**, enter the domain and
   save. GitHub writes a `CNAME` file to the published site. Enable **Enforce HTTPS**
   once the certificate is issued.
3. **Fix the asset base path.** The site is currently built for a project path
   (`/FYP-10/`). For a custom domain the app must be served from the root instead. In
   `.github/workflows/deploy.yml` change the `VITE_BASE` value under the **Build** step
   from `/${{ github.event.repository.name }}/` to `/`:

   ```yaml
   - name: Build
     run: npm run build
     env:
       VITE_BASE: /
   ```

   Then push to `main`. Until this change is made, assets will 404 on the custom domain.
4. **Update the SPA fallback if needed.** The `404.html` step already covers client-side
   routes on both project paths and custom domains.

## Local development

```bash
cd frontend
npm install
npm run dev       # http://localhost:5174
npm run build     # production bundle in frontend/dist
npm run preview   # serve the production bundle
```

To preview the production bundle at the root path: `VITE_BASE=/ npm run preview`.
