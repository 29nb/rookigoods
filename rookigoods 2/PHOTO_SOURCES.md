# Product and editorial photo sources

All images live in `client/public/assets/rookigoods/` (copied to `docs/assets/rookigoods/` on build).

- **Product shots** (the four bandanas) use `classic-grid.jpg`, `daydream-grid.jpg`, `field-trip-grid.jpg` and `happy-hour.jpg`.
  The newer studio packshots from the Manus project (`/manus-storage/async-images/...`) were not in the export and do not exist on GitHub Pages,
  so these earlier photos are used instead. To switch back, drop your packshot files into `client/public/assets/rookigoods/`
  and change the four `image("...")` calls in `client/src/App.tsx`.
- **Campaign / styling** images: `male-bandana-*.jpg`.
- **Nature** images: `nature-*.jpg`.
