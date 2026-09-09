# AI Image Generator

A responsive Next.js implementation of the provided Figma design.

## Features

- Food image analysis flow with upload preview and loading/result states
- Ingredient recognition from a food description
- Food image creator result view
- Floating chat assistant
- Responsive desktop and mobile layout
- Shared design tokens based on the Figma file

The current interactions use demo results so the UI works without exposing an API key. Real AI endpoints can be connected in the next step.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env.local` when adding server-side AI endpoints. Never expose an AI provider secret with a `NEXT_PUBLIC_` prefix.
