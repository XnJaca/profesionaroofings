# Professional Roofing LLC — Landing

Static Astro site for Professional Roofing LLC (DMV roofing & remodeling).
Deployed as a static site on Render.

## Stack
- **Astro 5** (static, no SSR)
- **Sharp** for image optimization (responsive WebP at build time)
- **Poppins + Roboto** via Google Fonts
- Zero JS framework — small handcrafted islands for the mobile nav, testimonial carousel, and gallery lightbox.

## Project layout
```
src/
  assets/         optimized source images (run through Astro <Image />)
    hero/
    services/<slug>/
  components/     reusable Astro components (Hero, ServicesGrid, Gallery, …)
  data/           site, services & testimonials data
  layouts/        Layout.astro
  pages/
    index.astro
    services/[slug].astro    dynamic page per service
  styles/global.css
public/           favicon, robots.txt
```

## Local development
```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # produces ./dist
npm run preview
```

## Deploying to Render
1. Push this repo to GitHub.
2. On Render, create a **new Static Site** and connect the repo.
3. Render auto-detects `render.yaml`. Build command is `npm install && npm run build`, publish path `./dist`.

## Contact form
The form in `src/components/ContactCTA.astro` currently posts to a placeholder Formspree endpoint:
```
https://formspree.io/f/your_id
```
Replace `your_id` with your Formspree (or Web3Forms / Basin / Netlify Forms) form ID before going live.

## Updating content
- **Site info** (phone, email, license): `src/data/site.ts`
- **Services & galleries**: `src/data/services.ts`
- **Testimonials**: `src/data/testimonials.ts`
- **Images**: drop into `src/assets/services/<slug>/` and reference them from `services.ts`.

## Adding a new service
1. Create folder `src/assets/services/<new-slug>/` and add images.
2. In `src/data/services.ts`, import the images and append a new entry to the `services` array.
3. The `/services/[slug]` page is generated automatically.
