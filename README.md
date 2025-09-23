# BrewMaestro Landing Page

Production-ready marketing landing page for **BrewMaestro™**, built with Next.js 14 (App Router), TypeScript, and Tailwind CSS. The design system follows the BrewMaestro brand tokens, supports light/dark modes, and includes accessibility and SEO best practices.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS with CSS variables for brand colors
- ESLint + Prettier
- Jest + Testing Library

## Getting Started

Install dependencies with the package manager of your choice:

```bash
pnpm install
# or
npm install
# or
yarn install
```

Run the development server:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
pnpm start
```

Run tests:

```bash
pnpm test
```

## Project Structure
- `app/` – App Router entrypoints (`layout.tsx`, `page.tsx`, global styles).
- `components/` – Reusable UI building blocks (hero, value props, FAQ, etc.).
- `lib/seo.ts` – Metadata helpers for SEO and social sharing.
- `public/` – Static assets (logo, Open Graph image placeholders).

## Theming
- Light theme base: Yeast Cream.
- Dark theme base: Deep Brew.
- Users can toggle themes; preferences persist in `localStorage` and respect `prefers-color-scheme`.
- Focus states: water blue on light, maestro amber on dark.

## Brand Tokens
Brand colors live in `app/globals.css` as CSS variables, exposing them in Tailwind via `tailwind.config.ts`. Adjust the tokens or add new ones there.

## Assets
- `public/logo.svg` – Placeholder lockup combining barley + hop to form an “M”. Replace with the final logo when available.
- `public/hero-visual.svg` – Hero illustration placeholder.
- `public/og.jpg` – Social sharing placeholder. Swap this file with a production-ready 1200×630 JPEG to control OG/Twitter previews.

## Accessibility & SEO
- Skip link, semantic sections, and focus-visible styling.
- Metadata configured for canonical, Open Graph, and Twitter cards.
- Icons from `lucide-react`, monochrome 24×24, 2px stroke.

## Testing Notes
Tests live in `__tests__/` and cover hero CTAs, navigation aria-labels, and theme persistence. Extend with integration tests as feature work grows.

## Replacing the Demo
The interactive demo section (`#demo`) ships with a static mock. Swap it with a live embed or animation by updating `DemoSection` in `app/page.tsx`.
