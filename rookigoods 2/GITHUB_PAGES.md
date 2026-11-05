# GitHub Pages

This project now includes a static HTML export for GitHub Pages.

## Option 1: automatic deployment

Push the repository to GitHub with the included `.github/workflows/pages.yml` file. In the repository settings, open **Pages**, choose **GitHub Actions** as the source, and push to `main`. The workflow runs `pnpm build:pages`, uploads the generated `docs/` site, and deploys it.

## Option 2: deploy the committed `docs/` folder

Run:

```bash
pnpm install
pnpm build:pages
```

Commit the generated `docs/` folder, then select **Deploy from a branch**, choose `main`, and choose `/docs` as the folder in the repository's **Pages** settings.

The export uses relative assets, includes a `404.html` fallback, and uses hash navigation so refreshes and deep links work on GitHub Pages project URLs such as `https://username.github.io/repository/`.

## Notes on this trimmed copy

- The repo is kept under 99 files so it can be uploaded through the GitHub web UI. The unused Express/tRPC/Drizzle backend, the unused UI-kit components, logs and Docker files were removed; the storefront itself is unchanged.
- Image paths are now relative (`import.meta.env.BASE_URL`), so they work on project URLs like `https://username.github.io/repository/`.
- `docs/` is the ready-to-serve build. If you change the source, run `pnpm build:pages` (or let the included workflow do it).
